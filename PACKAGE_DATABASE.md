# Package Database Module - Documentation

Comprehensive bloatware classification system for Android packages with 50+ pre-categorized apps.

## Overview

The `package_database` module provides safety classifications for common Android packages, helping users make informed decisions about which apps to remove.

---

## Safety Levels

### 🟢 Safe
**Third-party apps that can be easily reinstalled**
- Examples: Google Maps, Gmail, YouTube, Chrome
- Impact: No system impact
- Reinstallable: ✅ Yes, via Play Store

### 🟡 Caution
**OEM bloatware that may affect some features**
- Examples: Samsung Free, Bixby, MIUI Analytics, Facebook
- Impact: May lose some OEM-specific features
- Reinstallable: ✅ Usually yes

### 🟠 Expert
**System-adjacent apps that may break functionality**
- Examples: Google Play Services, Bluetooth, Carrier apps
- Impact: Can break app functionality or system features
- Reinstallable: ⚠️ Sometimes difficult

### 🔴 Dangerous
**Critical system apps - DO NOT REMOVE**
- Examples: System UI, Phone, Settings, Play Store
- Impact: Will break core device functionality
- Reinstallable: ❌ Very difficult or impossible

---

## Data Structure

### PackageInfo Struct

```rust
pub struct PackageInfo {
    pub name: String,              // e.g., "com.facebook.katana"
    pub display_name: String,      // e.g., "Facebook"
    pub safety_level: SafetyLevel, // Safe, Caution, Expert, Dangerous
    pub reason: String,            // Why this classification
    pub can_reinstall: bool,       // Can be reinstalled from Play Store
}
```

### SafetyLevel Enum

```rust
pub enum SafetyLevel {
    Safe,       // Green
    Caution,    // Yellow
    Expert,     // Orange
    Dangerous,  // Red
}
```

---

## Public API Functions

### 1. `get_safety_level(package: &str) -> SafetyLevel`

Get the safety classification for a package.

**Example:**
```rust
use crate::package_database::get_safety_level;

let level = get_safety_level("com.facebook.katana");
// Returns: SafetyLevel::Caution
```

**Pattern Matching:** For unknown packages, uses intelligent pattern matching:
- Contains `"facebook"`, `"instagram"`, `"tiktok"` → Caution
- Contains `"gms"`, `"vending"`, `"systemui"` → Dangerous
- Contains `"samsung"`, `"xiaomi"`, `"miui"` → Caution
- Default → Safe

---

### 2. `is_safe_to_remove(package: &str) -> bool`

Quick check if a package is safe to remove (Safe or Caution level).

**Example:**
```rust
use crate::package_database::is_safe_to_remove;

if is_safe_to_remove("com.google.android.apps.maps") {
    println!("Safe to remove!");
}
// Returns: true
```

**Returns:**
- `true` for Safe and Caution levels
- `false` for Expert and Dangerous levels

---

### 3. `get_all_packages() -> Vec<PackageInfo>`

Get all packages from the database.

**Example:**
```rust
use crate::package_database::get_all_packages;

let packages = get_all_packages();
println!("Database contains {} packages", packages.len());
// Output: "Database contains 50+ packages"
```

---

### 4. `get_package_info(package: &str) -> Option<PackageInfo>`

Get detailed information about a specific package.

**Example:**
```rust
use crate::package_database::get_package_info;

if let Some(info) = get_package_info("com.facebook.katana") {
    println!("Name: {}", info.display_name);
    println!("Safety: {:?}", info.safety_level);
    println!("Reason: {}", info.reason);
    println!("Can reinstall: {}", info.can_reinstall);
}
```

---

### 5. `get_display_name(package: &str) -> String`

Get a human-readable name for a package.

**Example:**
```rust
use crate::package_database::get_display_name;

let name = get_display_name("com.facebook.katana");
// Returns: "Facebook"

let name = get_display_name("com.unknown.app");
// Returns: "App" (formatted from package name)
```

---

### 6. `get_safety_reason(package: &str) -> String`

Get the reason for a package's safety classification.

**Example:**
```rust
use crate::package_database::get_safety_reason;

let reason = get_safety_reason("com.android.systemui");
// Returns: "Critical system component - manages UI, notifications, status bar"
```

---

## Database Contents (50+ Packages)

### Dangerous (System Critical)
- `com.android.systemui` - System UI
- `com.android.phone` - Phone
- `com.android.settings` - Settings
- `com.android.launcher3` - Launcher
- `com.android.vending` - Google Play Store

