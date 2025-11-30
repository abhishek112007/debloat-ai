use serde::{Deserialize, Serialize};

// Import modules from crate root
use crate::package_database::{get_safety_level, get_display_name};
use crate::adb::{self, AdbError};
use crate::ai_advisor::{self, PackageAnalysis};

// Data structures for JSON responses

#[derive(Debug, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub name: String,
    pub model: Option<String>,
    #[serde(rename = "androidVersion")]
    pub android_version: String,
    #[serde(rename = "batteryPercentage")]
    pub battery_percentage: Option<i32>,
    #[serde(rename = "storageAvailable")]
    pub storage_available: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Package {
    #[serde(rename = "packageName")]
    pub package_name: String,
    #[serde(rename = "appName")]
    pub app_name: String,
    #[serde(rename = "safetyLevel")]
    pub safety_level: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UninstallResult {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

// Helper function to convert AdbError to String for Tauri commands
fn adb_error_to_string(error: AdbError) -> String {
    error.to_string()
}

// Helper function to get battery level
fn get_battery_level() -> Option<i32> {
    let output = adb::execute_shell_command("dumpsys battery").ok()?;
    
    for line in output.lines() {
        if line.trim().starts_with("level:") {
            if let Some(level_str) = line.split(':').nth(1) {
                if let Ok(level) = level_str.trim().parse::<i32>() {
                    return Some(level);
                }
            }
        }
    }
    None
}

// Helper function to get storage info
fn get_storage_info() -> Option<String> {
    let output = adb::execute_shell_command("df /data").ok()?;
    
    // Parse df output to get available storage
    for line in output.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 4 {
            // Available space is typically the 4th column
            let available = parts[3];
            // Convert to human-readable format
            if let Ok(bytes) = available.parse::<f64>() {
                let gb = bytes / 1024.0 / 1024.0;
                return Some(format!("{:.1} GB", gb));
            } else if available.ends_with('G') || available.ends_with('M') {
                return Some(available.to_string());
            }
        }
    }
    None
}

// Helper function to get Android version
fn get_android_version() -> Option<String> {
    let output = adb::execute_shell_command("getprop ro.build.version.release").ok()?;
    Some(output.trim().to_string())
}

// Helper function to determine package safety level
// Now uses the package_database module
fn determine_safety_level(package_name: &str) -> String {
    get_safety_level(package_name).as_str().to_string()
}

// Helper function to get app name from package name
// Now uses the package_database module with fallback
fn get_app_name(package_name: &str) -> String {
    get_display_name(package_name)
}

// Tauri command: Get device info
#[tauri::command]
pub fn get_device_info() -> Result<DeviceInfo, String> {
    // Check if ADB is available
    if !adb::check_adb_available() {
        return Err("ADB (Android Debug Bridge) not found. Please install Android SDK Platform Tools.".to_string());
    }

    // Get connected devices with caching
    let devices = adb::get_devices(false).map_err(adb_error_to_string)?;
    
    if devices.is_empty() {
        return Err("No device connected. Please connect an Android device via USB or TCP.".to_string());
    }

    let device = &devices[0];
    let device_name = device.serial.clone();
    let model = device.model.clone();
    
    // Get additional device information
    let android_version = get_android_version().unwrap_or_else(|| "Unknown".to_string());
    let battery_percentage = get_battery_level();
    let storage_available = get_storage_info();
    
    Ok(DeviceInfo {
        name: device_name,
        model,
        android_version,
        battery_percentage,
        storage_available,
    })
}

// Tauri command: List all packages
#[tauri::command]
pub fn list_packages() -> Result<Vec<Package>, String> {
    // Ensure device is connected
    adb::get_default_device().map_err(adb_error_to_string)?;
    
    // Run adb shell pm list packages -a
    let output = adb::execute_shell_command("pm list packages -a")
        .map_err(adb_error_to_string)?;
    
    let mut packages = Vec::new();
    
    for line in output.lines() {
        if let Some(package_name) = line.strip_prefix("package:") {
            let package_name = package_name.trim().to_string();
            let app_name = get_app_name(&package_name);
            let safety_level = determine_safety_level(&package_name);
            
            packages.push(Package {
                package_name,
                app_name,
                safety_level,
            });
        }
    }
    
    // Sort packages alphabetically by package name
    packages.sort_by(|a, b| a.package_name.cmp(&b.package_name));
    
    Ok(packages)
}

// Tauri command: Uninstall a package
#[tauri::command]
pub fn uninstall_package(package_name: String) -> UninstallResult {
    // Validate package name (basic check)
    if package_name.is_empty() {
        return UninstallResult {
            success: false,
            message: None,
            error: Some("Package name cannot be empty".to_string()),
        };
    }
    
    // Run adb shell pm uninstall -k {package_name}
    let command = format!("pm uninstall -k {}", package_name);
    match adb::execute_shell_command(&command) {
        Ok(output) => {
            let output_lower = output.to_lowercase();
            
            // Check if uninstall was successful
            if output_lower.contains("success") {
                UninstallResult {
                    success: true,
                    message: Some(format!("Successfully uninstalled {}", package_name)),
                    error: None,
                }
            } else if output_lower.contains("failure") {
                UninstallResult {
                    success: false,
                    message: None,
                    error: Some(format!("Failed to uninstall: {}", output.trim())),
                }
            } else {
                UninstallResult {
                    success: false,
                    message: None,
                    error: Some(format!("Unexpected response: {}", output.trim())),
                }
            }
        }
        Err(e) => UninstallResult {
            success: false,
            message: None,
            error: Some(adb_error_to_string(e)),
        },
    }
}

/// Analyzes an Android package using AI to provide safety recommendations
#[tauri::command]
pub async fn analyze_package(package_name: String) -> Result<PackageAnalysis, String> {
    ai_advisor::analyze_package(&package_name).await
}
