use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::path::PathBuf;
use std::env;

// ===== Error Types =====

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize)]
pub enum AdbError {
    NoDeviceConnected,
    AdbNotFound,
    AdbServerNotRunning,
    DeviceOffline,
    DeviceUnauthorized,
    PermissionDenied,
    Timeout,
    CommandFailed(String),
    ParseError(String),
}

impl std::fmt::Display for AdbError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AdbError::NoDeviceConnected => write!(f, "No Android device connected. Please connect a device via USB or TCP."),
            AdbError::AdbNotFound => write!(f, "ADB (Android Debug Bridge) not found. Please install Android SDK Platform Tools."),
            AdbError::AdbServerNotRunning => write!(f, "ADB server is not running. Try running 'adb start-server'."),
            AdbError::DeviceOffline => write!(f, "Device is offline. Please check the USB connection or reconnect the device."),
            AdbError::DeviceUnauthorized => write!(f, "Device is unauthorized. Please check the device screen for USB debugging authorization prompt."),
            AdbError::PermissionDenied => write!(f, "Permission denied. Try running the application with elevated privileges."),
            AdbError::Timeout => write!(f, "ADB command timed out. Please check your device connection."),
            AdbError::CommandFailed(msg) => write!(f, "ADB command failed: {}", msg),
            AdbError::ParseError(msg) => write!(f, "Failed to parse ADB output: {}", msg),
        }
    }
}

pub type AdbResult<T> = Result<T, AdbError>;

// ===== Future Functions (Not Yet Used) =====
// Suppress warnings for functions we'll use later
#[allow(dead_code)]// ===== Device Info =====

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceInfo {
    pub serial: String,
    pub state: String,
    pub model: Option<String>,
    pub product: Option<String>,
    pub device: Option<String>,
    pub transport_id: Option<String>,
}

// ===== Device Cache =====

struct DeviceCache {
    devices: Vec<DeviceInfo>,
    last_update: Instant,
    cache_duration: Duration,
}

impl DeviceCache {
    fn new() -> Self {
        Self {
            devices: Vec::new(),
            last_update: Instant::now() - Duration::from_secs(10), // Force initial fetch
            cache_duration: Duration::from_secs(5),
        }
    }

    fn is_expired(&self) -> bool {
        self.last_update.elapsed() > self.cache_duration
    }

    fn update(&mut self, devices: Vec<DeviceInfo>) {
        self.devices = devices;
        self.last_update = Instant::now();
    }

    fn get(&self) -> Vec<DeviceInfo> {
        self.devices.clone()
    }
}

lazy_static::lazy_static! {
    static ref DEVICE_CACHE: Arc<Mutex<DeviceCache>> = Arc::new(Mutex::new(DeviceCache::new()));
}

// ===== ADB Path Detection =====

/// Auto-detect ADB executable path
fn find_adb_path() -> Option<PathBuf> {
    // 1. Check if 'adb' is in PATH
    if let Ok(output) = Command::new("adb").arg("version").output() {
        if output.status.success() {
            return Some(PathBuf::from("adb"));
        }
    }

    // 2. Check common installation paths
    let mut common_paths: Vec<PathBuf> = Vec::new();
    
    if cfg!(target_os = "windows") {
        common_paths.push(PathBuf::from(r"C:\platform-tools\adb.exe"));
        common_paths.push(PathBuf::from(r"C:\Program Files (x86)\Android\android-sdk\platform-tools\adb.exe"));
        common_paths.push(PathBuf::from(r"C:\Android\sdk\platform-tools\adb.exe"));
        if let Ok(p) = env::var("LOCALAPPDATA") {
            common_paths.push(PathBuf::from(p).join(r"Android\Sdk\platform-tools\adb.exe"));
        }
        if let Ok(p) = env::var("USERPROFILE") {
            common_paths.push(PathBuf::from(p).join(r"AppData\Local\Android\Sdk\platform-tools\adb.exe"));
        }
    } else if cfg!(target_os = "macos") {
        common_paths.push(PathBuf::from("/usr/local/bin/adb"));
        if let Ok(p) = env::var("HOME") {
            common_paths.push(PathBuf::from(p).join("Library/Android/sdk/platform-tools/adb"));
        }
    } else {
        common_paths.push(PathBuf::from("/usr/bin/adb"));
        common_paths.push(PathBuf::from("/usr/local/bin/adb"));
        if let Ok(p) = env::var("HOME") {
            common_paths.push(PathBuf::from(p).join("Android/Sdk/platform-tools/adb"));
        }
    }

    // 3. Try each path
    for path in common_paths {
        if path.exists() {
            return Some(path);
        }
    }

    None
}

