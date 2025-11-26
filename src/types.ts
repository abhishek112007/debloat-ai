// Shared TypeScript types for Tauri Android app components

export type DeviceInfo = {
  name: string;
  model?: string | null;
  androidVersion: string;
  batteryPercentage?: number | null;
  storageAvailable?: string | null; // e.g. "12.3 GB"
};

export type SafetyLevel = 'Safe' | 'Caution' | 'Expert' | 'Dangerous';

export type Package = {
  packageName: string;
  appName: string;
  safetyLevel: SafetyLevel;
};
