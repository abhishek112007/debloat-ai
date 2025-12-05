/**
 * System Health Monitor - Rust Backend
 * 
 * Collects real-time device metrics via ADB without blocking the UI.
 * Uses async spawning, caching, and Tauri events for progressive updates.
 * 
 * Metrics collected:
 * - Storage usage (df /data)
 * - RAM usage (/proc/meminfo)
 * - CPU load (top -n 1)
 * - Background services count
 * - Battery-draining apps (dumpsys batterystats)
 * - Thermal status (dumpsys thermalservice)
 * - System vs User app counts
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::process::Command;
use lazy_static::lazy_static;

// ===== Types =====

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StorageInfo {
    pub total_mb: u64,
    pub used_mb: u64,
    pub free_mb: u64,
    pub usage_percent: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MemoryInfo {
    pub total_mb: u64,
    pub available_mb: u64,
    pub used_mb: u64,
    pub usage_percent: f32,
    pub buffers_mb: u64,
    pub cached_mb: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CpuInfo {
    pub usage_percent: f32,
    pub user_percent: f32,
    pub system_percent: f32,
    pub idle_percent: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BatteryDrainer {
    pub app_name: String,
    pub package_name: String,
    pub usage_percent: f32,
    pub foreground_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThermalInfo {
    pub status: String, // "normal", "moderate", "severe", "critical", "unknown"
    pub temperature_c: Option<f32>,
    pub throttling: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppCounts {
    pub system_apps: u32,
    pub user_apps: u32,
    pub total_apps: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SystemHealth {
    pub storage: StorageInfo,
    pub memory: MemoryInfo,
    pub cpu: CpuInfo,
    pub services_count: u32,
    pub battery_drainers: Vec<BatteryDrainer>,
    pub thermal: ThermalInfo,
    pub app_counts: AppCounts,
    pub timestamp: u64,
    pub device_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthUpdateEvent {
    pub health: SystemHealth,
    pub metrics_updated: Vec<String>,
    pub is_complete: bool,
}

// ===== Cache =====

struct CachedMetric<T> {
    data: T,
    updated_at: Instant,
    ttl: Duration,
}

impl<T: Default + Clone> CachedMetric<T> {
    fn new(ttl_secs: u64) -> Self {
        Self {
            data: T::default(),
            updated_at: Instant::now() - Duration::from_secs(ttl_secs + 1), // Force initial fetch
            ttl: Duration::from_secs(ttl_secs),
        }
    }

    fn is_stale(&self) -> bool {
        self.updated_at.elapsed() > self.ttl
    }

    fn update(&mut self, data: T) {
        self.data = data;
        self.updated_at = Instant::now();
    }

    fn get(&self) -> T {
        self.data.clone()
    }
}

struct HealthCache {
    storage: CachedMetric<StorageInfo>,
    memory: CachedMetric<MemoryInfo>,
    cpu: CachedMetric<CpuInfo>,
    services: CachedMetric<u32>,
    battery: CachedMetric<Vec<BatteryDrainer>>,
    thermal: CachedMetric<ThermalInfo>,
    app_counts: CachedMetric<AppCounts>,
    device_id: String,
}

impl HealthCache {
    fn new() -> Self {
        Self {
            storage: CachedMetric::new(3),      // 3 seconds
            memory: CachedMetric::new(2),       // 2 seconds
            cpu: CachedMetric::new(3),          // 3 seconds
            services: CachedMetric::new(10),    // 10 seconds
            battery: CachedMetric::new(30),     // 30 seconds (heavy)
            thermal: CachedMetric::new(5),      // 5 seconds
            app_counts: CachedMetric::new(60),  // 60 seconds
            device_id: String::new(),
        }
    }

    fn invalidate_for_device(&mut self, device_id: &str) {
        if self.device_id != device_id {
            self.device_id = device_id.to_string();
            // Reset all caches for new device
            self.storage = CachedMetric::new(3);
            self.memory = CachedMetric::new(2);
            self.cpu = CachedMetric::new(3);
            self.services = CachedMetric::new(10);
            self.battery = CachedMetric::new(30);
            self.thermal = CachedMetric::new(5);
            self.app_counts = CachedMetric::new(60);
        }
    }
}

lazy_static! {
    static ref HEALTH_CACHE: Mutex<HealthCache> = Mutex::new(HealthCache::new());
}

// ===== ADB Command Helpers =====

async fn run_adb_command(args: &[&str]) -> Result<String, String> {
    let output = Command::new("adb")
        .args(args)
        .output()
        .await
        .map_err(|e| format!("ADB command failed: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

async fn run_adb_shell(command: &str) -> Result<String, String> {
    run_adb_command(&["shell", command]).await
}

// ===== Metric Parsers =====

async fn fetch_storage_info() -> Result<StorageInfo, String> {
    let output = run_adb_shell("df /data 2>/dev/null | tail -1").await?;
    
    // Parse df output: Filesystem  1K-blocks  Used  Available  Use%  Mounted on
    let parts: Vec<&str> = output.split_whitespace().collect();
    
    if parts.len() >= 4 {
        let total_kb: u64 = parts[1].parse().unwrap_or(0);
        let used_kb: u64 = parts[2].parse().unwrap_or(0);
        let available_kb: u64 = parts[3].parse().unwrap_or(0);
        
        let total_mb = total_kb / 1024;
        let used_mb = used_kb / 1024;
        let free_mb = available_kb / 1024;
        let usage_percent = if total_mb > 0 {
            (used_mb as f32 / total_mb as f32) * 100.0
        } else {
            0.0
        };

        return Ok(StorageInfo {
            total_mb,
            used_mb,
            free_mb,
            usage_percent,
        });
    }

    // Fallback: try alternative parsing
    let output = run_adb_shell("df -h /data 2>/dev/null | tail -1").await?;
    let parts: Vec<&str> = output.split_whitespace().collect();
    
    if parts.len() >= 4 {
        let total_mb = parse_size_to_mb(parts[1]);
        let used_mb = parse_size_to_mb(parts[2]);
        let free_mb = parse_size_to_mb(parts[3]);
        let usage_percent = if total_mb > 0 {
            (used_mb as f32 / total_mb as f32) * 100.0
        } else {
            0.0
        };

        return Ok(StorageInfo {
            total_mb,
            used_mb,
            free_mb,
            usage_percent,
        });
    }

    Err("Failed to parse storage info".to_string())
}

fn parse_size_to_mb(size_str: &str) -> u64 {
    let size_str = size_str.trim().to_uppercase();
    let len = size_str.len();
    
    if len < 2 {
        return size_str.parse().unwrap_or(0);
    }

    let (num_str, unit) = size_str.split_at(len - 1);
    let num: f64 = num_str.parse().unwrap_or(0.0);

    match unit {
        "K" => (num / 1024.0) as u64,
        "M" => num as u64,
        "G" => (num * 1024.0) as u64,
        "T" => (num * 1024.0 * 1024.0) as u64,
        _ => num_str.parse().unwrap_or(0),
    }
}

async fn fetch_memory_info() -> Result<MemoryInfo, String> {
    let output = run_adb_shell("cat /proc/meminfo").await?;
    
    let mut mem_info: HashMap<String, u64> = HashMap::new();
    
    for line in output.lines() {
        let parts: Vec<&str> = line.split(':').collect();
        if parts.len() == 2 {
            let key = parts[0].trim().to_string();
            let value_str = parts[1].trim().replace("kB", "").trim().to_string();
            if let Ok(value) = value_str.parse::<u64>() {
                mem_info.insert(key, value);
            }
        }
    }

    let total_kb = *mem_info.get("MemTotal").unwrap_or(&0);
    let available_kb = *mem_info.get("MemAvailable").unwrap_or(&0);
    let buffers_kb = *mem_info.get("Buffers").unwrap_or(&0);
    let cached_kb = *mem_info.get("Cached").unwrap_or(&0);

    let total_mb = total_kb / 1024;
    let available_mb = available_kb / 1024;
    let used_mb = total_mb.saturating_sub(available_mb);
    let usage_percent = if total_mb > 0 {
        (used_mb as f32 / total_mb as f32) * 100.0
    } else {
        0.0
    };

    Ok(MemoryInfo {
        total_mb,
        available_mb,
        used_mb,
        usage_percent,
        buffers_mb: buffers_kb / 1024,
        cached_mb: cached_kb / 1024,
    })
}

async fn fetch_cpu_info() -> Result<CpuInfo, String> {
    // Use top with 1 iteration to get CPU stats
    let output = run_adb_shell("top -n 1 -b 2>/dev/null | head -5").await?;
    
    // Parse CPU line: CPU: X% user Y% sys Z% idle ...
    for line in output.lines() {
        let line_lower = line.to_lowercase();
        if line_lower.contains("cpu") && (line_lower.contains("user") || line_lower.contains("usr")) {
            // Try to extract percentages
            let parts: Vec<&str> = line.split_whitespace().collect();
            
            let mut user_percent: f32 = 0.0;
            let mut system_percent: f32 = 0.0;
            let mut idle_percent: f32 = 0.0;

            for (i, part) in parts.iter().enumerate() {
                if let Ok(val) = part.trim_end_matches('%').parse::<f32>() {
                    if i + 1 < parts.len() {
                        let next = parts[i + 1].to_lowercase();
                        if next.contains("user") || next.contains("usr") {
                            user_percent = val;
                        } else if next.contains("sys") {
                            system_percent = val;
                        } else if next.contains("idle") || next.contains("idl") {
                            idle_percent = val;
                        }
                    }
                }
            }

            // Calculate total usage
            let usage_percent = 100.0 - idle_percent;

            return Ok(CpuInfo {
                usage_percent: usage_percent.max(0.0),
                user_percent,
                system_percent,
                idle_percent,
            });
        }
    }

    // Fallback: try /proc/stat
    let output = run_adb_shell("cat /proc/stat | head -1").await?;
    let parts: Vec<&str> = output.split_whitespace().collect();
    
    if parts.len() >= 5 && parts[0] == "cpu" {
        let user: f32 = parts[1].parse().unwrap_or(0.0);
        let nice: f32 = parts[2].parse().unwrap_or(0.0);
        let system: f32 = parts[3].parse().unwrap_or(0.0);
        let idle: f32 = parts[4].parse().unwrap_or(0.0);
        
        let total = user + nice + system + idle;
        if total > 0.0 {
            return Ok(CpuInfo {
                usage_percent: ((total - idle) / total) * 100.0,
                user_percent: ((user + nice) / total) * 100.0,
                system_percent: (system / total) * 100.0,
                idle_percent: (idle / total) * 100.0,
            });
        }
    }

    Ok(CpuInfo::default())
}

async fn fetch_services_count() -> Result<u32, String> {
    let output = run_adb_shell("service list 2>/dev/null | wc -l").await?;
    let count: u32 = output.trim().parse().unwrap_or(0);
    Ok(count.saturating_sub(1)) // Subtract header line
}

async fn fetch_battery_drainers() -> Result<Vec<BatteryDrainer>, String> {
    // Get battery stats - this is a heavy command
    let output = run_adb_shell("dumpsys batterystats 2>/dev/null | grep -A 50 'Estimated power use'").await?;
    
    let mut drainers: Vec<BatteryDrainer> = Vec::new();
    
    for line in output.lines() {
        let line = line.trim();
        
        // Look for app entries: "Uid XXX: YY.Y mAh (...)""
        if line.starts_with("Uid") && line.contains("mAh") {
            // Extract package info
            if let Some(mah_idx) = line.find("mAh") {
                let before_mah = &line[..mah_idx].trim();
                let parts: Vec<&str> = before_mah.split(':').collect();
                
                if parts.len() >= 2 {
                    let uid_part = parts[0].trim();
                    let mah_str = parts[1].trim();
                    
                    // Extract mAh value
                    let mah: f32 = mah_str.split_whitespace()
                        .next()
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0.0);
                    
                    // Try to get package name from UID
                    let package_name = if uid_part.contains('(') && uid_part.contains(')') {
                        uid_part.split('(')
                            .nth(1)
                            .and_then(|s| s.split(')').next())
                            .unwrap_or(uid_part)
                            .to_string()
                    } else {
                        uid_part.replace("Uid ", "")
                    };

                    if mah > 0.1 {
                        drainers.push(BatteryDrainer {
                            app_name: package_name.split('.').last().unwrap_or(&package_name).to_string(),
                            package_name: package_name.clone(),
                            usage_percent: mah, // Store mAh for now, convert to percent later
                            foreground_time_ms: 0,
                        });
                    }
                }
            }
        }
    }

    // Sort by usage and take top 5
    drainers.sort_by(|a, b| b.usage_percent.partial_cmp(&a.usage_percent).unwrap_or(std::cmp::Ordering::Equal));
    drainers.truncate(5);

    // Convert mAh to percentage of total
    let total_mah: f32 = drainers.iter().map(|d| d.usage_percent).sum();
    if total_mah > 0.0 {
        for drainer in &mut drainers {
            drainer.usage_percent = (drainer.usage_percent / total_mah) * 100.0;
        }
    }

    Ok(drainers)
}

async fn fetch_thermal_info() -> Result<ThermalInfo, String> {
    let output = run_adb_shell("dumpsys thermalservice 2>/dev/null | head -30").await?;
    
    let mut thermal = ThermalInfo {
        status: "unknown".to_string(),
        temperature_c: None,
        throttling: false,
    };

    let output_lower = output.to_lowercase();
    
    // Check for thermal status keywords
    if output_lower.contains("critical") || output_lower.contains("emergency") {
        thermal.status = "critical".to_string();
        thermal.throttling = true;
    } else if output_lower.contains("severe") || output_lower.contains("shutdown") {
        thermal.status = "severe".to_string();
        thermal.throttling = true;
    } else if output_lower.contains("moderate") || output_lower.contains("throttling") {
        thermal.status = "moderate".to_string();
        thermal.throttling = true;
    } else if output_lower.contains("light") || output_lower.contains("normal") || output_lower.contains("none") {
        thermal.status = "normal".to_string();
        thermal.throttling = false;
    }

    // Try to extract temperature
    for line in output.lines() {
        if line.to_lowercase().contains("temperature") || line.contains("mTemperature") {
            // Look for number followed by C or degrees
            let parts: Vec<&str> = line.split_whitespace().collect();
            for part in parts {
                if let Ok(temp) = part.trim_end_matches(&['C', '°', 'c'][..]).parse::<f32>() {
                    if temp > 0.0 && temp < 150.0 {
                        thermal.temperature_c = Some(temp);
                        break;
                    }
                }
            }
        }
    }

    Ok(thermal)
}

async fn fetch_app_counts() -> Result<AppCounts, String> {
    // Count system apps
    let system_output = run_adb_shell("pm list packages -s 2>/dev/null | wc -l").await?;
    let system_apps: u32 = system_output.trim().parse().unwrap_or(0);

    // Count user (third-party) apps
    let user_output = run_adb_shell("pm list packages -3 2>/dev/null | wc -l").await?;
    let user_apps: u32 = user_output.trim().parse().unwrap_or(0);

    Ok(AppCounts {
        system_apps,
        user_apps,
        total_apps: system_apps + user_apps,
    })
}

// ===== Main Collection Function =====

async fn collect_system_health(app_handle: &AppHandle) -> Result<SystemHealth, String> {
    let mut health = SystemHealth::default();
    let mut updated_metrics: Vec<String> = Vec::new();

    // Get current timestamp
    health.timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    // Get device ID first (outside cache lock)
    let device_id = if let Ok(output) = run_adb_command(&["get-serialno"]).await {
        output.trim().to_string()
    } else {
        String::new()
    };
    health.device_id = device_id.clone();

    // Check and invalidate cache for device change
    {
        let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.invalidate_for_device(&device_id);
    }

    // Storage - check if stale, then fetch
    let storage_stale = {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.storage.is_stale()
    };
    if storage_stale {
        if let Ok(storage) = fetch_storage_info().await {
            let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
            cache.storage.update(storage);
            updated_metrics.push("storage".to_string());
        }
    }
    {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        health.storage = cache.storage.get();
    }

    // Emit partial update
    let _ = app_handle.emit("system_health_update", HealthUpdateEvent {
        health: health.clone(),
        metrics_updated: updated_metrics.clone(),
        is_complete: false,
    });

    // Memory
    let memory_stale = {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.memory.is_stale()
    };
    if memory_stale {
        if let Ok(memory) = fetch_memory_info().await {
            let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
            cache.memory.update(memory);
            updated_metrics.push("memory".to_string());
        }
    }
    {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        health.memory = cache.memory.get();
    }

    // Emit partial update
    let _ = app_handle.emit("system_health_update", HealthUpdateEvent {
        health: health.clone(),
        metrics_updated: updated_metrics.clone(),
        is_complete: false,
    });

    // CPU
    let cpu_stale = {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.cpu.is_stale()
    };
    if cpu_stale {
        if let Ok(cpu) = fetch_cpu_info().await {
            let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
            cache.cpu.update(cpu);
            updated_metrics.push("cpu".to_string());
        }
    }
    {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        health.cpu = cache.cpu.get();
    }

    // Services
    let services_stale = {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.services.is_stale()
    };
    if services_stale {
        if let Ok(count) = fetch_services_count().await {
            let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
            cache.services.update(count);
            updated_metrics.push("services".to_string());
        }
    }
    {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        health.services_count = cache.services.get();
    }

    // Emit partial update
    let _ = app_handle.emit("system_health_update", HealthUpdateEvent {
        health: health.clone(),
        metrics_updated: updated_metrics.clone(),
        is_complete: false,
    });

    // App counts
    let app_counts_stale = {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.app_counts.is_stale()
    };
    if app_counts_stale {
        if let Ok(counts) = fetch_app_counts().await {
            let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
            cache.app_counts.update(counts);
            updated_metrics.push("app_counts".to_string());
        }
    }
    {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        health.app_counts = cache.app_counts.get();
    }

    // Thermal
    let thermal_stale = {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.thermal.is_stale()
    };
    if thermal_stale {
        if let Ok(thermal) = fetch_thermal_info().await {
            let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
            cache.thermal.update(thermal);
            updated_metrics.push("thermal".to_string());
        }
    }
    {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        health.thermal = cache.thermal.get();
    }

    // Battery drainers (heaviest)
    let battery_stale = {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        cache.battery.is_stale()
    };
    if battery_stale {
        if let Ok(drainers) = fetch_battery_drainers().await {
            let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
            cache.battery.update(drainers);
            updated_metrics.push("battery".to_string());
        }
    }
    {
        let cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
        health.battery_drainers = cache.battery.get();
    }

    // Emit final complete update
    let _ = app_handle.emit("system_health_update", HealthUpdateEvent {
        health: health.clone(),
        metrics_updated: updated_metrics,
        is_complete: true,
    });

    Ok(health)
}

// ===== Tauri Commands =====

/// Get system health data on demand
#[tauri::command]
pub async fn get_system_health(app_handle: AppHandle) -> Result<SystemHealth, String> {
    collect_system_health(&app_handle).await
}

/// Start background health monitoring (emits events)
#[tauri::command]
pub async fn start_health_monitor(app_handle: AppHandle, interval_ms: u64) -> Result<(), String> {
    let interval = Duration::from_millis(interval_ms.max(1000)); // Minimum 1 second
    
    tauri::async_runtime::spawn(async move {
        loop {
            // Check if device is connected
            if let Ok(output) = run_adb_command(&["get-state"]).await {
                if output.trim() == "device" {
                    let _ = collect_system_health(&app_handle).await;
                }
            }
            
            tokio::time::sleep(interval).await;
        }
    });

    Ok(())
}

/// Clear the health cache (force fresh fetch)
#[tauri::command]
pub fn clear_health_cache() -> Result<(), String> {
    let mut cache = HEALTH_CACHE.lock().map_err(|e| e.to_string())?;
    *cache = HealthCache::new();
    Ok(())
}
