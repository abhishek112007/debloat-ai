# Tauri Project Structure - Updated Configuration

## ✅ Files Created/Updated

### 1. **src-tauri/src/main.rs** (New)
Entry point for the Tauri application.

```rust
// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Import the commands module
mod commands;
use commands::{get_device_info, list_packages, uninstall_package};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            list_packages,
            uninstall_package
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Key Points:**
- ✅ Imports commands from separate module
- ✅ Registers all three command handlers
- ✅ Initializes shell plugin for ADB execution
- ✅ Prevents console window in release builds (Windows)

---

### 2. **src-tauri/src/commands.rs** (New)
All ADB command implementations.

**Contents:**
- `DeviceInfo`, `Package`, `UninstallResult` structs
- Helper functions:
  - `execute_adb_command()` - Execute any ADB command
  - `get_battery_percentage()` - Parse battery info
  - `get_storage_info()` - Parse storage data
  - `get_android_version()` - Get Android version
  - `determine_safety_level()` - Classify package safety
  - `get_app_name()` - Format package names
- Tauri commands:
  - `#[tauri::command] get_device_info()`
  - `#[tauri::command] list_packages()`
  - `#[tauri::command] uninstall_package()`

---

### 3. **src-tauri/src/lib.rs** (Updated)
Simplified to just export the commands module.

```rust
// This file can be used for library exports if needed
// All commands are now in the commands module and registered in main.rs

pub mod commands;
```

---

### 4. **src-tauri/tauri.conf.json** (New)
Tauri v2 configuration with shell permissions.

**Key Configuration:**

```json
{
  "plugins": {
    "shell": {
      "open": true,
      "scope": [
        {
          "name": "adb",
          "cmd": "adb",
          "args": true,
          "sidecar": false
        }
      ]
    }
  }
}
```

**Full Settings:**
- **Product Name**: "Android ADB Manager"
- **Window Size**: 1200x800 (min 800x600)
- **Dev Server**: http://localhost:5173
- **Frontend Dist**: ../dist
- **Shell Scope**: ADB command enabled with arguments

---

## 📂 Project File Structure

```
src-tauri/
├── src/
│   ├── main.rs           ← Entry point (imports & registers commands)
│   ├── lib.rs            ← Module exports
│   └── commands.rs       ← All ADB command implementations
├── Cargo.toml            ← Dependencies (serde, serde_json, tauri-plugin-shell)
└── tauri.conf.json       ← Tauri config (shell permissions, window settings)

Frontend/
├── DevicePanel.tsx       ← Device info component
├── PackageList.tsx       ← Package list component
└── types.ts              ← TypeScript types
```

---

## 🔧 How It Works

### Module Structure

1. **main.rs**
   - Imports commands module: `mod commands;`
   - Uses specific commands: `use commands::{get_device_info, ...};`
   - Registers handlers in builder
   - Runs Tauri app

2. **commands.rs**
   - Contains all business logic
   - Exports public functions with `#[tauri::command]`
   - Can be tested independently

3. **lib.rs**
   - Exposes commands module: `pub mod commands;`
   - Allows other crates to use these functions if needed

### Command Registration

```rust
.invoke_handler(tauri::generate_handler![
    get_device_info,      // From commands module
    list_packages,        // From commands module
    uninstall_package     // From commands module
])
```

This macro generates the necessary glue code to call Rust functions from JavaScript.

---

## 🛡️ Security Configuration

### Shell Plugin Scope

The `tauri.conf.json` explicitly allows ADB execution:

```json
"shell": {
  "open": true,
  "scope": [
    {
      "name": "adb",
      "cmd": "adb",
      "args": true,      // Allows command-line arguments
      "sidecar": false   // Uses system ADB, not bundled
    }
  ]
}
```

**What this means:**
- ✅ Only `adb` command is allowed (not arbitrary shell commands)
- ✅ Arguments are permitted (for `shell pm list packages`, etc.)
- ✅ Uses system PATH to find ADB
- ❌ No other executables can be run

---

## 🚀 Build & Run

### Development

```powershell
# Install dependencies
cd src-tauri
cargo build

# Run dev server
cd ..
npm run tauri dev
```

### Production Build

```powershell
npm run tauri build
```

Output: `src-tauri/target/release/`

---

## 📝 Frontend Usage

### Calling Commands from React

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Get device info
const device = await invoke('get_device_info');
console.log(device);

// List packages
const packages = await invoke('list_packages');
console.log(packages);

// Uninstall package
const result = await invoke('uninstall_package', { 
  packageName: 'com.example.app' 
});
console.log(result);
```

### Type Safety

The Rust structs with `#[serde(rename = "...")]` ensure JSON field names match TypeScript:

**Rust:**
```rust
#[serde(rename = "androidVersion")]
pub android_version: String,
```

**TypeScript:**
```typescript
type DeviceInfo = {
  androidVersion: string;  // Matches!
};
```

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'commands'"
- **Solution**: Ensure `commands.rs` is in `src-tauri/src/` directory
- The `mod commands;` statement looks for `src/commands.rs`

### Error: "Shell scope violation"
- **Solution**: Verify `tauri.conf.json` has shell plugin configured
- Ensure `"args": true` is set in the ADB scope

### Build errors with Tauri
- **Solution**: Make sure you're using Tauri v2 dependencies
- Check `Cargo.toml` has `tauri = { version = "2.0" }`

---

## ✨ Summary

**What Changed:**
1. ✅ Created modular structure (main.rs + commands.rs)
2. ✅ Registered command handlers in builder
3. ✅ Configured shell permissions in tauri.conf.json
4. ✅ Enabled ADB execution with proper scope

**Benefits:**
- Better code organization (separation of concerns)
- Easier testing (commands isolated in own module)
- Security (only ADB allowed via shell)
- Type safety (Rust → JSON → TypeScript)

Everything is ready to build and run! 🚀
