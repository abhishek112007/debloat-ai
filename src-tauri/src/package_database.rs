use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use once_cell::sync::Lazy;

/// Safety level for package removal
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SafetyLevel {
    /// Safe to remove - Third-party apps, bloatware
    Safe,
    /// Caution - OEM apps, may affect some features
    Caution,
    /// Expert - May break functionality, requires knowledge
    Expert,
    /// Dangerous - Critical system apps, DO NOT REMOVE
    Dangerous,
}

impl SafetyLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            SafetyLevel::Safe => "Safe",
            SafetyLevel::Caution => "Caution",
            SafetyLevel::Expert => "Expert",
            SafetyLevel::Dangerous => "Dangerous",
        }
    }
}

/// Information about a package
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageInfo {
    pub name: String,
    pub display_name: String,
    pub safety_level: SafetyLevel,
    pub reason: String,
    pub can_reinstall: bool,
}

/// Global package database (initialized once)
static PACKAGE_DB: Lazy<HashMap<String, PackageInfo>> = Lazy::new(|| {
    let mut db = HashMap::new();

    // ========== DANGEROUS (Critical System Apps) ==========
    
    db.insert("com.android.systemui".to_string(), PackageInfo {
        name: "com.android.systemui".to_string(),
        display_name: "System UI".to_string(),
        safety_level: SafetyLevel::Dangerous,
        reason: "Critical system component - manages UI, notifications, status bar".to_string(),
        can_reinstall: false,
    });

    db.insert("com.android.phone".to_string(), PackageInfo {
        name: "com.android.phone".to_string(),
        display_name: "Phone".to_string(),
        safety_level: SafetyLevel::Dangerous,
        reason: "Required for phone calls and cellular functionality".to_string(),
        can_reinstall: false,
    });

    db.insert("com.android.settings".to_string(), PackageInfo {
        name: "com.android.settings".to_string(),
        display_name: "Settings".to_string(),
        safety_level: SafetyLevel::Dangerous,
        reason: "System settings app - removing will break device configuration".to_string(),
        can_reinstall: false,
    });

    db.insert("com.android.launcher3".to_string(), PackageInfo {
        name: "com.android.launcher3".to_string(),
        display_name: "Launcher".to_string(),
        safety_level: SafetyLevel::Dangerous,
        reason: "Default launcher - removing may prevent accessing home screen".to_string(),
        can_reinstall: false,
    });

    db.insert("com.android.vending".to_string(), PackageInfo {
        name: "com.android.vending".to_string(),
        display_name: "Google Play Store".to_string(),
        safety_level: SafetyLevel::Dangerous,
        reason: "Required for app installation and updates".to_string(),
        can_reinstall: false,
    });

    // ========== EXPERT (Advanced - May Break Features) ==========

    db.insert("com.google.android.gms".to_string(), PackageInfo {
        name: "com.google.android.gms".to_string(),
        display_name: "Google Play Services".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "Many apps depend on this - removing may break functionality".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.gsf".to_string(), PackageInfo {
        name: "com.google.android.gsf".to_string(),
        display_name: "Google Services Framework".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "Required for Google account sync and Play Store".to_string(),
        can_reinstall: true,
    });

    db.insert("com.android.bluetooth".to_string(), PackageInfo {
        name: "com.android.bluetooth".to_string(),
        display_name: "Bluetooth".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "Bluetooth functionality - removing disables BT completely".to_string(),
        can_reinstall: false,
    });

    db.insert("com.android.nfc".to_string(), PackageInfo {
        name: "com.android.nfc".to_string(),
        display_name: "NFC Service".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "Near-field communication - needed for contactless payments".to_string(),
        can_reinstall: false,
    });

    db.insert("com.android.providers.contacts".to_string(), PackageInfo {
        name: "com.android.providers.contacts".to_string(),
        display_name: "Contacts Storage".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "Stores contacts data - removing may cause data loss".to_string(),
        can_reinstall: false,
    });

    db.insert("com.verizon.services".to_string(), PackageInfo {
        name: "com.verizon.services".to_string(),
        display_name: "Verizon Services".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "Carrier-specific services - may affect network features".to_string(),
        can_reinstall: true,
    });

    db.insert("com.att.myWireless".to_string(), PackageInfo {
        name: "com.att.myWireless".to_string(),
        display_name: "AT&T MyWireless".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "AT&T account management - may affect carrier features".to_string(),
        can_reinstall: true,
    });

    db.insert("com.sprint.zone".to_string(), PackageInfo {
        name: "com.sprint.zone".to_string(),
        display_name: "Sprint Zone".to_string(),
        safety_level: SafetyLevel::Expert,
        reason: "Sprint carrier app - may impact network services".to_string(),
        can_reinstall: true,
    });

    // ========== CAUTION (OEM Bloatware - May Affect Features) ==========

    db.insert("com.facebook.katana".to_string(), PackageInfo {
        name: "com.facebook.katana".to_string(),
        display_name: "Facebook".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Pre-installed Facebook app - safe to remove but may be system app".to_string(),
        can_reinstall: true,
    });

    db.insert("com.facebook.services".to_string(), PackageInfo {
        name: "com.facebook.services".to_string(),
        display_name: "Facebook Services".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Facebook background services - tracks usage".to_string(),
        can_reinstall: true,
    });

    db.insert("com.facebook.system".to_string(), PackageInfo {
        name: "com.facebook.system".to_string(),
        display_name: "Facebook App Manager".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Facebook system integration - can be removed".to_string(),
        can_reinstall: true,
    });

    db.insert("com.instagram.android".to_string(), PackageInfo {
        name: "com.instagram.android".to_string(),
        display_name: "Instagram".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Pre-installed Instagram - safe to remove".to_string(),
        can_reinstall: true,
    });

    db.insert("com.whatsapp".to_string(), PackageInfo {
        name: "com.whatsapp".to_string(),
        display_name: "WhatsApp".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Pre-installed messaging app - can be reinstalled from Play Store".to_string(),
        can_reinstall: true,
    });

    db.insert("com.samsung.android.app.spage".to_string(), PackageInfo {
        name: "com.samsung.android.app.spage".to_string(),
        display_name: "Samsung Free".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Samsung news/content aggregator - safe to remove".to_string(),
        can_reinstall: true,
    });

    db.insert("com.samsung.android.bixby.agent".to_string(), PackageInfo {
        name: "com.samsung.android.bixby.agent".to_string(),
        display_name: "Bixby Voice".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Samsung voice assistant - safe to remove if not used".to_string(),
        can_reinstall: true,
    });

    db.insert("com.samsung.android.game.gametools".to_string(), PackageInfo {
        name: "com.samsung.android.game.gametools".to_string(),
        display_name: "Game Tools".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Samsung gaming features - safe to remove if not gaming".to_string(),
        can_reinstall: true,
    });

    db.insert("com.sec.android.app.samsungapps".to_string(), PackageInfo {
        name: "com.sec.android.app.samsungapps".to_string(),
        display_name: "Galaxy Store".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Samsung app store - can be removed if using Play Store only".to_string(),
        can_reinstall: true,
    });

    db.insert("com.samsung.android.messaging".to_string(), PackageInfo {
        name: "com.samsung.android.messaging".to_string(),
        display_name: "Samsung Messages".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Samsung SMS app - safe if using alternative messaging app".to_string(),
        can_reinstall: true,
    });

    db.insert("com.xiaomi.micloud.sdk".to_string(), PackageInfo {
        name: "com.xiaomi.micloud.sdk".to_string(),
        display_name: "Mi Cloud".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Xiaomi cloud services - safe to remove if not using Mi account".to_string(),
        can_reinstall: true,
    });

    db.insert("com.miui.analytics".to_string(), PackageInfo {
        name: "com.miui.analytics".to_string(),
        display_name: "MIUI Analytics".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Xiaomi usage tracking - recommended to remove for privacy".to_string(),
        can_reinstall: true,
    });

    db.insert("com.miui.msa.global".to_string(), PackageInfo {
        name: "com.miui.msa.global".to_string(),
        display_name: "MIUI Ad Services".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Xiaomi advertising service - safe to remove".to_string(),
        can_reinstall: true,
    });

    db.insert("com.huawei.appmarket".to_string(), PackageInfo {
        name: "com.huawei.appmarket".to_string(),
        display_name: "Huawei AppGallery".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Huawei app store - can be removed if using alternatives".to_string(),
        can_reinstall: true,
    });

    db.insert("com.oppo.market".to_string(), PackageInfo {
        name: "com.oppo.market".to_string(),
        display_name: "OPPO App Market".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "OPPO app store - safe to remove".to_string(),
        can_reinstall: true,
    });

    // ========== SAFE (Third-party Apps, Easy to Reinstall) ==========

    db.insert("com.google.android.apps.maps".to_string(), PackageInfo {
        name: "com.google.android.apps.maps".to_string(),
        display_name: "Google Maps".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Navigation app - easily reinstallable from Play Store".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.gm".to_string(), PackageInfo {
        name: "com.google.android.gm".to_string(),
        display_name: "Gmail".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Email client - can be reinstalled from Play Store".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.youtube".to_string(), PackageInfo {
        name: "com.google.android.youtube".to_string(),
        display_name: "YouTube".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Video streaming app - easily reinstallable".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.apps.photos".to_string(), PackageInfo {
        name: "com.google.android.apps.photos".to_string(),
        display_name: "Google Photos".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Photo management app - can be reinstalled".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.apps.docs".to_string(), PackageInfo {
        name: "com.google.android.apps.docs".to_string(),
        display_name: "Google Drive".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Cloud storage app - reinstallable from Play Store".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.music".to_string(), PackageInfo {
        name: "com.google.android.music".to_string(),
        display_name: "Google Play Music".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Music player (deprecated) - safe to remove".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.videos".to_string(), PackageInfo {
        name: "com.google.android.videos".to_string(),
        display_name: "Google Play Movies & TV".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Video streaming app - easily reinstallable".to_string(),
        can_reinstall: true,
    });

    db.insert("com.android.chrome".to_string(), PackageInfo {
        name: "com.android.chrome".to_string(),
        display_name: "Chrome Browser".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Web browser - can be reinstalled from Play Store".to_string(),
        can_reinstall: true,
    });

    db.insert("com.netflix.mediaclient".to_string(), PackageInfo {
        name: "com.netflix.mediaclient".to_string(),
        display_name: "Netflix".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Pre-installed streaming app - easily reinstallable".to_string(),
        can_reinstall: true,
    });

    db.insert("com.spotify.music".to_string(), PackageInfo {
        name: "com.spotify.music".to_string(),
        display_name: "Spotify".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Music streaming app - reinstallable from Play Store".to_string(),
        can_reinstall: true,
    });

    db.insert("com.microsoft.office.officehubrow".to_string(), PackageInfo {
        name: "com.microsoft.office.officehubrow".to_string(),
        display_name: "Microsoft Office".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Office productivity app - can be reinstalled".to_string(),
        can_reinstall: true,
    });

    db.insert("com.android.calendar".to_string(), PackageInfo {
        name: "com.android.calendar".to_string(),
        display_name: "Calendar".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Calendar app - safe to remove if using alternative".to_string(),
        can_reinstall: true,
    });

    db.insert("com.android.calculator2".to_string(), PackageInfo {
        name: "com.android.calculator2".to_string(),
        display_name: "Calculator".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Calculator app - easily replaceable".to_string(),
        can_reinstall: true,
    });

    db.insert("com.android.deskclock".to_string(), PackageInfo {
        name: "com.android.deskclock".to_string(),
        display_name: "Clock".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Clock/timer/alarm app - safe to remove if using alternative".to_string(),
        can_reinstall: true,
    });

    db.insert("com.android.email".to_string(), PackageInfo {
        name: "com.android.email".to_string(),
        display_name: "Email".to_string(),
        safety_level: SafetyLevel::Safe,
        reason: "Stock email client - safe to remove if using Gmail/Outlook".to_string(),
        can_reinstall: true,
    });

    // Additional bloatware patterns

    db.insert("com.tiktok.android".to_string(), PackageInfo {
        name: "com.tiktok.android".to_string(),
        display_name: "TikTok".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Pre-installed social media app - tracks usage extensively".to_string(),
        can_reinstall: true,
    });

    db.insert("com.android.traceur".to_string(), PackageInfo {
        name: "com.android.traceur".to_string(),
        display_name: "System Tracing".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Developer debugging tool - safe to remove for regular users".to_string(),
        can_reinstall: true,
    });

    db.insert("com.google.android.apps.turbo".to_string(), PackageInfo {
        name: "com.google.android.apps.turbo".to_string(),
        display_name: "Device Health Services".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Background optimization - may affect battery estimates".to_string(),
        can_reinstall: true,
    });

    db.insert("com.samsung.android.scloud".to_string(), PackageInfo {
        name: "com.samsung.android.scloud".to_string(),
        display_name: "Samsung Cloud".to_string(),
        safety_level: SafetyLevel::Caution,
        reason: "Samsung backup service - safe to remove if using Google backup".to_string(),
        can_reinstall: true,
    });

    db
});

/// Get safety level for a package
pub fn get_safety_level(package: &str) -> SafetyLevel {
    PACKAGE_DB
        .get(package)
        .map(|info| info.safety_level)
        .unwrap_or_else(|| {
            // Pattern matching for unknown packages
            if package.contains("com.facebook") 
                || package.contains("com.instagram")
                || package.contains("com.tiktok") {
                SafetyLevel::Caution
            } else if package.contains("com.google.android.gms")
                || package.contains("com.android.vending")
                || package.contains("com.android.systemui") {
                SafetyLevel::Dangerous
            } else if package.contains("com.samsung")
                || package.contains("com.xiaomi")
                || package.contains("com.miui")
                || package.contains("com.huawei")
                || package.contains("com.oppo")
                || package.contains("com.vivo") {
                SafetyLevel::Caution
            } else {
                // Default to Safe for unknown packages
                SafetyLevel::Safe
            }
        })
}

// Get all known packages from the database
#[allow(dead_code)]
pub fn get_all_packages() -> Vec<PackageInfo> {
    PACKAGE_DB.values().cloned().collect()
}

// Check if a package is safe to remove
#[allow(dead_code)]
pub fn is_safe_to_remove(package: &str) -> bool {
    let level = get_safety_level(package);
    matches!(level, SafetyLevel::Safe | SafetyLevel::Caution)
}

// Get detailed information about a package
#[allow(dead_code)]
pub fn get_package_info(package: &str) -> Option<PackageInfo> {
    PACKAGE_DB.get(package).cloned()
}

/// Get package display name (fallback to package name formatting)
pub fn get_display_name(package: &str) -> String {
    PACKAGE_DB
        .get(package)
        .map(|info| info.display_name.clone())
        .unwrap_or_else(|| {
            // Format package name to readable format
            let parts: Vec<&str> = package.split('.').collect();
            if let Some(last) = parts.last() {
                let formatted: String = last
                    .split('_')
                    .map(|word| {
                        let mut chars = word.chars();
                        match chars.next() {
                            Some(first) => first.to_uppercase().chain(chars).collect(),
                            None => String::new(),
                        }
                    })
                    .collect::<Vec<String>>()
                    .join(" ");
                formatted
            } else {
                package.to_string()
            }
        })
}

// Get safety reason for a package
#[allow(dead_code)]
pub fn get_safety_reason(package: &str) -> String {
    PACKAGE_DB
        .get(package)
        .map(|info| info.reason.clone())
        .unwrap_or_else(|| "No information available for this package.".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_safety_levels() {
        assert_eq!(get_safety_level("com.facebook.katana"), SafetyLevel::Caution);
        assert_eq!(get_safety_level("com.google.android.gms"), SafetyLevel::Expert);
        assert_eq!(get_safety_level("com.android.systemui"), SafetyLevel::Dangerous);
        assert_eq!(get_safety_level("com.google.android.apps.maps"), SafetyLevel::Safe);
    }

    #[test]
    fn test_safe_to_remove() {
        assert!(is_safe_to_remove("com.google.android.apps.maps"));
        assert!(is_safe_to_remove("com.facebook.katana"));
        assert!(!is_safe_to_remove("com.android.systemui"));
        assert!(!is_safe_to_remove("com.google.android.gms"));
    }

    #[test]
    fn test_pattern_matching() {
        // Unknown Facebook package should be flagged as Caution
        assert_eq!(get_safety_level("com.facebook.unknown"), SafetyLevel::Caution);
        
        // Unknown Samsung package should be Caution
        assert_eq!(get_safety_level("com.samsung.unknown"), SafetyLevel::Caution);
    }

    #[test]
    fn test_display_name() {
        assert_eq!(get_display_name("com.facebook.katana"), "Facebook");
        assert_eq!(get_display_name("com.google.android.apps.maps"), "Google Maps");
    }
}
