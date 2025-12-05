import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion, AnimatePresence } from 'framer-motion';
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
import { staggerContainer, staggerItem } from '../utils/animations';

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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [restoring, setRestoring] = useState<boolean>(false);

  // Load backups on mount
  useEffect(() => {
    loadBackups();
    loadBackupPath();
  }, []);

  const loadBackups = async () => {
    setRefreshing(true);
    try {
      const result = await invoke<BackupInfo[]>('list_backups');
      setBackups(result);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setRefreshing(false);
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
    <motion.div 
      className="h-full flex flex-col glass-card text-gray-900 dark:text-text-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Minimal Header */}
      <div className="flex-shrink-0 p-5 border-b border-gray-200 dark:border-dark-border/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiFolder className="w-5 h-5 text-accent" />
              </motion.div>
              Backups
            </h2>
            <motion.p 
              className="text-xs text-gray-600 dark:text-text-tertiary mt-1"
              key={backups.length}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {backups.length} vault{backups.length !== 1 ? 's' : ''}
            </motion.p>
          </div>
          <motion.button
            onClick={loadBackups}
            disabled={refreshing}
            className="btn-ghost px-3 py-2 text-sm font-medium group overflow-hidden relative"
            style={{
              borderRadius: '10px',
            }}
            whileHover={{ 
              scale: 1.08,
              boxShadow: '0 4px 15px rgba(46, 196, 182, 0.2)'
            }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {/* Glow background on hover */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'radial-gradient(circle, rgba(46, 196, 182, 0.15) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.2 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="relative z-10"
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing 
                ? { duration: 1, repeat: Infinity, ease: 'linear' }
                : { duration: 0.3 }
              }
              whileHover={!refreshing ? { rotate: 180, scale: 1.15 } : {}}
            >
              <FiRefreshCw className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Backup Path - Minimal */}
        <AnimatePresence>
          {backupPath && (
            <motion.div 
              style={{
                background: 'rgba(88,166,175,0.08)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-1">
                <FiFolder className="w-3 h-3" />
                Directory
              </div>
              <div className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all opacity-75">
                {backupPath}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Create Section - Minimal */}
        <motion.div 
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-text-primary">
            <motion.div whileHover={{ scale: 1.2, y: -2 }}>
              <FiDownload className="w-4 h-4 text-accent" />
            </motion.div>
            New Backup
          </h3>
          <p className="text-xs text-gray-600 dark:text-text-secondary mb-3">
            Selected: <motion.span 
              className="font-semibold text-accent"
              key={selectedPackages.length}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {selectedPackages.length}
            </motion.span>
          </p>
          <div className="flex gap-2">
            <motion.button
              onClick={handleCreateBackup}
              disabled={loading || selectedPackages.length === 0}
              className="btn-magnetic flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              style={{
                background: 'rgba(16,185,129,0.12)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                <FiDownload className="w-3.5 h-3.5" />
              </motion.div>
              {loading ? 'Creating...' : 'Create'}
            </motion.button>
            <motion.button
              onClick={() => setSelectedPackages([])}
              disabled={selectedPackages.length === 0}
              className="btn-ghost px-3 py-2 text-sm disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear
            </motion.button>
          </div>
        </motion.div>

        {/* Vault List */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-text-primary">
            <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
              <FiPackage className="w-4 h-4 text-accent" />
            </motion.div>
            Vault
          </h3>

          <AnimatePresence mode="wait">
            {backups.length === 0 ? (
              <motion.div 
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FiAlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-2 opacity-50" />
                </motion.div>
                <p className="text-gray-500 dark:text-text-tertiary text-xs">
                  No backups found
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-2.5"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {backups.map((backup) => (
                  <motion.div
                    key={backup.filename}
                    variants={staggerItem}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                    whileHover={{ 
                      y: -2, 
                      background: 'rgba(255,255,255,0.04)',
                      boxShadow: '0 0 12px rgba(88,166,175,0.08), 0 4px 10px rgba(0,0,0,0.04)'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 dark:text-text-primary mb-2 break-all flex items-center gap-2">
                          <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                            <FiPackage className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          </motion.div>
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
                        <motion.button
                          onClick={() => handleRestore(backup.filename)}
                          disabled={restoring}
                          className="flex-1 px-3 py-2 text-xs font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
                          style={{
                            background: 'rgba(16,185,129,0.12)',
                            border: 'none',
                          }}
                          whileHover={{ 
                            y: -2, 
                            background: 'rgba(16,185,129,0.18)',
                            boxShadow: '0 0 8px rgba(16,185,129,0.12)'
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            animate={restoring ? { rotate: -360 } : {}}
                            transition={restoring ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                          >
                            <FiRotateCcw className="w-3 h-3" />
                          </motion.div>
                          {restoring ? 'Restoring...' : 'Restore'}
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(backup.filename)}
                          className="px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5"
                          style={{
                            background: 'rgba(239,68,68,0.12)',
                            border: 'none',
                          }}
                          whileHover={{ 
                            y: -2, 
                            background: 'rgba(239,68,68,0.18)',
                            boxShadow: '0 0 8px rgba(239,68,68,0.12)'
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiTrash2 className="w-3 h-3" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Note - Minimal */}
        <motion.div 
          style={{
            background: 'rgba(88,166,175,0.06)',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-2.5">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <FiAlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            </motion.div>
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> Backups store package names only. Data is not included.
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BackupManager;
