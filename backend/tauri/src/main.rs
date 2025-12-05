// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Declare all modules
mod adb;
mod commands;
mod package_database;
mod backup;
mod ai_advisor;
mod chatbot;
mod package_stream;

// Import the commands we need
use commands::{get_device_info, list_packages, uninstall_package, analyze_package, chat_message};
use backup::{create_backup, list_backups, restore_backup, delete_backup, get_backup_path};
use package_stream::{start_package_stream, get_cached_packages, clear_package_cache, get_cache_status};

fn main() {
    // Load .env file if it exists
    // Check multiple possible locations for .env file
    let env_loaded = dotenv::dotenv().is_ok();
    
    // Also try loading from current exe directory
    if !env_loaded {
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                let env_path = exe_dir.join(".env");
                if env_path.exists() {
                    dotenv::from_path(&env_path).ok();
                }
            }
        }
    }
    
    // Log warning if API key not set (but don't crash)
    if std::env::var("PERPLEXITY_API_KEY").is_err() {
        eprintln!("⚠️ PERPLEXITY_API_KEY not set. AI features will not work.");
        eprintln!("   Create a .env file with your API key to enable AI analysis.");
    }
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            list_packages,
            uninstall_package,
            create_backup,
            list_backups,
            restore_backup,
            delete_backup,
            get_backup_path,
            analyze_package,
            chat_message,
            // New streaming commands for performance
            start_package_stream,
            get_cached_packages,
            clear_package_cache,
            get_cache_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
