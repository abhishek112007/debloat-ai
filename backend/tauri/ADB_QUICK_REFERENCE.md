# ADB Module - Quick Reference

## 🚀 Common Use Cases

### Check ADB Status
```rust
if !adb::check_adb_available() {
    return Err("ADB not installed".to_string());
}
```

### Get Connected Devices
```rust
// With caching (fast, recommended)
let devices = adb::get_devices(false)?;

// Force refresh
let devices = adb::get_devices(true)?;

for device in devices {
    println!("{} - {} - {:?}", device.serial, device.state, device.model);
}
```

### Execute Shell Commands
```rust
// On default device
let version = adb::execute_shell_command("getprop ro.build.version.release")?;

// On specific device
let packages = adb::execute_shell_command_on_device(
    "ABC123", 
    "pm list packages"
)?;
```

### Get Device Properties
```rust
let props = adb::get_device_properties(None)?;

let model = props.get("ro.product.model");
let manufacturer = props.get("ro.product.manufacturer");
let sdk_version = props.get("ro.build.version.sdk");
```

### Handle Errors
```rust
match adb::get_devices(false) {
    Ok(devices) if devices.is_empty() => {
        println!("No devices connected");
    }
    Ok(devices) => {
        println!("Found {} device(s)", devices.len());
    }
    Err(AdbError::AdbNotFound) => {
        println!("Please install ADB");
    }
    Err(e) => {
        println!("Error: {}", e);
    }
}
```

### Restart ADB Server
```rust
// Fix connection issues
adb::restart_adb_server()?;
```

### TCP/IP Connection
```rust
// Connect via Wi-Fi
adb::connect_tcp("192.168.1.100", 5555)?;

// Disconnect
adb::disconnect_tcp("192.168.1.100", 5555)?;
```

## 📋 Error Types

| Error | Meaning | Solution |
|-------|---------|----------|
| `NoDeviceConnected` | No device found | Connect device via USB |
| `AdbNotFound` | ADB not installed | Install Android SDK Tools |
| `AdbServerNotRunning` | Daemon not running | Run `adb start-server` |
| `DeviceOffline` | Device not responding | Reconnect USB cable |
| `DeviceUnauthorized` | Not authorized | Check device screen, tap "Allow" |
| `PermissionDenied` | Insufficient permissions | Run with admin/sudo |
| `Timeout` | Command took >30s | Check device connection |

## 🔧 Integration with Tauri Commands

```rust
use crate::adb::{self, AdbError};

fn adb_error_to_string(error: AdbError) -> String {
    error.to_string()
}

#[tauri::command]
pub fn get_device_info() -> Result<DeviceInfo, String> {
    // Check ADB
    if !adb::check_adb_available() {
        return Err("ADB not found".to_string());
    }
    
    // Get devices (with caching)
    let devices = adb::get_devices(false)
        .map_err(adb_error_to_string)?;
    
    if devices.is_empty() {
        return Err("No device connected".to_string());
    }
    
    let device = &devices[0];
    
    // Get properties
    let version = adb::execute_shell_command("getprop ro.build.version.release")
        .map_err(adb_error_to_string)?;
    
    Ok(DeviceInfo {
        serial: device.serial.clone(),
        model: device.model.clone(),
        android_version: version.trim().to_string(),
    })
}
```

## ⚡ Performance Tips

1. **Use caching**: `get_devices(false)` instead of `get_devices(true)`
2. **Batch commands**: Execute multiple shell commands in one call
3. **Clear cache when needed**: After connecting/disconnecting devices

```rust
// Good - uses cache
let devices = adb::get_devices(false)?;

// After device change
adb::clear_device_cache();
let devices = adb::get_devices(true)?;
```

## 🔍 Debugging

```rust
// Get ADB version
let version = adb::get_adb_version()?;
println!("ADB version: {}", version);

// Check if specific device is online
if adb::is_device_online("ABC123") {
    println!("Device ABC123 is ready");
}

// Get all device properties
let props = adb::get_device_properties(None)?;
for (key, value) in props {
    println!("{} = {}", key, value);
}
```

## 📦 Dependencies

```toml
[dependencies]
lazy_static = "1.4"
serde = { version = "1", features = ["derive"] }
```

## 🔄 Cache Behavior

- **Duration**: 5 seconds
- **Storage**: In-memory (Mutex-protected)
- **Clear**: `adb::clear_device_cache()`
- **Bypass**: `get_devices(true)`

## 🌍 Cross-Platform Paths

ADB auto-detected from:

**Windows**: `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`  
**macOS**: `$HOME/Library/Android/sdk/platform-tools/adb`  
**Linux**: `$HOME/Android/Sdk/platform-tools/adb`

## ⚠️ Common Issues

### "No device found"
```bash
# Check device connection
adb devices -l

# Enable USB debugging on device
# Settings → Developer Options → USB Debugging
```

### "ADB server not running"
```rust
adb::restart_adb_server()?;
```

### "Device offline"
```bash
# Restart ADB
adb kill-server
adb start-server

# Reconnect device
```

---

**Full docs**: See `ADB_MODULE_DOCUMENTATION.md`
