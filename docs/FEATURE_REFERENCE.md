# 🚀 Android Debloater - Feature Reference Guide

> **Complete guide to all available functions, their locations, and how to implement them**

---

## 📋 Table of Contents
1. [Available Functions](#available-functions)
2. [Implementation Guide](#implementation-guide)
3. [Code Locations](#code-locations)
4. [Quick Start Examples](#quick-start-examples)

---

## 🔧 Available Functions

### 1. Wireless ADB Connection
**Status:** Ready to use (currently suppressed)  
**Functions:**
- `connect_tcp(ip_address: &str, port: u16)` - Connect to device via WiFi
- `disconnect_tcp(ip_address: &str, port: u16)` - Disconnect from WiFi device

**Location:** `src-tauri/src/adb.rs` (Lines 324-335)

**Use Case:**
- Connect to Android devices without USB cable
- Useful for tablets, TVs, or when working from distance
- Standard port is 5555

**Example:**
```rust
// Connect to device at 192.168.1.100
adb::connect_tcp("192.168.1.100", 5555)?;
```

---

### 2. ADB Server Management
**Status:** Ready to use (currently suppressed)  
**Functions:**
- `start_adb_server()` - Start the ADB daemon
- `kill_adb_server()` - Stop the ADB daemon
- `restart_adb_server()` - Restart ADB (kills then starts)

**Location:** `src-tauri/src/adb.rs` (Lines 299-322)

**Use Case:**
- Fix connection issues when device won't connect
- Troubleshooting tool for users
- Reset ADB state

**Example:**
```rust
// Fix connection issues
adb::restart_adb_server()?;
```

---

### 3. Multi-Device Support
**Status:** Ready to use (currently suppressed)  
**Function:**
- `execute_shell_command_on_device(serial: &str, command: &str)` - Run command on specific device

**Location:** `src-tauri/src/adb.rs` (Lines 296-298)

**Use Case:**
- Work with multiple phones/tablets simultaneously
- Target specific device when many are connected
- Professional multi-device management

**Example:**
```rust
// Run command on specific device
adb::execute_shell_command_on_device("ABC123", "pm list packages")?;
```

---

### 4. Device Properties Viewer
**Status:** Ready to use (currently suppressed)  
**Function:**
- `get_device_properties(serial: Option<String>)` - Get all device properties (build info, manufacturer, etc.)

**Location:** `src-tauri/src/adb.rs` (Lines 362-381)

**Use Case:**
- Show detailed device information
- Debug Android version/build issues
- Display manufacturer, model, Android version, build number
- Properties like: ro.build.version.release, ro.product.manufacturer, ro.product.model

**Example:**
```rust
// Get all properties from connected device
let props = adb::get_device_properties(None)?;
// Access like: props.get("ro.build.version.release")
```

---

### 5. Cache Management
**Status:** Ready to use (currently suppressed)  
**Function:**
- `clear_device_cache()` - Force refresh device list (bypass 5-second cache)

**Location:** `src-tauri/src/adb.rs` (Lines 356-359)

**Use Case:**
- Force immediate device list update
- Bypass caching for real-time updates
- Useful for "Force Refresh" button

**Example:**
```rust
// Clear cache and force fresh device scan
adb::clear_device_cache();
let devices = adb::get_devices(false)?; // Will fetch fresh data
```

---

### 6. Device Status Check
**Status:** Ready to use (currently suppressed)  
**Function:**
- `is_device_online(serial: &str)` - Check if specific device is connected and ready

**Location:** `src-tauri/src/adb.rs` (Lines 345-351)

**Use Case:**
- Monitor device connection status
- Auto-detect disconnections
- Validate device before operations

**Example:**
```rust
// Check if device is online
if adb::is_device_online("ABC123") {
    println!("Device is ready!");
}
```

---

### 7. Package Safety Functions
**Status:** Ready to use (currently suppressed)  
**Functions:**
- `get_all_packages()` - Get entire package database (all 547+ known packages)
- `is_safe_to_remove(package: &str)` - Check if package is safe/caution level
- `get_package_info(package: &str)` - Get full package details with safety info
- `get_safety_reason(package: &str)` - Get explanation of why package has its safety level

**Location:** `src-tauri/src/package_database.rs` (Lines 462-512)

**Use Case:**
- Filter packages by safety level
- Show educational information to users
- Help beginners avoid dangerous packages
- Display package reference/documentation

**Example:**
```rust
// Check if safe to remove
if package_database::is_safe_to_remove("com.facebook.katana") {
    println!("Safe to remove!");
}

// Get detailed info
let info = package_database::get_package_info("com.android.systemui")?;
println!("Safety: {:?}, Reason: {}", info.safety_level, info.reason);

// Get all known packages for reference
let all = package_database::get_all_packages();
println!("Database contains {} packages", all.len());
```

---

### 8. ADB Version Check
**Status:** Ready to use (currently suppressed)  
**Function:**
- `get_adb_version()` - Get installed ADB version string

**Location:** `src-tauri/src/adb.rs` (Lines 336-338)

**Use Case:**
- Display ADB version in About/Settings
- Debug compatibility issues
- Verify ADB installation

**Example:**
```rust
// Get ADB version
let version = adb::get_adb_version()?;
println!("ADB Version: {}", version);
```

---

## 🛠️ Implementation Guide

### Step 1: Create Tauri Command

Add command in `src-tauri/src/commands.rs`:

```rust
// Example: Add wireless connection command
#[tauri::command]
pub fn connect_wireless(ip: String, port: u16) -> Result<String, String> {
    adb::connect_tcp(&ip, port).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn disconnect_wireless(ip: String, port: u16) -> Result<String, String> {
    adb::disconnect_tcp(&ip, port).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restart_adb() -> Result<(), String> {
    adb::restart_adb_server().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_device_props(serial: Option<String>) -> Result<HashMap<String, String>, String> {
    adb::get_device_properties(serial).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn check_package_safety(package: String) -> bool {
    package_database::is_safe_to_remove(&package)
}

#[tauri::command]
pub fn get_all_known_packages() -> Vec<PackageInfo> {
    package_database::get_all_packages()
}
```

### Step 2: Register Commands

In `src-tauri/src/main.rs`, add to `invoke_handler`:

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Existing commands
            commands::get_device,
            commands::list_packages,
            commands::uninstall_package,
            commands::backup_packages,
            commands::restore_packages,
            
            // NEW COMMANDS - Add these
            commands::connect_wireless,
            commands::disconnect_wireless,
            commands::restart_adb,
            commands::get_device_props,
            commands::check_package_safety,
            commands::get_all_known_packages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 3: Call from React/TypeScript

Create UI components and call commands:

```typescript
import { invoke } from '@tauri-apps/api/core';

// Wireless Connection
async function connectWiFi(ip: string) {
  try {
    const result = await invoke('connect_wireless', { ip, port: 5555 });
    console.log('Connected:', result);
  } catch (error) {
    console.error('Failed:', error);
  }
}

// ADB Restart
async function fixConnection() {
  try {
    await invoke('restart_adb');
    alert('ADB restarted successfully');
  } catch (error) {
    alert('Failed to restart: ' + error);
  }
}

// Device Properties
async function showDeviceInfo() {
  try {
    const props = await invoke<Record<string, string>>('get_device_props', { serial: null });
    console.log('Android Version:', props['ro.build.version.release']);
    console.log('Manufacturer:', props['ro.product.manufacturer']);
    console.log('Model:', props['ro.product.model']);
  } catch (error) {
    console.error('Failed:', error);
  }
}

// Package Safety Check
async function filterSafePackages(packages: Package[]) {
  const safePackages = [];
  for (const pkg of packages) {
    const isSafe = await invoke<boolean>('check_package_safety', { 
      package: pkg.packageName 
    });
    if (isSafe) safePackages.push(pkg);
  }
  return safePackages;
}

// Get All Known Packages
async function showPackageReference() {
  const allPackages = await invoke<PackageInfo[]>('get_all_known_packages');
  console.log(`Database contains ${allPackages.length} packages`);
  // Display in reference modal
}
```

---

## 📍 Code Locations

### Backend (Rust)

#### `src-tauri/src/adb.rs`
- **Lines 8-37**: Error types (AdbError enum)
- **Lines 40-140**: ADB path detection and command execution
- **Lines 145-240**: Device detection and parsing
- **Lines 243-287**: Device information gathering (get_devices, get_default_device, execute_shell_command)
- **Lines 290-298**: Multi-device shell command (SUPPRESSED)
- **Lines 299-322**: ADB server management (SUPPRESSED)
- **Lines 324-335**: Wireless connection (SUPPRESSED)
- **Lines 336-338**: ADB version (SUPPRESSED)
- **Lines 341-351**: Device online check (SUPPRESSED)
- **Lines 356-359**: Cache clearing (SUPPRESSED)
- **Lines 362-381**: Device properties (SUPPRESSED)
- **Lines 384-419**: Package listing and device info helpers

#### `src-tauri/src/commands.rs`
- **Lines 1-20**: Imports and data structures
- **Lines 22-80**: get_device command
- **Lines 82-150**: list_packages command
- **Lines 152-180**: uninstall_package command
- **Lines 182-212**: Backup/restore commands
- **ADD NEW COMMANDS HERE** (after line 212)

#### `src-tauri/src/package_database.rs`
- **Lines 1-50**: Safety level enum and package info struct
- **Lines 52-458**: Package database (547+ packages with safety info)
- **Lines 462-465**: get_all_packages (SUPPRESSED)
- **Lines 467-471**: is_safe_to_remove (SUPPRESSED)
- **Lines 473-476**: get_package_info (SUPPRESSED)
- **Lines 478-503**: get_display_name and get_safety_level (ACTIVE)
- **Lines 505-512**: get_safety_reason (SUPPRESSED)

#### `src-tauri/src/main.rs`
- **Lines 1-20**: Main function and Tauri setup
- **Line 10-18**: invoke_handler with registered commands
- **ADD NEW COMMAND REGISTRATIONS HERE** (line 17)

### Frontend (React/TypeScript)

#### `src/App.tsx`
- **Lines 1-90**: Imports and state management
- **Lines 92-160**: Helper functions (notifications, actions)
- **Lines 162-200**: Header component (responsive)
- **Lines 202-360**: Main layout with DevicePanel, PackageList, BackupManager

#### `src/DevicePanel.tsx`
- **Lines 1-82**: Device information display with auto-refresh hook

#### `src/PackageList.tsx`
- **Lines 1-223**: Package list with search, selection, responsive table/cards

#### `src/BackupManager.tsx`
- **Lines 1-237**: Backup creation and restore functionality

#### `src/Settings.tsx`
- **Lines 1-426**: Settings panel (good place to add ADB restart button)

#### `src/useDeviceMonitor.ts`
- **Lines 1-50**: Auto-refresh hook (3-second polling)

---

## 🎯 Quick Start Examples

### Example 1: Add Wireless Connection UI

**File:** `src/Settings.tsx` (add after line 310)

```typescript
{/* Wireless Connection Section */}
<section className="mb-6 md:mb-8">
  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
    Wireless Connection
  </h3>

  <div className="py-3">
    <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
      Connect via WiFi
    </label>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
      Connect to your Android device wirelessly (device must be on same network)
    </p>
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        placeholder="192.168.1.100"
        value={wifiIp}
        onChange={(e) => setWifiIp(e.target.value)}
        className="flex-1 px-3 py-2.5 md:py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] md:min-h-0"
      />
      <button
        onClick={handleConnectWiFi}
        className="px-4 py-2.5 md:py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm min-h-[44px] md:min-h-0"
      >
        Connect
      </button>
    </div>
  </div>
</section>
```

Add handler:
```typescript
const [wifiIp, setWifiIp] = useState('');

const handleConnectWiFi = async () => {
  try {
    await invoke('connect_wireless', { ip: wifiIp, port: 5555 });
    alert('Connected successfully!');
  } catch (error) {
    alert(`Failed to connect: ${error}`);
  }
};
```

---

### Example 2: Add "Fix Connection" Button

**File:** `src/Settings.tsx` (add in Device section after line 290)

```typescript
<div className="py-3 border-t border-gray-100 dark:border-gray-800">
  <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
    Troubleshooting
  </label>
  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
    Restart ADB if device won't connect
  </p>
  <button
    onClick={handleRestartAdb}
    className="px-4 py-2.5 md:py-2 bg-orange-600 text-white hover:bg-orange-700 text-sm min-h-[44px] md:min-h-0"
  >
    🔧 Restart ADB Server
  </button>
</div>
```

Add handler:
```typescript
const handleRestartAdb = async () => {
  try {
    await invoke('restart_adb');
    alert('✅ ADB server restarted successfully!');
  } catch (error) {
    alert(`❌ Failed to restart: ${error}`);
  }
};
```

---

### Example 3: Add "Show Only Safe" Filter

**File:** `src/PackageList.tsx` (add after search input at line 128)

```typescript
<div className="flex gap-2 mb-4">
  <button
    onClick={() => setShowOnlySafe(!showOnlySafe)}
    className={`px-3 py-2 text-sm ${
      showOnlySafe 
        ? 'bg-green-600 text-white' 
        : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]'
    }`}
  >
    {showOnlySafe ? '✓ Safe Only' : 'Show All'}
  </button>
</div>
```

Add filtering logic:
```typescript
const [showOnlySafe, setShowOnlySafe] = useState(false);

// Modify filtered packages
const filtered = packages.filter(pkg => {
  const matchesSearch = pkg.packageName.toLowerCase().includes(search.toLowerCase()) ||
                       pkg.appName.toLowerCase().includes(search.toLowerCase());
  
  if (!matchesSearch) return false;
  
  if (showOnlySafe) {
    return pkg.safetyLevel === 'Safe' || pkg.safetyLevel === 'Caution';
  }
  
  return true;
});
```

---

### Example 4: Add Device Properties Modal

**File:** `src/DevicePanel.tsx` (add button after refresh button at line 75)

```typescript
<button
  type="button"
  onClick={showDetailedInfo}
  disabled={!device}
  className="mt-2 w-full py-2.5 md:py-2 px-3 border border-blue-600 text-sm text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-60 dark:bg-[#1a1a1a] dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20 min-h-[44px] md:min-h-0"
>
  📋 Detailed Properties
</button>
```

Add handler:
```typescript
const showDetailedInfo = async () => {
  try {
    const props = await invoke<Record<string, string>>('get_device_props', { serial: null });
    
    const details = `
Device Properties:
━━━━━━━━━━━━━━━━━━━━━━
Android Version: ${props['ro.build.version.release'] || 'Unknown'}
SDK Level: ${props['ro.build.version.sdk'] || 'Unknown'}
Manufacturer: ${props['ro.product.manufacturer'] || 'Unknown'}
Model: ${props['ro.product.model'] || 'Unknown'}
Brand: ${props['ro.product.brand'] || 'Unknown'}
Build Number: ${props['ro.build.display.id'] || 'Unknown'}
Build Type: ${props['ro.build.type'] || 'Unknown'}
Security Patch: ${props['ro.build.version.security_patch'] || 'Unknown'}
    `.trim();
    
    alert(details);
  } catch (error) {
    alert(`Failed to get properties: ${error}`);
  }
};
```

---

## 📚 Additional Notes

### Removing `#[allow(dead_code)]`

When you implement a function, **remove the `#[allow(dead_code)]` line** above it:

**Before:**
```rust
// Execute shell command on specific device
#[allow(dead_code)]
pub fn execute_shell_command_on_device(serial: &str, command: &str) -> AdbResult<String> {
    execute_adb_command(vec!["-s", serial, "shell", command])
}
```

**After:**
```rust
// Execute shell command on specific device
pub fn execute_shell_command_on_device(serial: &str, command: &str) -> AdbResult<String> {
    execute_adb_command(vec!["-s", serial, "shell", command])
}
```

### Error Handling

All functions return `Result<T, AdbError>`. Convert to String for Tauri commands:

```rust
#[tauri::command]
pub fn my_command() -> Result<String, String> {
    adb::some_function().map_err(|e| e.to_string())
}
```

### TypeScript Types

Add type definitions in your React components:

```typescript
interface DeviceProperties {
  'ro.build.version.release': string;
  'ro.product.manufacturer': string;
  'ro.product.model': string;
  [key: string]: string;
}

const props = await invoke<DeviceProperties>('get_device_props', { serial: null });
```

---

## 🎉 Summary

- ✅ **9 powerful features** ready to implement
- ✅ **All code locations** documented with line numbers
- ✅ **Step-by-step** implementation guide
- ✅ **Copy-paste examples** for quick integration
- ✅ **No performance impact** - functions are compiled but suppressed

**Start with:** Wireless connection or ADB restart - easiest and most useful!

---

*Last Updated: November 4, 2025*  
*Project: Android Debloater (Tauri v2 + React + TypeScript)*
