// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Declare all modules
mod adb;
mod commands;
mod package_database;
mod backup;

// Import the commands we need
use commands::{get_device_info, list_packages, uninstall_package};
use backup::{create_backup, list_backups, restore_backup, delete_backup, get_backup_path};

fn main() {
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
            get_backup_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
