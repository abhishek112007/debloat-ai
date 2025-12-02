import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion, AnimatePresence } from 'framer-motion';
import DevicePanel from './components/DevicePanel';
import PackageList from './components/PackageList';
import BackupManager from './components/BackupManager';
import UninstallDialog from './components/UninstallDialog';
import ThemeSelector from './components/ThemeSelector';
import FloatingChat from './components/FloatingChat';
import { useTheme } from './hooks/useDarkMode';
import {
  FiDownload,
  FiTrash2,
  FiX,
  FiArchive,
  FiList,
  FiCheckCircle,
  FiAlertTriangle,
  FiZap,
  FiXOctagon,
} from 'react-icons/fi';
import { 
  buttonHover, 
  glowButton, 
  filterChipTap
} from './utils/animations';

// Notification System
interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let notificationId = 0;

// Package Stats
interface PackageStats {
  total: number;
  safe: number;
  caution: number;
  expert: number;
  dangerous: number;
  selected: number;
}

// Main App Component
const App: React.FC = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [deviceName, setDeviceName] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<PackageStats>({
    total: 0,
    safe: 0,
    caution: 0,
    expert: 0,
    dangerous: 0,
    selected: 0,
  });
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [filterBySafety, setFilterBySafety] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<Array<{packageName: string; safetyLevel: string}>>([]);
  
  const isLightMode = theme === 'light';

  // Fetch device info to get device name for chatbot
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const result = await invoke<{ success: boolean; device?: { name: string; model?: string } }>('get_device_info');
        if (result.success && result.device) {
          setDeviceName(result.device.name || result.device.model);
        }
      } catch (error) {
        // Device not connected, chatbot will work without device context
      }
    };

    fetchDeviceInfo();
    // Poll for device changes every 5 seconds
    const interval = setInterval(fetchDeviceInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add notification
  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = notificationId++;
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  // Update stats when packages change
  useEffect(() => {
    setStats((prev) => ({ ...prev, selected: selectedPackages.size }));
  }, [selectedPackages]);

  // Handle uninstall selected
  const handleUninstallSelected = () => {
    if (selectedPackages.size === 0) {
      addNotification('No packages selected', 'error');
      return;
    }
    setConfirmDialogOpen(true);
  };

  // Handle backup selected packages
  const handleBackupSelected = async () => {
    if (selectedPackages.size === 0) {
      addNotification('No packages selected for backup', 'error');
      return;
    }

    try {
      const packagesArray = Array.from(selectedPackages);
      const result = await invoke<{ success: boolean; backup_file?: string; error?: string }>(
        'create_backup',
        { packages: packagesArray }
      );

      if (result.success) {
        addNotification(`✅ Backup created: ${result.backup_file}`, 'success');
        setSelectedPackages(new Set()); // Clear selection
      } else {
        addNotification(`❌ Backup failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addNotification(`❌ Backup error: ${error}`, 'error');
    }
  };

  // Confirm uninstall action
  const confirmUninstall = async () => {
    setConfirmDialogOpen(false);
    
    let successCount = 0;
    let failCount = 0;

    for (const packageName of selectedPackages) {
      try {
        const result = await invoke<{ success: boolean; error?: string }>('uninstall_package', {
          packageName,
        });

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    if (successCount > 0) {
      addNotification(`✅ Successfully uninstalled ${successCount} package(s)`, 'success');
    }
    if (failCount > 0) {
      addNotification(`❌ Failed to uninstall ${failCount} package(s)`, 'error');
    }

    setSelectedPackages(new Set());
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col" style={{backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-primary)'}}>
      {/* Ultra-Thin Glass Navbar */}
      <nav className="flex-shrink-0 px-6 py-3 relative z-50" style={{
        background: isLightMode 
          ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.45) 100%)'
          : 'linear-gradient(180deg, rgba(17, 17, 17, 0.4) 0%, rgba(13, 13, 13, 0.2) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.04)',
        boxShadow: isLightMode 
          ? '0 1px 0 rgba(255, 255, 255, 0.5) inset, 0 2px 8px rgba(0, 0, 0, 0.06)'
          : '0 1px 0 rgba(255, 255, 255, 0.02) inset, 0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Logo & Title - Minimal */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight" style={{
              color: 'var(--theme-text-primary)',
              letterSpacing: '-0.02em'
            }}>
              Debloat AI
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              background: isLightMode ? 'rgba(46, 196, 182, 0.12)' : 'rgba(88, 166, 175, 0.12)',
              color: 'var(--theme-accent)',
              fontWeight: 500
            }}>
              ADB Tool
            </span>
          </div>

          {/* Right Controls - Minimal Icons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowBackupManager(!showBackupManager)}
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
              style={{
                background: isLightMode 
                  ? 'rgba(0, 0, 0, 0.03)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: 'var(--theme-text-secondary)',
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
              }}
              variants={buttonHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              animate={{
                ...glowButton.rest,
                background: isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)'
              }}
              onHoverStart={() => {}}
            >
              <motion.div
                animate={showBackupManager ? { rotate: 0 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                {showBackupManager ? (
                  <FiList className="w-4 h-4" />
                ) : (
                  <FiArchive className="w-4 h-4" />
                )}
              </motion.div>
              <span className="hidden sm:inline">
                {showBackupManager ? 'Packages' : 'Backups'}
              </span>
            </motion.button>
            
            <ThemeSelector />
          </div>
        </div>
      </nav>

      {/* Main Layout - Floating Panels */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden px-4 py-4 gap-4 max-w-[1800px] mx-auto w-full">
        {/* Left Sidebar - Device Panel - Floating Glass */}
        <aside className="w-full lg:w-[300px] overflow-y-auto glass-card-float p-5" style={{
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.55) 100%)'
            : 'linear-gradient(135deg, rgba(17, 17, 17, 0.6) 0%, rgba(13, 13, 13, 0.6) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: isLightMode
            ? '0 4px 10px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
          borderRadius: '12px'
        }}>
          <DevicePanel />
        </aside>

        {/* Main Content - Floating Panel */}
        <main className="flex-1 overflow-y-auto glass-card p-6" style={{
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.55) 100%)'
            : 'linear-gradient(135deg, rgba(17, 17, 17, 0.6) 0%, rgba(13, 13, 13, 0.6) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: isLightMode
            ? '0 4px 10px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
          borderRadius: '12px'
        }}>
          {/* Minimal Filter Chips */}
          {!showBackupManager && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <motion.button
                onClick={() => setFilterBySafety(null)}
                className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 ${
                  filterBySafety === null ? 'active-filter' : ''
                }`}
                style={{
                  background: filterBySafety === null ? 'var(--theme-accent)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'),
                  color: filterBySafety === null ? 'white' : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  boxShadow: filterBySafety === null 
                    ? (isLightMode ? '0 2px 8px rgba(46, 196, 182, 0.2)' : '0 2px 8px rgba(88, 166, 175, 0.2)')
                    : 'none'
                }}
                variants={filterChipTap}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  scale: 1.04,
                  y: -1,
                  boxShadow: filterBySafety === null 
                    ? (isLightMode ? '0 4px 12px rgba(46, 196, 182, 0.25)' : '0 4px 12px rgba(88, 166, 175, 0.25)')
                    : (isLightMode ? '0 2px 8px rgba(46, 196, 182, 0.15)' : '0 2px 8px rgba(88, 166, 175, 0.15)'),
                  transition: { duration: 0.15 }
                }}
              >
                <FiList className="w-3.5 h-3.5" /> All
              </motion.button>
              <motion.button
                onClick={() => setFilterBySafety('Safe')}
                className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
                style={{
                  background: filterBySafety === 'Safe' ? 'rgba(16, 185, 129, 0.15)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'),
                  color: filterBySafety === 'Safe' ? '#10B981' : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  boxShadow: filterBySafety === 'Safe' ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                }}
                variants={filterChipTap}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  scale: 1.04,
                  y: -1,
                  boxShadow: filterBySafety === 'Safe' 
                    ? '0 4px 12px rgba(16, 185, 129, 0.25)' 
                    : '0 2px 8px rgba(16, 185, 129, 0.15)',
                  transition: { duration: 0.15 }
                }}
              >
                <FiCheckCircle className="w-3.5 h-3.5" /> Safe
              </motion.button>
              <motion.button
                onClick={() => setFilterBySafety('Caution')}
                className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
                style={{
                  background: filterBySafety === 'Caution' ? 'rgba(251, 191, 36, 0.15)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'),
                  color: filterBySafety === 'Caution' ? '#F59E0B' : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  boxShadow: filterBySafety === 'Caution' ? '0 2px 8px rgba(251, 191, 36, 0.15)' : 'none'
                }}
                variants={filterChipTap}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  scale: 1.04,
                  y: -1,
                  boxShadow: filterBySafety === 'Caution' 
                    ? '0 4px 12px rgba(251, 191, 36, 0.25)' 
                    : '0 2px 8px rgba(251, 191, 36, 0.15)',
                  transition: { duration: 0.15 }
                }}
              >
                <FiAlertTriangle className="w-3.5 h-3.5" /> Caution
              </motion.button>
              <motion.button
                onClick={() => setFilterBySafety('Expert')}
                className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
                style={{
                  background: filterBySafety === 'Expert' ? 'rgba(249, 115, 22, 0.15)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'),
                  color: filterBySafety === 'Expert' ? '#F97316' : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  boxShadow: filterBySafety === 'Expert' ? '0 2px 8px rgba(249, 115, 22, 0.15)' : 'none'
                }}
                variants={filterChipTap}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  scale: 1.04,
                  y: -1,
                  boxShadow: filterBySafety === 'Expert' 
                    ? '0 4px 12px rgba(249, 115, 22, 0.25)' 
                    : '0 2px 8px rgba(249, 115, 22, 0.15)',
                  transition: { duration: 0.15 }
                }}
              >
                <FiZap className="w-3.5 h-3.5" /> Expert
              </motion.button>
              <motion.button
                onClick={() => setFilterBySafety('Dangerous')}
                className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
                style={{
                  background: filterBySafety === 'Dangerous' ? 'rgba(239, 68, 68, 0.15)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'),
                  color: filterBySafety === 'Dangerous' ? '#EF4444' : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  boxShadow: filterBySafety === 'Dangerous' ? '0 2px 8px rgba(239, 68, 68, 0.15)' : 'none'
                }}
                variants={filterChipTap}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  scale: 1.04,
                  y: -1,
                  boxShadow: filterBySafety === 'Dangerous' 
                    ? '0 4px 12px rgba(239, 68, 68, 0.25)' 
                    : '0 2px 8px rgba(239, 68, 68, 0.15)',
                  transition: { duration: 0.15 }
                }}
              >
                <FiTrash2 className="w-3.5 h-3.5" /> Dangerous
              </motion.button>
            </div>
          )}
          
          {showBackupManager ? (
            <BackupManager />
          ) : (
            <PackageList
              selectedPackages={selectedPackages}
              onSelectionChange={setSelectedPackages}
              onStatsChange={setStats}
              filterBySafety={filterBySafety}
              onPackageDataChange={setPackageData}
            />
          )}
        </main>

        {/* Right Sidebar - Stats - Floating Minimal */}
        <aside className="hidden lg:flex lg:flex-col w-[280px] overflow-y-auto glass-card p-5 space-y-3" style={{
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.55) 100%)'
            : 'linear-gradient(135deg, rgba(17, 17, 17, 0.6) 0%, rgba(13, 13, 13, 0.6) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: isLightMode
            ? '0 4px 10px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
          borderRadius: '12px'
        }}>
          {/* Total & Selected - Minimal Cards */}
          <div className="p-4 rounded-xl transition-all duration-200" style={{
            background: isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
            boxShadow: isLightMode ? '0 2px 6px rgba(0, 0, 0, 0.04)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
            border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
          }}>
            <div className="text-2xl font-bold mb-1" style={{color: 'var(--theme-text-primary)'}}>
              {stats.total}
            </div>
            <div className="text-xs font-medium opacity-60" style={{color: 'var(--theme-text-secondary)'}}>
              Total Packages
            </div>
          </div>

          <div className={`p-4 rounded-xl transition-all duration-200 ${stats.selected > 0 ? 'device-connected-pulse' : ''}`} style={{
            background: stats.selected > 0 
              ? (isLightMode ? 'rgba(46, 196, 182, 0.10)' : 'rgba(88, 166, 175, 0.08)')
              : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'),
            boxShadow: stats.selected > 0 
              ? (isLightMode ? '0 0 20px rgba(46, 196, 182, 0.15)' : '0 0 20px rgba(88, 166, 175, 0.12)')
              : (isLightMode ? '0 2px 6px rgba(0, 0, 0, 0.04)' : '0 1px 3px rgba(0, 0, 0, 0.04)'),
            border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
          }}>
            <div className="text-2xl font-bold mb-1" style={{
              color: stats.selected > 0 ? 'var(--theme-accent)' : 'var(--theme-text-primary)'
            }}>
              {stats.selected}
            </div>
            <div className="text-xs font-medium opacity-60" style={{
              color: stats.selected > 0 ? 'var(--theme-accent)' : 'var(--theme-text-secondary)'
            }}>
              Selected
            </div>
          </div>

          {/* Divider */}
          <div className="h-px my-2" style={{background: isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}} />

          {/* Safety Levels - Minimal Buttons */}
          <div className="space-y-2">{/* Safe */}
            <button
              onClick={() => setFilterBySafety(filterBySafety === 'Safe' ? null : 'Safe')}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
              style={{
                background: filterBySafety === 'Safe' ? 'rgba(16, 185, 129, 0.12)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'),
                boxShadow: filterBySafety === 'Safe' ? '0 0 16px rgba(16, 185, 129, 0.15)' : 'none',
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.04)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Safe') {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Safe') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span className="text-sm font-medium flex items-center gap-2" style={{color: '#10B981'}}>
                <FiCheckCircle className="w-4 h-4" />
                Safe
              </span>
              <span className="text-lg font-bold" style={{color: '#10B981'}}>
                {stats.safe}
              </span>
            </button>

            {/* Caution */}
            <button
              onClick={() => setFilterBySafety(filterBySafety === 'Caution' ? null : 'Caution')}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
              style={{
                background: filterBySafety === 'Caution' ? 'rgba(251, 191, 36, 0.12)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'),
                boxShadow: filterBySafety === 'Caution' ? '0 0 16px rgba(251, 191, 36, 0.15)' : 'none',
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.04)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Caution') {
                  e.currentTarget.style.background = 'rgba(251, 191, 36, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Caution') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span className="text-sm font-medium flex items-center gap-2" style={{color: '#F59E0B'}}>
                <FiAlertTriangle className="w-4 h-4" />
                Caution
              </span>
              <span className="text-lg font-bold" style={{color: '#F59E0B'}}>
                {stats.caution}
              </span>
            </button>

            {/* Expert */}
            <button
              onClick={() => setFilterBySafety(filterBySafety === 'Expert' ? null : 'Expert')}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
              style={{
                background: filterBySafety === 'Expert' ? 'rgba(249, 115, 22, 0.12)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'),
                boxShadow: filterBySafety === 'Expert' ? '0 0 16px rgba(249, 115, 22, 0.15)' : 'none',
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.04)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Expert') {
                  e.currentTarget.style.background = 'rgba(249, 115, 22, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Expert') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span className="text-sm font-medium flex items-center gap-2" style={{color: '#F97316'}}>
                <FiZap className="w-4 h-4" />
                Expert
              </span>
              <span className="text-lg font-bold" style={{color: '#F97316'}}>
                {stats.expert}
              </span>
            </button>

            {/* Dangerous */}
            <button
              onClick={() => setFilterBySafety(filterBySafety === 'Dangerous' ? null : 'Dangerous')}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
              style={{
                background: filterBySafety === 'Dangerous' ? 'rgba(239, 68, 68, 0.12)' : (isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'),
                boxShadow: filterBySafety === 'Dangerous' ? '0 0 16px rgba(239, 68, 68, 0.15)' : 'none',
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.04)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Dangerous') {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Dangerous') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span className="text-sm font-medium flex items-center gap-2" style={{color: '#EF4444'}}>
                <FiXOctagon className="w-4 h-4" />
                Dangerous
              </span>
              <span className="text-lg font-bold" style={{color: '#EF4444'}}>
                {stats.dangerous}
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* Floating Action Bar - Appears when packages selected */}
      <AnimatePresence>
        {selectedPackages.size > 0 && (
          <motion.div 
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl" style={{
            background: isLightMode
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.90) 100%)'
              : 'linear-gradient(135deg, rgba(17, 17, 17, 0.9) 0%, rgba(13, 13, 13, 0.9) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: isLightMode
              ? '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 40px rgba(46, 196, 182, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              : '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(88, 166, 175, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            border: isLightMode ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
              background: isLightMode ? 'rgba(46, 196, 182, 0.12)' : 'rgba(88, 166, 175, 0.12)',
              color: 'var(--theme-accent)'
            }}>
              <span className="text-sm font-semibold">{selectedPackages.size}</span>
              <span className="text-xs opacity-70">selected</span>
            </div>

            <div className="w-px h-8 opacity-20" style={{background: 'var(--theme-text-secondary)'}} />

            <motion.button
              onClick={handleBackupSelected}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: 'none'
              }}
              whileHover={{
                scale: 1.04,
                y: -2,
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
                transition: { duration: 0.15 }
              }}
              whileTap={{ scale: 0.97 }}
            >
              <FiDownload className="w-4 h-4" />
              Backup
            </motion.button>

            <motion.button
              onClick={handleUninstallSelected}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                border: 'none'
              }}
              whileHover={{
                scale: 1.04,
                y: -2,
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
                transition: { duration: 0.15 }
              }}
              whileTap={{ scale: 0.97 }}
            >
              <FiTrash2 className="w-4 h-4" />
              Uninstall
            </motion.button>

            <motion.button
              onClick={() => setSelectedPackages(new Set())}
              className="p-2 rounded-lg text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--theme-text-secondary)',
                border: 'none'
              }}
              whileHover={{
                scale: 1.04,
                rotate: 90,
                background: 'rgba(255, 255, 255, 0.08)',
                transition: { duration: 0.15 }
              }}
              whileTap={{ scale: 0.96 }}
              title="Clear selection"
            >
              <FiX className="w-4 h-4" />
            </motion.button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification System */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={
              'px-4 py-3 border min-w-[300px] shadow-lg animate-slide-in ' +
              (notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : notification.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200')
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() =>
                  setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
                }
                className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      <UninstallDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmUninstall}
        packageCount={selectedPackages.size}
        hasDangerous={packageData.some(p => selectedPackages.has(p.packageName) && p.safetyLevel === 'Dangerous')}
        hasExpert={packageData.some(p => selectedPackages.has(p.packageName) && p.safetyLevel === 'Expert')}
      />

      {/* Floating AI Chat Assistant */}
      <FloatingChat deviceName={deviceName} />
    </div>
  );
};

// Main App Wrapper
const AppWrapper: React.FC = () => {
  return <App />;
};

export default AppWrapper;
