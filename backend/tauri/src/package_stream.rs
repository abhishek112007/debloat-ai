//! Async Package Streaming Module
//! 
//! This module provides non-blocking, chunked package list streaming
//! to prevent UI freezes when loading large package lists from Android devices.
//!
//! Architecture:
//! - Uses async ADB command execution to avoid blocking the main thread
//! - Streams packages in chunks of 30 items via Tauri events
//! - Caches results per device to avoid redundant ADB calls
//! - Emits progress events for smooth UI updates

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::Mutex;

use crate::package_database::{get_display_name, get_safety_level};

// ===== Constants =====
const CHUNK_SIZE: usize = 30;
const CACHE_DURATION_SECS: u64 = 300; // 5 minutes

// ===== Data Types =====

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamedPackage {
    pub package_name: String,
    pub app_name: String,
    pub safety_level: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageChunk {
    pub packages: Vec<StreamedPackage>,
    pub chunk_index: usize,
    pub total_so_far: usize,
    pub is_final: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamProgress {
    pub status: String,
    pub packages_loaded: usize,
    pub is_complete: bool,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamComplete {
    pub total_packages: usize,
    pub duration_ms: u64,
    pub from_cache: bool,
}

// ===== Package Cache =====

struct CachedPackages {
    packages: Vec<StreamedPackage>,
    timestamp: Instant,
    device_serial: String,
}

lazy_static::lazy_static! {
    static ref PACKAGE_CACHE: Arc<Mutex<Option<CachedPackages>>> = Arc::new(Mutex::new(None));
}

// ===== ADB Path Detection (async version) =====

async fn find_adb_path_async() -> Option<String> {
    // Check if 'adb' is in PATH
    if let Ok(output) = Command::new("adb").arg("version").output().await {
        if output.status.success() {
            return Some("adb".to_string());
        }
    }

    // Common paths for Windows
    #[cfg(target_os = "windows")]
    {
        let paths = vec![
            r"C:\platform-tools\adb.exe",
            r"C:\Program Files (x86)\Android\android-sdk\platform-tools\adb.exe",
            r"C:\Android\sdk\platform-tools\adb.exe",
        ];
        
        for path in paths {
            if std::path::Path::new(path).exists() {
                return Some(path.to_string());
            }
        }
        
        // Check LOCALAPPDATA
        if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
            let path = format!(r"{}\Android\Sdk\platform-tools\adb.exe", local_app_data);
            if std::path::Path::new(&path).exists() {
                return Some(path);
            }
        }
    }

    // Common paths for macOS/Linux
    #[cfg(not(target_os = "windows"))]
    {
        let paths = vec![
            "/usr/local/bin/adb",
            "/usr/bin/adb",
        ];
        
        for path in paths {
            if std::path::Path::new(path).exists() {
                return Some(path.to_string());
            }
        }
        
        if let Ok(home) = std::env::var("HOME") {
            let sdk_path = format!("{}/Library/Android/sdk/platform-tools/adb", home);
            if std::path::Path::new(&sdk_path).exists() {
                return Some(sdk_path);
            }
            let linux_path = format!("{}/Android/Sdk/platform-tools/adb", home);
            if std::path::Path::new(&linux_path).exists() {
                return Some(linux_path);
            }
        }
    }

    None
}

// ===== Get Current Device Serial =====

async fn get_device_serial_async() -> Result<String, String> {
    let adb_path = find_adb_path_async().await
        .ok_or_else(|| "ADB not found".to_string())?;
    
    let output = Command::new(&adb_path)
        .args(["devices", "-l"])
        .output()
        .await
        .map_err(|e| format!("Failed to execute ADB: {}", e))?;
    
    if !output.status.success() {
        return Err("ADB command failed".to_string());
    }
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    
    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("List of devices") || line.starts_with("*") {
            continue;
        }
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 && parts[1] == "device" {
            return Ok(parts[0].to_string());
        }
    }
    
    Err("No device connected".to_string())
}

// ===== Stream Packages from Device =====

async fn stream_packages_from_adb(
    app_handle: AppHandle,
    device_serial: String,
) -> Result<Vec<StreamedPackage>, String> {
    let adb_path = find_adb_path_async().await
        .ok_or_else(|| "ADB not found".to_string())?;
    
    // Emit start event
    let _ = app_handle.emit("package_stream_progress", StreamProgress {
        status: "Starting package scan...".to_string(),
        packages_loaded: 0,
        is_complete: false,
        error: None,
    });
    
    let start_time = Instant::now();
    
    // Use tokio Command for async execution
    let mut child = Command::new(&adb_path)
        .args(["-s", &device_serial, "shell", "pm", "list", "packages", "-a"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn ADB process: {}", e))?;
    
    let stdout = child.stdout.take()
        .ok_or_else(|| "Failed to capture stdout".to_string())?;
    
    let reader = BufReader::new(stdout);
    let mut lines = reader.lines();
    
    let mut all_packages: Vec<StreamedPackage> = Vec::new();
    let mut chunk: Vec<StreamedPackage> = Vec::with_capacity(CHUNK_SIZE);
    let mut chunk_index: usize = 0;
    
    // Process line by line
    while let Ok(Some(line)) = lines.next_line().await {
        if let Some(package_name) = line.strip_prefix("package:") {
            let package_name = package_name.trim().to_string();
            
            // Skip empty package names
            if package_name.is_empty() {
                continue;
            }
            
            let app_name = get_display_name(&package_name);
            let safety_level = get_safety_level(&package_name).as_str().to_string();
            
            let pkg = StreamedPackage {
                package_name,
                app_name,
                safety_level,
            };
            
            chunk.push(pkg.clone());
            all_packages.push(pkg);
            
            // Emit chunk when full
            if chunk.len() >= CHUNK_SIZE {
                let _ = app_handle.emit("package_chunk", PackageChunk {
                    packages: chunk.clone(),
                    chunk_index,
                    total_so_far: all_packages.len(),
                    is_final: false,
                });
                
                let _ = app_handle.emit("package_stream_progress", StreamProgress {
                    status: format!("Loading packages... ({})", all_packages.len()),
                    packages_loaded: all_packages.len(),
                    is_complete: false,
                    error: None,
                });
                
                chunk.clear();
                chunk_index += 1;
                
                // Small yield to allow UI updates
                tokio::task::yield_now().await;
            }
        }
    }
    
    // Wait for process to complete
    let status = child.wait().await
        .map_err(|e| format!("Failed to wait for ADB: {}", e))?;
    
    if !status.success() {
        return Err("ADB command failed".to_string());
    }
    
    // Emit remaining packages
    if !chunk.is_empty() {
        let _ = app_handle.emit("package_chunk", PackageChunk {
            packages: chunk,
            chunk_index,
            total_so_far: all_packages.len(),
            is_final: true,
        });
    }
    
    // Sort packages alphabetically
    all_packages.sort_by(|a, b| a.package_name.cmp(&b.package_name));
    
    let duration = start_time.elapsed();
    
    // Emit completion event
    let _ = app_handle.emit("package_stream_complete", StreamComplete {
        total_packages: all_packages.len(),
        duration_ms: duration.as_millis() as u64,
        from_cache: false,
    });
    
    let _ = app_handle.emit("package_stream_progress", StreamProgress {
        status: format!("Loaded {} packages", all_packages.len()),
        packages_loaded: all_packages.len(),
        is_complete: true,
        error: None,
    });
    
    Ok(all_packages)
}

// ===== Tauri Commands =====

/// Start streaming packages from the connected device
/// This command returns immediately and emits events as packages are loaded
#[tauri::command]
pub async fn start_package_stream(app_handle: AppHandle, force_refresh: bool) -> Result<(), String> {
    // Get device serial first
    let device_serial = get_device_serial_async().await?;
    
    // Check cache
    {
        let cache = PACKAGE_CACHE.lock().await;
        if !force_refresh {
            if let Some(ref cached) = *cache {
                if cached.device_serial == device_serial 
                    && cached.timestamp.elapsed() < Duration::from_secs(CACHE_DURATION_SECS) 
                {
                    // Emit cached packages in chunks
                    let packages = cached.packages.clone();
                    drop(cache); // Release lock before emitting
                    
                    let _ = app_handle.emit("package_stream_progress", StreamProgress {
                        status: "Loading from cache...".to_string(),
                        packages_loaded: 0,
                        is_complete: false,
                        error: None,
                    });
                    
                    // Emit in chunks for consistency
                    for (chunk_index, chunk) in packages.chunks(CHUNK_SIZE).enumerate() {
                        let is_final = (chunk_index + 1) * CHUNK_SIZE >= packages.len();
                        let total_so_far = std::cmp::min((chunk_index + 1) * CHUNK_SIZE, packages.len());
                        
                        let _ = app_handle.emit("package_chunk", PackageChunk {
                            packages: chunk.to_vec(),
                            chunk_index,
                            total_so_far,
                            is_final,
                        });
                        
                        // Small yield
                        tokio::task::yield_now().await;
                    }
                    
                    let _ = app_handle.emit("package_stream_complete", StreamComplete {
                        total_packages: packages.len(),
                        duration_ms: 0,
                        from_cache: true,
                    });
                    
                    let _ = app_handle.emit("package_stream_progress", StreamProgress {
                        status: format!("Loaded {} packages (cached)", packages.len()),
                        packages_loaded: packages.len(),
                        is_complete: true,
                        error: None,
                    });
                    
                    return Ok(());
                }
            }
        }
    }
    
    // Spawn async task to stream packages
    let app_handle_clone = app_handle.clone();
    let device_serial_clone = device_serial.clone();
    
    tauri::async_runtime::spawn(async move {
        match stream_packages_from_adb(app_handle_clone.clone(), device_serial_clone.clone()).await {
            Ok(packages) => {
                // Update cache
                let mut cache = PACKAGE_CACHE.lock().await;
                *cache = Some(CachedPackages {
                    packages,
                    timestamp: Instant::now(),
                    device_serial: device_serial_clone,
                });
            }
            Err(error) => {
                let _ = app_handle_clone.emit("package_stream_progress", StreamProgress {
                    status: "Error loading packages".to_string(),
                    packages_loaded: 0,
                    is_complete: true,
                    error: Some(error),
                });
            }
        }
    });
    
    Ok(())
}

/// Get cached packages synchronously (for initial load or fallback)
#[tauri::command]
pub async fn get_cached_packages() -> Result<Vec<StreamedPackage>, String> {
    let cache = PACKAGE_CACHE.lock().await;
    if let Some(ref cached) = *cache {
        Ok(cached.packages.clone())
    } else {
        Err("No cached packages available".to_string())
    }
}

/// Clear the package cache
#[tauri::command]
pub async fn clear_package_cache() -> Result<(), String> {
    let mut cache = PACKAGE_CACHE.lock().await;
    *cache = None;
    Ok(())
}

/// Get current cache status
#[tauri::command]
pub async fn get_cache_status() -> Result<HashMap<String, serde_json::Value>, String> {
    let cache = PACKAGE_CACHE.lock().await;
    let mut status = HashMap::new();
    
    if let Some(ref cached) = *cache {
        status.insert("has_cache".to_string(), serde_json::Value::Bool(true));
        status.insert("package_count".to_string(), serde_json::Value::Number(cached.packages.len().into()));
        status.insert("device_serial".to_string(), serde_json::Value::String(cached.device_serial.clone()));
        status.insert("age_seconds".to_string(), serde_json::Value::Number((cached.timestamp.elapsed().as_secs() as i64).into()));
        status.insert("is_expired".to_string(), serde_json::Value::Bool(
            cached.timestamp.elapsed() > Duration::from_secs(CACHE_DURATION_SECS)
        ));
    } else {
        status.insert("has_cache".to_string(), serde_json::Value::Bool(false));
    }
    
    Ok(status)
}