// Get ADB executable path (with caching)
lazy_static::lazy_static! {
    static ref ADB_PATH: Option<PathBuf> = find_adb_path();
}

fn get_adb_command() -> AdbResult<&'static PathBuf> {
    ADB_PATH.as_ref().ok_or(AdbError::AdbNotFound)
}

// ===== Core ADB Functions =====

/// Check if ADB is available and working
pub fn check_adb_available() -> bool {
    if let Ok(adb_path) = get_adb_command() {
        if let Ok(output) = Command::new(adb_path).arg("version").output() {
            return output.status.success();
        }
    }
    false
}

/// Execute ADB command with timeout and error handling
pub fn execute_adb_command(args: Vec<&str>) -> AdbResult<String> {
    let adb_path = get_adb_command()?;

    // Build command
    let mut cmd = Command::new(adb_path);
    for arg in &args {
        cmd.arg(arg);
    }

    // Execute with timeout (30 seconds)
    let output = cmd
        .output()
        .map_err(|e| AdbError::CommandFailed(format!("Failed to execute ADB: {}", e)))?;

    // Check exit status
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let error_msg = stderr.trim();

        // Parse common error patterns
        if error_msg.contains("no devices/emulators found") || error_msg.contains("device not found") {
            return Err(AdbError::NoDeviceConnected);
        } else if error_msg.contains("device offline") {
            return Err(AdbError::DeviceOffline);
        } else if error_msg.contains("device unauthorized") {
            return Err(AdbError::DeviceUnauthorized);
        } else if error_msg.contains("cannot connect to daemon") || error_msg.contains("daemon not running") {
            return Err(AdbError::AdbServerNotRunning);
        } else if error_msg.contains("permission denied") || error_msg.contains("access denied") {
            return Err(AdbError::PermissionDenied);
        } else {
            return Err(AdbError::CommandFailed(error_msg.to_string()));
        }
    }

    // Return stdout
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(stdout)
}

/// Parse ADB devices output
pub fn parse_adb_devices(output: String) -> Vec<DeviceInfo> {
    let mut devices = Vec::new();

    for line in output.lines() {
        let line = line.trim();

        // Skip header and empty lines
        if line.is_empty() || line.starts_with("List of devices") || line.starts_with("*") {
            continue;
        }

        // Parse device line
        // Format: "serial    state    product:xxx model:xxx device:xxx transport_id:xxx"
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let serial = parts[0].to_string();
        let state = parts[1].to_string();

        // Parse additional properties
        let mut device_info = DeviceInfo {
            serial,
            state,
            model: None,
            product: None,
            device: None,
            transport_id: None,
        };

        // Extract model, product, device, transport_id from remaining parts
        for part in parts.iter().skip(2) {
            if let Some((key, value)) = part.split_once(':') {
                match key {
                    "model" => device_info.model = Some(value.to_string()),
                    "product" => device_info.product = Some(value.to_string()),
                    "device" => device_info.device = Some(value.to_string()),
                    "transport_id" => device_info.transport_id = Some(value.to_string()),
                    _ => {}
                }
            }
        }

        devices.push(device_info);
    }

    devices
}

/// Get list of connected devices (with caching)
pub fn get_devices(force_refresh: bool) -> AdbResult<Vec<DeviceInfo>> {
    let mut cache = DEVICE_CACHE.lock().unwrap();

    // Return cached data if still valid
    if !force_refresh && !cache.is_expired() {
        return Ok(cache.get());
    }

    // Fetch fresh data
    let output = execute_adb_command(vec!["devices", "-l"])?;
    let devices = parse_adb_devices(output);

    // Filter only connected devices (exclude offline, unauthorized)
    let connected_devices: Vec<DeviceInfo> = devices
        .into_iter()
        .filter(|d| d.state == "device")
        .collect();

    // Update cache
    cache.update(connected_devices.clone());

    Ok(connected_devices)
}

