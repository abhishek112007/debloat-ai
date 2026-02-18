/**
 * API Wrapper for Electron
 * Replaces Tauri invoke() calls
 */

export const api = {
  // ===== Device Operations =====
  
  async getDeviceInfo() {
    return window.electronAPI.getDeviceInfo();
  },
  
  // ===== Package Operations =====
  
  async listPackages(type?: 'all' | 'system' | 'user') {
    return window.electronAPI.listPackages(type || 'all');
  },
  
  async uninstallPackage(packageName: string) {
    return window.electronAPI.uninstallPackage(packageName);
  },
  
  async reinstallPackage(packageName: string) {
    return window.electronAPI.reinstallPackage(packageName);
  },
  
  // ===== AI Operations =====
  
  async analyzePackage(packageName: string, provider: 'perplexity' | 'openai' = 'perplexity') {
    return window.electronAPI.analyzePackage(packageName, provider);
  },
  
  async chatMessage(message: string, history: ChatMessage[]) {
    return window.electronAPI.chatMessage(message, history);
  },
  
  // ===== Backup Operations =====
  
  async createBackup(packages: string[], deviceInfo?: any) {
    return window.electronAPI.createBackup(packages, deviceInfo);
  },
  
  async listBackups() {
    return window.electronAPI.listBackups();
  },
  
  async restoreBackup(backupName: string) {
    return window.electronAPI.restoreBackup(backupName);
  },
  
  async deleteBackup(backupName: string) {
    return window.electronAPI.deleteBackup(backupName);
  },
  
  async getBackupPath() {
    return window.electronAPI.getBackupPath();
  },
};

// ===== TypeScript Declarations =====

declare global {
  interface Window {
    electronAPI: {
      // Device
      getDeviceInfo: () => Promise<DeviceInfo>;
      
      // Packages
      listPackages: (type?: string) => Promise<Package[]>;
      uninstallPackage: (packageName: string) => Promise<UninstallResult>;
      reinstallPackage: (packageName: string) => Promise<UninstallResult>;
      
      // AI
      analyzePackage: (packageName: string, provider?: string) => Promise<PackageAnalysis>;
      chatMessage: (message: string, history?: ChatMessage[]) => Promise<ChatResponse>;
      
      // Backups
      createBackup: (packages: string[], deviceInfo?: any) => Promise<BackupResult>;
      listBackups: () => Promise<BackupInfo[]>;
      restoreBackup: (backupName: string) => Promise<RestoreResult>;
      deleteBackup: (backupName: string) => Promise<DeleteResult>;
      getBackupPath: () => Promise<{ path: string }>;
    };
  }
}

// ===== Type Definitions =====

export interface DeviceInfo {
  name: string;
  serial: string;
  model?: string;
  product?: string;
  manufacturer?: string;
  androidVersion?: string;
  state: string;
}

export interface Package {
  name: string;
  type: 'system' | 'user';
}

export interface UninstallResult {
  success: boolean;
  message: string;
}

export interface PackageAnalysis {
  packageName: string;
  summary: string;
  purpose: string;
  dependencies: string[];
  safeToRemove: boolean;
  riskCategory: 'Safe' | 'Caution' | 'Expert' | 'Dangerous';
  consequences: string[];
  userReports: string[];
  technicalDetails: string;
  bestCase: string;
  worstCase: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface BackupResult {
  success: boolean;
  backupName?: string;
  backupPath?: string;
  message: string;
}

export interface BackupInfo {
  name: string;
  path: string;
  timestamp: string;
  packageCount: number;
  deviceInfo: any;
}

export interface RestoreResult {
  success: boolean;
  packages?: string[];
  count?: number;
  message: string;
}

export interface DeleteResult {
  success: boolean;
  message: string;
}

export default api;
