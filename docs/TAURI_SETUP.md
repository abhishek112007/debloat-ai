# Tauri v2 Android ADB Manager - Setup Guide

Complete Rust backend implementation for managing Android devices via ADB.

## 📁 Project Structure

```
src-tauri/
├── src/
│   └── lib.rs          ← Rust commands (get_device_info, list_packages, uninstall_package)
├── Cargo.toml          ← Dependencies (serde, serde_json, tauri-plugin-shell)
└── tauri.conf.json     ← Tauri configuration

Frontend (React):
├── DevicePanel.tsx     ← Device info component
├── PackageList.tsx     ← Package list component
└── types.ts            ← Shared types
```

---

## ✅ Rust Backend (Complete)

### Implemented Commands

#### 1. `get_device_info()`
Returns connected Android device information.

**ADB Commands Used:**
- `adb devices -l` - List connected devices
- `adb shell getprop ro.build.version.release` - Android version
- `adb shell dumpsys battery` - Battery level
- `adb shell df /data` - Storage info

**Response:**
```json
{
  "name": "emulator-5554",
  "model": "Pixel_5",
  "androidVersion": "14",
  "batteryPercentage": 85,
  "storageAvailable": "12.3 GB"
}
```

**Error:** Returns error string if no device connected.

---

#### 2. `list_packages()`
Lists all installed Android packages with safety ratings.

**ADB Commands Used:**
- `adb shell pm list packages -a` - All packages

**Safety Levels (Hardcoded Logic):**
- **Safe**: Unknown/third-party apps (default)
- **Caution**: OEM bloatware (Samsung, Xiaomi, Huawei, etc.)
- **Expert**: Core system apps (Google Play Services, SystemUI, Phone)
- **Dangerous**: Tracking/bloatware (Facebook, TikTok, analytics)

**Response:**
```json
[
  {
    "packageName": "com.android.chrome",
    "appName": "Chrome",
    "safetyLevel": "Safe"
  },
  {
    "packageName": "com.facebook.katana",
    "appName": "Facebook",
    "safetyLevel": "Dangerous"
  }
]
```

---

#### 3. `uninstall_package(package_name: String)`
Uninstalls a package (keeps data with `-k` flag).

**ADB Commands Used:**
- `adb shell pm uninstall -k {package_name}`

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully uninstalled com.example.app"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Failed to uninstall: Failure [DELETE_FAILED_INTERNAL_ERROR]"
}
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```powershell
cd src-tauri
cargo build
```

This will install:
- `tauri` v2.0
- `tauri-plugin-shell` v2.0
- `serde` with derive features
- `serde_json`

---

### 2. Verify ADB Installation

Ensure ADB is in your system PATH:

```powershell
adb version
```

Expected output:
```
Android Debug Bridge version 1.0.41
...
```

If not installed, download [Android Platform Tools](https://developer.android.com/studio/releases/platform-tools).

---

### 3. Connect Android Device

**Enable USB Debugging:**
1. Settings → About Phone → Tap "Build Number" 7 times
2. Settings → Developer Options → Enable "USB Debugging"
3. Connect via USB

**Verify connection:**
```powershell
adb devices
```

Expected output:
```
List of devices attached
ABC123DEF456    device
```

---

### 4. Test Rust Commands

You can test the backend without the frontend:

```powershell
cd src-tauri
cargo run
```

Then from the frontend console:
```javascript
// Test device info
const device = await invoke('get_device_info');
console.log(device);

// Test package list
const packages = await invoke('list_packages');
console.log(packages);

// Test uninstall
const result = await invoke('uninstall_package', { 
  packageName: 'com.example.app' 
});
console.log(result);
```

---

## 🎨 Frontend Integration

### TypeScript Types Match

The Rust structs use `serde` rename attributes to match React component types:

**Rust → TypeScript:**
- `DeviceInfo` → matches `DeviceInfo` in `types.ts`
- `Package` → matches `Package` in `types.ts`
- Field names use camelCase (e.g., `androidVersion`, `batteryPercentage`)

### Usage in React

```tsx
import { invoke } from '@tauri-apps/api/tauri';
import DevicePanel from './DevicePanel';
import PackageList from './PackageList';

function App() {
  return (
    <div className="p-6">
      <DevicePanel />
      <PackageList />
    </div>
  );
}
```

---

## 🛠️ Customization

### Modify Safety Levels

Edit `determine_safety_level()` in `lib.rs`:

```rust
fn determine_safety_level(package_name: &str) -> String {
    let dangerous = [
        "com.facebook",
        "com.your.custom.bloatware",  // Add custom patterns
    ];
    
    // ... rest of logic
}
```

### Add More Device Info

Extend `get_device_info()`:

```rust
// Get device manufacturer
let manufacturer = execute_adb_command(&[
    "shell", "getprop", "ro.product.manufacturer"
])?;

// Get screen resolution
let resolution = execute_adb_command(&[
    "shell", "wm", "size"
])?;

// Add to DeviceInfo struct
pub struct DeviceInfo {
    // ... existing fields
    pub manufacturer: Option<String>,
    pub resolution: Option<String>,
}
```

---

## 🐛 Troubleshooting

### Error: "Failed to execute ADB command"
- **Solution**: Ensure ADB is in system PATH
- **Windows**: Add `C:\path\to\platform-tools` to PATH environment variable

### Error: "No device connected"
- **Solution**: Run `adb devices` to verify connection
- Try: `adb kill-server && adb start-server`

### Error: "Unauthorized device"
- **Solution**: Check phone screen for USB debugging authorization prompt
- Click "Always allow from this computer" and tap "Allow"

### Package list is empty
- **Solution**: Device may need root or ADB authorization
- Some devices block package listing in user mode

### Uninstall fails with "DELETE_FAILED_INTERNAL_ERROR"
- **Solution**: Package may be system app requiring root
- Try: `adb shell pm uninstall --user 0 {package}` (disables for current user)

---

## 📝 Notes

- **Data Preservation**: Uninstall uses `-k` flag to keep app data
- **Sorting**: Packages are sorted alphabetically by package name
- **Error Handling**: All commands return proper error messages
- **Cross-Platform**: Works on Windows, macOS, Linux (ADB required)

---

## 🚀 Next Steps

1. Build and run Tauri app:
   ```powershell
   npm run tauri dev
   ```

2. Test with real device connected

3. Customize safety levels for your needs

4. Add more ADB commands as needed (e.g., `install_apk`, `reboot_device`)

---

## 📦 Production Build

```powershell
npm run tauri build
```

Outputs executable in `src-tauri/target/release/`.
