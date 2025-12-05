/**
 * System Health Types
 * 
 * TypeScript interfaces matching the Rust backend structs.
 */

export interface StorageInfo {
  total_mb: number;
  used_mb: number;
  free_mb: number;
  usage_percent: number;
}

export interface MemoryInfo {
  total_mb: number;
  available_mb: number;
  used_mb: number;
  usage_percent: number;
  buffers_mb: number;
  cached_mb: number;
}

export interface CpuInfo {
  usage_percent: number;
  user_percent: number;
  system_percent: number;
  idle_percent: number;
}

export interface BatteryDrainer {
  app_name: string;
  package_name: string;
  usage_percent: number;
  foreground_time_ms: number;
}

export interface ThermalInfo {
  status: 'normal' | 'moderate' | 'severe' | 'critical' | 'unknown';
  temperature_c: number | null;
  throttling: boolean;
}

export interface AppCounts {
  system_apps: number;
  user_apps: number;
  total_apps: number;
}

export interface SystemHealth {
  storage: StorageInfo;
  memory: MemoryInfo;
  cpu: CpuInfo;
  services_count: number;
  battery_drainers: BatteryDrainer[];
  thermal: ThermalInfo;
  app_counts: AppCounts;
  timestamp: number;
  device_id: string;
}

export interface HealthUpdateEvent {
  health: SystemHealth;
  metrics_updated: string[];
  is_complete: boolean;
}

// Health status levels for color coding
export type HealthLevel = 'healthy' | 'warning' | 'critical';

export function getStorageHealthLevel(usage: number): HealthLevel {
  if (usage < 70) return 'healthy';
  if (usage < 90) return 'warning';
  return 'critical';
}

export function getMemoryHealthLevel(usage: number): HealthLevel {
  if (usage < 75) return 'healthy';
  if (usage < 90) return 'warning';
  return 'critical';
}

export function getCpuHealthLevel(usage: number): HealthLevel {
  if (usage < 60) return 'healthy';
  if (usage < 85) return 'warning';
  return 'critical';
}

export function getThermalHealthLevel(status: ThermalInfo['status']): HealthLevel {
  switch (status) {
    case 'normal':
      return 'healthy';
    case 'moderate':
      return 'warning';
    case 'severe':
    case 'critical':
      return 'critical';
    default:
      return 'healthy';
  }
}
