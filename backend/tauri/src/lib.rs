// This file can be used for library exports if needed
// All commands are now in the commands module and registered in main.rs

pub mod adb;  // ADB communication module
pub mod commands;
pub mod package_database;  // Make package_database available as a module
pub mod backup;  // Backup and restore functionality
pub mod ai_advisor;  // AI-powered package safety analysis
pub mod chatbot;  // AI chatbot integration
pub mod package_stream;  // Async package streaming for performance
pub mod system_health;  // System health monitoring