### Expert (System-Adjacent)
- `com.google.android.gms` - Google Play Services
- `com.google.android.gsf` - Google Services Framework
- `com.android.bluetooth` - Bluetooth
- `com.android.nfc` - NFC Service
- `com.verizon.services` - Verizon Services
- `com.att.myWireless` - AT&T MyWireless
- `com.sprint.zone` - Sprint Zone

### Caution (OEM Bloatware)
- `com.facebook.katana` - Facebook
- `com.facebook.services` - Facebook Services
- `com.instagram.android` - Instagram
- `com.whatsapp` - WhatsApp
- `com.samsung.android.bixby.agent` - Bixby Voice
- `com.sec.android.app.samsungapps` - Galaxy Store
- `com.miui.analytics` - MIUI Analytics
- `com.miui.msa.global` - MIUI Ad Services
- `com.tiktok.android` - TikTok

### Safe (Third-Party)
- `com.google.android.apps.maps` - Google Maps
- `com.google.android.gm` - Gmail
- `com.google.android.youtube` - YouTube
- `com.google.android.apps.photos` - Google Photos
- `com.android.chrome` - Chrome Browser
- `com.netflix.mediaclient` - Netflix
- `com.spotify.music` - Spotify
- `com.android.calendar` - Calendar
- `com.android.calculator2` - Calculator

---

## Adding New Packages

### Method 1: Direct Addition

Edit `src-tauri/src/package_database.rs` and add to the `PACKAGE_DB` initialization:

```rust
db.insert("com.example.app".to_string(), PackageInfo {
    name: "com.example.app".to_string(),
    display_name: "Example App".to_string(),
    safety_level: SafetyLevel::Caution,
    reason: "Pre-installed bloatware - safe to remove".to_string(),
    can_reinstall: true,
});
```

### Method 2: Pattern Matching

Unknown packages are automatically classified using pattern matching in `get_safety_level()`:

```rust
if package.contains("com.mybrand") {
    SafetyLevel::Caution
}
```

Add your OEM brand to the pattern matching logic for automatic classification.

---

## Integration with Commands

The `commands.rs` module uses the package database:

```rust
use crate::package_database::{get_safety_level, get_display_name};

fn determine_safety_level(package_name: &str) -> String {
    get_safety_level(package_name).as_str().to_string()
}

fn get_app_name(package_name: &str) -> String {
    get_display_name(package_name)
}
```

---

## Testing

Run the included unit tests:

```bash
cd src-tauri
cargo test package_database
```

**Test Coverage:**
- Safety level classification
- Safe-to-remove logic
- Pattern matching for unknown packages
- Display name formatting

---

## Performance

- **Lazy Initialization:** Database is created once on first access using `once_cell`
- **HashMap Lookup:** O(1) average case for known packages
- **Pattern Matching:** O(n) worst case for unknown packages (n = number of patterns)

---

## Example Usage in UI

```typescript
// Frontend code calling list_packages
const packages = await invoke('list_packages');

packages.forEach(pkg => {
  const color = {
    'Safe': 'green',
    'Caution': 'yellow',
    'Expert': 'orange',
    'Dangerous': 'red'
  }[pkg.safetyLevel];
  
  console.log(`${pkg.appName}: ${color}`);
});
```

---

## Safety Guidelines

### ✅ Generally Safe to Remove
- Pre-installed third-party apps (Netflix, Spotify)
- OEM app stores if using Play Store
- Social media apps (Facebook, Instagram)
- Carrier bloatware (if not on contract)

### ⚠️ Remove with Caution
- OEM services (Samsung Cloud, MIUI Analytics)
- Voice assistants (Bixby, Google Assistant)
- OEM-specific features (Game Tools, Edge Panels)

### 🛑 DO NOT Remove
- System UI, Phone, Settings
- Google Play Store, Play Services
- Launcher (unless you have another installed)
- Bluetooth, NFC (if you use them)

---

## Extensibility

### Current: 50+ packages categorized
### Easy to extend:
1. Add entries to `PACKAGE_DB` hashmap
2. Update pattern matching in `get_safety_level()`
3. Run tests to verify
4. Rebuild Tauri app

### Future Enhancements:
- Import from JSON/YAML config file
- Crowdsourced package database
- Dynamic updates from online API
- Per-device manufacturer profiles

---

## Summary

The package database provides:
- ✅ 50+ pre-categorized packages
- ✅ Intelligent pattern matching for unknowns
- ✅ Clear safety levels with reasons
- ✅ Easy to extend and maintain
- ✅ Type-safe Rust API
- ✅ Unit tested

Perfect for helping users safely debloat their Android devices! 🎯
