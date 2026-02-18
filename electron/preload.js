const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Device operations
  getDeviceInfo: () => ipcRenderer.invoke('get-device-info'),
  
  // Package operations
  listPackages: (type) => ipcRenderer.invoke('list-packages', type),
  uninstallPackage: (packageName) => ipcRenderer.invoke('uninstall-package', packageName),
  reinstallPackage: (packageName) => ipcRenderer.invoke('reinstall-package', packageName),
  
  // AI operations
  analyzePackage: (packageName, provider) => ipcRenderer.invoke('analyze-package', packageName, provider),
  chatMessage: (message, history) => ipcRenderer.invoke('chat-message', message, history),
  
  // Backup operations
  createBackup: (packages, deviceInfo) => ipcRenderer.invoke('create-backup', packages, deviceInfo),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  restoreBackup: (backupName) => ipcRenderer.invoke('restore-backup', backupName),
  deleteBackup: (backupName) => ipcRenderer.invoke('delete-backup', backupName),
  getBackupPath: () => ipcRenderer.invoke('get-backup-path'),
});
