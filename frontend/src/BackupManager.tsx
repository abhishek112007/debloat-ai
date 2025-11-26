import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  FiRefreshCw,
  FiDownload,
  FiTrash2,
  FiFolder,
  FiPackage,
  FiCalendar,
  FiSmartphone,
  FiRotateCcw,
  FiAlertCircle,
} from 'react-icons/fi';

interface BackupInfo {
  filename: string;
  date: string;
  count: number;
  device_name?: string;
}

interface CreateBackupResult {
  success: boolean;
  backup_file?: string;
  error?: string;
}

interface RestoreBackupResult {
  success: boolean;
  restored: number;
  failed: number;
  errors: string[];
}

const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [backupPath, setBackupPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [restoring, setRestoring] = useState<boolean>(false);

  // Load backups on mount
  useEffect(() => {
    loadBackups();
    loadBackupPath();
  }, []);

  const loadBackups = async () => {
    try {
      const result = await invoke<BackupInfo[]>('list_backups');
      setBackups(result);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const loadBackupPath = async () => {
    try {
      const path = await invoke<string>('get_backup_path');
      setBackupPath(path);
    } catch (error) {
      console.error('Failed to get backup path:', error);
    }
  };

  const handleCreateBackup = async () => {
    if (selectedPackages.length === 0) {
      alert('Please select packages to backup');
      return;
    }

    setLoading(true);
    try {
      const result = await invoke<CreateBackupResult>('create_backup', {
        packages: selectedPackages,
      });

      if (result.success) {
        alert(`✅ Backup created: ${result.backup_file}`);
        loadBackups();
        setSelectedPackages([]);
      } else {
        alert(`❌ Failed to create backup: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    if (!confirm(`Restore backup "${filename}"? This will reinstall all packages in the backup.`)) {
      return;
    }

    setRestoring(true);
    try {
      const result = await invoke<RestoreBackupResult>('restore_backup', {
        filename,
      });

      if (result.success) {
        alert(
          `✅ Restore complete!\n\nRestored: ${result.restored}\nFailed: ${result.failed}`
        );
      } else {
        const errorMsg = result.errors.join('\n');
        alert(
          `⚠️ Restore completed with errors\n\nRestored: ${result.restored}\nFailed: ${result.failed}\n\nErrors:\n${errorMsg}`
        );
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete backup "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await invoke<boolean>('delete_backup', { filename });
      alert('✅ Backup deleted');
      loadBackups();
    } catch (error) {
      alert(`❌ Failed to delete backup: ${error}`);
    }
  };

  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleString();
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-card text-gray-900 dark:text-text-primary">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b-2 border-gray-200 dark:border-dark-border bg-gradient-to-r from-primary-50 to-white dark:from-dark-bg dark:to-dark-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary flex items-center gap-2">
              <FiFolder className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              Backup Manager
            </h2>
            <p className="text-sm text-gray-600 dark:text-text-tertiary mt-1">
              Create and restore package backups
            </p>
          </div>
          <button
            onClick={loadBackups}
            className="px-4 py-2 text-sm font-medium border-2 border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-hover rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Backup Directory Path */}
        {backupPath && (
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1">
              <FiFolder className="w-3.5 h-3.5" />
              Backup Directory
            </div>
            <div className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              {backupPath}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Create Backup Section */}
        <div className="card p-5 border-2">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-text-primary">
            <FiDownload className="w-5 h-5 text-success-600 dark:text-success-400" />
            Create New Backup
          </h3>
          <p className="text-sm text-gray-600 dark:text-text-secondary mb-4">
            Selected packages: <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedPackages.length}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateBackup}
              disabled={loading || selectedPackages.length === 0}
              className="btn-success flex items-center justify-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Backup'}
            </button>
            <button
              onClick={() => setSelectedPackages([])}
              disabled={selectedPackages.length === 0}
              className="btn-secondary"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Backup List */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-text-primary">
            <FiPackage className="w-5 h-5 text-info-600 dark:text-info-400" />
            Available Backups
            <span className="ml-auto text-sm font-normal px-3 py-1 bg-gray-100 dark:bg-dark-bg rounded-full text-gray-600 dark:text-text-tertiary">
              {backups.length}
            </span>
          </h3>

          {backups.length === 0 ? (
            <div className="card p-8 text-center border-2 border-dashed">
              <FiAlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-text-tertiary text-sm">
                No backups found. Create your first backup to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.filename}
                  className="card card-hover p-4 border-2 hover:border-primary-300 dark:hover:border-primary-700"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-base text-gray-900 dark:text-text-primary mb-3 break-all flex items-center gap-2">
                        <FiPackage className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        {backup.filename}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-text-secondary">
                          <FiCalendar className="w-4 h-4 text-info-600 dark:text-info-400" />
                          <span className="text-xs">{formatDate(backup.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-text-secondary">
                          <FiPackage className="w-4 h-4 text-success-600 dark:text-success-400" />
                          <span className="text-xs">{backup.count} packages</span>
                        </div>
                        {backup.device_name && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-text-secondary">
                            <FiSmartphone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-xs">{backup.device_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-dark-border">
                      <button
                        onClick={() => handleRestore(backup.filename)}
                        disabled={restoring}
                        className="flex-1 sm:flex-none px-4 py-2 bg-success-600 hover:bg-success-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FiRotateCcw className="w-4 h-4" />
                        {restoring ? 'Restoring...' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handleDelete(backup.filename)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 bg-info-50 dark:bg-info-900/20 border-2 border-info-200 dark:border-info-800 rounded-xl">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-info-600 dark:text-info-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-info-800 dark:text-info-200">
              <strong>Note:</strong> Backups store package names only. Restoring will attempt to
              reinstall packages using ADB. Data is not included - only the ability to reinstall apps.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
