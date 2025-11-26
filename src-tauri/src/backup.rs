use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use chrono::{DateTime, Utc};

// Data structure for backup file
#[derive(Debug, Serialize, Deserialize)]
pub struct BackupData {
    pub version: String,
    pub timestamp: String,
    pub device_name: String,
    pub packages: Vec<String>,
}

// Response for create_backup command
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBackupResult {
    pub success: bool,
    pub backup_file: Option<String>,
    pub error: Option<String>,
}

// Information about a backup file
#[derive(Debug, Serialize, Deserialize)]
pub struct BackupInfo {
    pub filename: String,
    pub date: String,
    pub count: usize,
    pub device_name: Option<String>,
}

// Response for restore_backup command
#[derive(Debug, Serialize, Deserialize)]
pub struct RestoreBackupResult {
    pub success: bool,
    pub restored: usize,
    pub failed: usize,
    pub errors: Vec<String>,
}

/// Get the backup directory path
fn get_backup_directory() -> Result<PathBuf, String> {
    // Get user documents directory
    let documents = dirs::document_dir()
        .ok_or_else(|| "Could not find Documents directory".to_string())?;
    
    // Create AndroidDebloater/backups subdirectory
    let backup_dir = documents.join("AndroidDebloater").join("backups");
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;
    
    Ok(backup_dir)
}

/// Get device name from ADB
fn get_device_name() -> String {
    let output = Command::new("adb")
        .args(&["shell", "getprop", "ro.product.model"])
        .output();
    
    match output {
        Ok(out) if out.status.success() => {
            String::from_utf8_lossy(&out.stdout).trim().to_string()
        }
        _ => "Unknown Device".to_string(),
    }
}

/// Execute ADB command to reinstall a package
fn reinstall_package(package: &str) -> Result<(), String> {
    let output = Command::new("adb")
        .args(&["shell", "cmd", "package", "install-existing", package])
        .output()
        .map_err(|e| format!("Failed to execute ADB: {}", e))?;
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("ADB command failed: {}", stderr));
    }
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // Check if installation was successful
    if stdout.to_lowercase().contains("success") || stdout.contains("installed") {
        Ok(())
    } else if stdout.to_lowercase().contains("failure") {
        Err(format!("Installation failed: {}", stdout.trim()))
    } else {
        // Some devices return different messages
        Ok(())
    }
}

/// Create a backup of packages
#[tauri::command]
pub fn create_backup(packages: Vec<String>) -> CreateBackupResult {
    // Get current timestamp
    let now: DateTime<Utc> = Utc::now();
    let timestamp_iso = now.to_rfc3339();
    let timestamp_filename = now.format("%Y-%m-%d_%H%M%S").to_string();
    
    // Get device name
    let device_name = get_device_name();
    
    // Create backup data structure
    let backup_data = BackupData {
        version: "1.0".to_string(),
        timestamp: timestamp_iso,
        device_name: device_name.clone(),
        packages: packages.clone(),
    };
    
    // Serialize to JSON
    let json_data = match serde_json::to_string_pretty(&backup_data) {
        Ok(data) => data,
        Err(e) => {
            return CreateBackupResult {
                success: false,
                backup_file: None,
                error: Some(format!("Failed to serialize backup data: {}", e)),
            }
        }
    };
    
    // Get backup directory
    let backup_dir = match get_backup_directory() {
        Ok(dir) => dir,
        Err(e) => {
            return CreateBackupResult {
                success: false,
                backup_file: None,
                error: Some(e),
            }
        }
    };
    
    // Create filename
    let filename = format!("backup_{}.json", timestamp_filename);
    let filepath = backup_dir.join(&filename);
    
    // Write to file
    match fs::write(&filepath, json_data) {
        Ok(_) => CreateBackupResult {
            success: true,
            backup_file: Some(filename),
            error: None,
        },
        Err(e) => CreateBackupResult {
            success: false,
            backup_file: None,
            error: Some(format!("Failed to write backup file: {}", e)),
        },
    }
}

