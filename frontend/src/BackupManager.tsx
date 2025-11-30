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
    <div className="h-full flex flex-col glass-card text-gray-900 dark:text-text-primary">
      {/* Minimal Header */}
      <div className="flex-shrink-0 p-5 border-b border-gray-200 dark:border-dark-border/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary flex items-center gap-2.5">
              <FiFolder className="w-5 h-5 text-accent" />
              Backups
            </h2>
            <p className="text-xs text-gray-600 dark:text-text-tertiary mt-1">
              {backups.length} vault{backups.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={loadBackups}
            className="btn-ghost px-3 py-2 text-sm font-medium"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Backup Path - Minimal */}
        {backupPath && (
          <div 
            style={{
              background: 'rgba(88,166,175,0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 12px',
            }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-1">
              <FiFolder className="w-3 h-3" />
              Directory
            </div>
            <div className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all opacity-75">
              {backupPath}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Create Section - Minimal */}
        <div 
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-text-primary">
            <FiDownload className="w-4 h-4 text-accent" />
            New Backup
          </h3>
          <p className="text-xs text-gray-600 dark:text-text-secondary mb-3">
            Selected: <span className="font-semibold text-accent">{selectedPackages.length}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCreateBackup}
              disabled={loading || selectedPackages.length === 0}
              className="btn-magnetic flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              style={{
                background: 'rgba(16,185,129,0.12)',
              }}
            >
              <FiDownload className="w-3.5 h-3.5" />
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setSelectedPackages([])}
              disabled={selectedPackages.length === 0}
              className="btn-ghost px-3 py-2 text-sm disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Vault List */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-text-primary">
            <FiPackage className="w-4 h-4 text-accent" />
            Vault
          </h3>

          {backups.length === 0 ? (
            <div 
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
              }}
            >
              <FiAlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-2 opacity-50" />
              <p className="text-gray-500 dark:text-text-tertiary text-xs">
                No backups found
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {backups.map((backup) => (
                <div
                  key={backup.filename}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    transition: 'all 250ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(88,166,175,0.08), 0 4px 10px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 dark:text-text-primary mb-2 break-all flex items-center gap-2">
                        <FiPackage className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        {backup.filename}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-text-secondary">
                          <FiCalendar className="w-3 h-3 opacity-60" />
                          <span>{formatDate(backup.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-text-secondary">
                          <FiPackage className="w-3 h-3 opacity-60" />
                          <span>{backup.count} pkg</span>
                        </div>
                        {backup.device_name && (
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-text-secondary">
                            <FiSmartphone className="w-3 h-3 opacity-60" />
                            <span>{backup.device_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border/30">
                      <button
                        onClick={() => handleRestore(backup.filename)}
                        disabled={restoring}
                        className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-250 disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          border: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(16,185,129,0.18)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(16,185,129,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <FiRotateCcw className="w-3 h-3" />
                        {restoring ? 'Restoring...' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handleDelete(backup.filename)}
                        className="px-3 py-2 text-xs font-medium rounded-lg transition-all duration-250 flex items-center justify-center gap-1.5"
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          border: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(239,68,68,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Note - Minimal */}
        <div 
          style={{
            background: 'rgba(88,166,175,0.06)',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <div className="flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> Backups store package names only. Data is not included.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