/// Get the first available device serial
pub fn get_default_device() -> AdbResult<String> {
    let devices = get_devices(false)?;

    if devices.is_empty() {
        return Err(AdbError::NoDeviceConnected);
    }

    Ok(devices[0].serial.clone())
}

/// Execute shell command on device
pub fn execute_shell_command(command: &str) -> AdbResult<String> {
    // Ensure at least one device is connected
    get_default_device()?;

    execute_adb_command(vec!["shell", command])
}

// Execute shell command on specific device
#[allow(dead_code)]
pub fn execute_shell_command_on_device(serial: &str, command: &str) -> AdbResult<String> {
    execute_adb_command(vec!["-s", serial, "shell", command])
}

// Start ADB server
#[allow(dead_code)]
pub fn start_adb_server() -> AdbResult<()> {
    execute_adb_command(vec!["start-server"])?;
    Ok(())
}

// Kill ADB server
#[allow(dead_code)]
pub fn kill_adb_server() -> AdbResult<()> {
    execute_adb_command(vec!["kill-server"])?;
    Ok(())
}

// Restart ADB server
#[allow(dead_code)]
pub fn restart_adb_server() -> AdbResult<()> {
    kill_adb_server()?;
    std::thread::sleep(Duration::from_millis(500));
    start_adb_server()?;
    Ok(())
}

// Connect to device via TCP/IP
#[allow(dead_code)]
pub fn connect_tcp(ip_address: &str, port: u16) -> AdbResult<String> {
    let address = format!("{}:{}", ip_address, port);
    execute_adb_command(vec!["connect", &address])
}

// Disconnect from TCP device
#[allow(dead_code)]
pub fn disconnect_tcp(ip_address: &str, port: u16) -> AdbResult<String> {
    let address = format!("{}:{}", ip_address, port);
    execute_adb_command(vec!["disconnect", &address])
}

// Get ADB version
#[allow(dead_code)]
pub fn get_adb_version() -> AdbResult<String> {
    execute_adb_command(vec!["version"])
}

// Check if specific device is online
#[allow(dead_code)]
pub fn is_device_online(serial: &str) -> bool {
    if let Ok(devices) = get_devices(true) {
        return devices.iter().any(|d| d.serial == serial && d.state == "device");
    }
    false
}

// ===== Helper Functions =====

// Clear device cache (force refresh on next call)
#[allow(dead_code)]
pub fn clear_device_cache() {
    let mut cache = DEVICE_CACHE.lock().unwrap();
    cache.last_update = Instant::now() - Duration::from_secs(10);
}

// Get detailed device properties
#[allow(dead_code)]
pub fn get_device_properties(serial: Option<String>) -> AdbResult<std::collections::HashMap<String, String>> {
    let command = "getprop";
    let output = if let Some(s) = serial {
        execute_shell_command_on_device(&s, command)?
    } else {
        execute_shell_command(command)?
    };

    let mut properties = std::collections::HashMap::new();

    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || !line.starts_with('[') {
            continue;
        }

        // Parse: [key]: [value]
        if let Some(key_end) = line.find("]: [") {
            let key = &line[1..key_end];
            let value_start = key_end + 4;
            if let Some(value_end) = line[value_start..].find(']') {
                let value = &line[value_start..value_start + value_end];
                properties.insert(key.to_string(), value.to_string());
            }
        }
    }

    Ok(properties)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_adb_devices() {
        let output = r#"List of devices attached
ABC123          device product:example model:Pixel_5 device:redfin transport_id:1
DEF456          offline
"#;

        let devices = parse_adb_devices(output.to_string());
        assert_eq!(devices.len(), 2);
        assert_eq!(devices[0].serial, "ABC123");
        assert_eq!(devices[0].state, "device");
        assert_eq!(devices[0].model, Some("Pixel_5".to_string()));
    }

    #[test]
    fn test_check_adb_available() {
        // This will pass if ADB is installed
        let available = check_adb_available();
        println!("ADB available: {}", available);
    }
}