/// List all available backups
#[tauri::command]
pub fn list_backups() -> Result<Vec<BackupInfo>, String> {
    let backup_dir = get_backup_directory()?;
    
    let mut backups = Vec::new();
    
    // Read directory entries
    let entries = fs::read_dir(&backup_dir)
        .map_err(|e| format!("Failed to read backup directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        // Only process JSON files
        if path.extension().and_then(|s| s.to_str()) != Some("json") {
            continue;
        }
        
        let filename = match path.file_name().and_then(|s| s.to_str()) {
            Some(name) => name.to_string(),
            None => continue,
        };
        
        // Try to read and parse the backup file
        let file_content = match fs::read_to_string(&path) {
            Ok(content) => content,
            Err(_) => continue, // Skip files we can't read
        };
        
        let backup_data: BackupData = match serde_json::from_str(&file_content) {
            Ok(data) => data,
            Err(_) => continue, // Skip invalid JSON files
        };
        
        backups.push(BackupInfo {
            filename,
            date: backup_data.timestamp,
            count: backup_data.packages.len(),
            device_name: Some(backup_data.device_name),
        });
    }
    
    // Sort by date (newest first)
    backups.sort_by(|a, b| b.date.cmp(&a.date));
    
    Ok(backups)
}

/// Restore packages from a backup
#[tauri::command]
pub fn restore_backup(filename: String) -> RestoreBackupResult {
    // Get backup directory
    let backup_dir = match get_backup_directory() {
        Ok(dir) => dir,
        Err(e) => {
            return RestoreBackupResult {
                success: false,
                restored: 0,
                failed: 0,
                errors: vec![e],
            }
        }
    };
    
    // Read backup file
    let filepath = backup_dir.join(&filename);
    let file_content = match fs::read_to_string(&filepath) {
        Ok(content) => content,
        Err(e) => {
            return RestoreBackupResult {
                success: false,
                restored: 0,
                failed: 0,
                errors: vec![format!("Failed to read backup file: {}", e)],
            }
        }
    };
    
    // Parse JSON
    let backup_data: BackupData = match serde_json::from_str(&file_content) {
        Ok(data) => data,
        Err(e) => {
            return RestoreBackupResult {
                success: false,
                restored: 0,
                failed: 0,
                errors: vec![format!("Failed to parse backup file: {}", e)],
            }
        }
    };
    
    // Restore each package
    let mut restored = 0;
    let mut failed = 0;
    let mut errors = Vec::new();
    
    for package in backup_data.packages {
        match reinstall_package(&package) {
            Ok(_) => {
                restored += 1;
            }
            Err(e) => {
                failed += 1;
                errors.push(format!("{}: {}", package, e));
            }
        }
    }
    
    RestoreBackupResult {
        success: failed == 0,
        restored,
        failed,
        errors,
    }
}

/// Delete a backup file
#[tauri::command]
pub fn delete_backup(filename: String) -> Result<bool, String> {
    let backup_dir = get_backup_directory()?;
    let filepath = backup_dir.join(&filename);
    
    // Verify it's a JSON file to prevent accidental deletion of other files
    if filepath.extension().and_then(|s| s.to_str()) != Some("json") {
        return Err("Invalid backup file".to_string());
    }
    
    fs::remove_file(&filepath)
        .map_err(|e| format!("Failed to delete backup file: {}", e))?;
    
    Ok(true)
}

/// Get backup directory path (for UI display)
#[tauri::command]
pub fn get_backup_path() -> Result<String, String> {
    let backup_dir = get_backup_directory()?;
    Ok(backup_dir
        .to_str()
        .ok_or_else(|| "Invalid path".to_string())?
        .to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_backup_data_serialization() {
        let backup = BackupData {
            version: "1.0".to_string(),
            timestamp: "2025-11-04T13:45:00Z".to_string(),
            device_name: "Pixel 6".to_string(),
            packages: vec!["com.facebook".to_string(), "com.instagram".to_string()],
        };

        let json = serde_json::to_string(&backup).unwrap();
        assert!(json.contains("1.0"));
        assert!(json.contains("Pixel 6"));
        assert!(json.contains("com.facebook"));
    }

    #[test]
    fn test_backup_directory_creation() {
        let result = get_backup_directory();
        assert!(result.is_ok());
    }
}
