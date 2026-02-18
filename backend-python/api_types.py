"""
API Type Definitions for Electron IPC Communication
Replaces Tauri invoke() calls with Electron IPC
"""
from typing import TypedDict, List, Dict, Optional, Any

# TypeScript types for reference (not used in Python)

class DeviceInfo(TypedDict):
    serial: str
    model: str
    product: str
    manufacturer: str
    androidVersion: str
    state: str

class Package(TypedDict):
    name: str
    type: str

class BackupInfo(TypedDict):
    name: str
    path: str
    timestamp: str
    packageCount: int
    deviceInfo: dict

# This file is just for reference
# The actual API is in frontend/src/utils/api.ts for TypeScript
# And electron/preload.js for the bridge
