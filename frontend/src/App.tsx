import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import DevicePanel from './components/DevicePanel';
import PackageList from './components/PackageList';
import BackupManager from './components/BackupManager';
import UninstallDialog from './components/UninstallDialog';
import ThemeSelector from './components/ThemeSelector';
import FloatingChat from './components/FloatingChat';
import AIPackageAdvisor from './components/AIPackageAdvisor';
import { THEMES, ThemeName, applyTheme } from './utils/themes';
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

// Theme Context
interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Provider Component
interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const stored = localStorage.getItem('theme-preference') as ThemeName;
    return stored && THEMES[stored] ? stored : 'light';
  });

  useEffect(() => {
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      applyTheme(theme);
    });
    
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  const toggle = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme,
      availableThemes: Object.keys(THEMES) as ThemeName[],
      isDark: theme === 'dark',
      toggle,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

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
  const [aiAdvisorPackage, setAiAdvisorPackage] = useState<string | null>(null);
  
  const isLightMode = theme === 'light';

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
      const result = await api.createBackup(packagesArray);

      if (result.success) {
        addNotification(`✅ Backup created: ${result.backupName}`, 'success');
        setSelectedPackages(new Set()); // Clear selection
      } else {
        addNotification(`❌ Backup failed: ${result.message || result.error}`, 'error');
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
        const result = await api.uninstallPackage(packageName);

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
    <motion.div 
      className="h-full w-full overflow-hidden flex flex-col" 
      style={{backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-primary)'}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Ultra-Thin Glass Navbar */}
      <motion.nav 
        className="flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 relative z-50" 
        style={{
          background: isLightMode 
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.45) 100%)'
            : 'linear-gradient(180deg, rgba(17, 17, 17, 0.4) 0%, rgba(13, 13, 13, 0.2) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.04)',
          boxShadow: isLightMode 
            ? '0 1px 0 rgba(255, 255, 255, 0.5) inset, 0 2px 8px rgba(0, 0, 0, 0.06)'
            : '0 1px 0 rgba(255, 255, 255, 0.02) inset, 0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Logo & Title - Minimal */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <img src="/icon-192.png" alt="Debloat AI" className="w-7 h-7 rounded-lg" />
            <motion.h1 
              className="text-lg font-semibold tracking-tight" 
              style={{
                color: 'var(--theme-text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              Debloat AI
            </motion.h1>
            <motion.span 
              className="text-xs px-2 py-0.5 rounded-full" 
              style={{
              background: isLightMode ? 'rgba(46, 196, 182, 0.12)' : 'rgba(88, 166, 175, 0.12)',
              color: 'var(--theme-accent)',
              fontWeight: 500
            }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              whileHover={{ scale: 1.1 }}
            >
              ADB Tool
            </motion.span>
          </motion.div>

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
      </motion.nav>

      {/* Main Layout - Responsive */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden px-2 sm:px-4 py-2 sm:py-4 gap-2 sm:gap-4 max-w-[1800px] mx-auto w-full">
        {/* Left Sidebar - Collapsible on mobile */}
        <aside className="w-full lg:w-64 flex-shrink-0 overflow-y-auto glass-card p-3 sm:p-5 lg:max-h-full max-h-[200px]" style={{
          background: isLightMode
            ? 'rgba(255, 255, 255, 0.65)'
            : 'rgba(17, 17, 17, 0.6)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: isLightMode
            ? '0 4px 10px rgba(0, 0, 0, 0.06)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
          border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px'
        }}>
          {/* Selection Summary - Only show when active */}
          {selectedPackages.size > 0 && (
            <div className="mb-5 p-4 rounded-xl transition-all duration-300 device-connected-pulse" style={{
              background: 'rgba(46, 196, 182, 0.08)',
              boxShadow: '0 0 20px rgba(46, 196, 182, 0.12)',
              border: '1px solid rgba(46, 196, 182, 0.15)'
            }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="status-dot status-connected" />
                  <span className="text-sm font-semibold" style={{color: 'var(--theme-accent)'}}>Active Selection</span>
                </div>
                <button
                  onClick={() => setSelectedPackages(new Set())}
                  className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/5"
                  title="Clear selection"
                >
                  <FiX className="w-4 h-4 transition-transform duration-200 hover:rotate-90" style={{color: 'var(--theme-accent)'}} />
                </button>
              </div>
              <div className="text-3xl font-bold mb-1" style={{color: 'var(--theme-accent)'}}>
                {selectedPackages.size}
              </div>
              <div className="text-xs opacity-70" style={{color: 'var(--theme-accent)'}}>
                package{selectedPackages.size !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}
          
          <DevicePanel />
        </aside>

        {/* Main Content - Floating Panel */}
        <main className="flex-1 overflow-y-auto glass-card p-6" style={{
          background: isLightMode
            ? 'rgba(255, 255, 255, 0.65)'
            : 'rgba(17, 17, 17, 0.6)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: isLightMode
            ? '0 4px 10px rgba(0, 0, 0, 0.06)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
          border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
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
                  background: filterBySafety === null ? 'var(--theme-accent)' : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                  color: filterBySafety === null ? 'white' : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: filterBySafety === null 
                    ? '0 2px 8px rgba(46, 196, 182, 0.2)'
                    : '0 1px 3px rgba(0, 0, 0, 0.04)'
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
                  background: filterBySafety === 'Safe' 
                    ? (isLightMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.2)') 
                    : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                  color: filterBySafety === 'Safe' ? (isLightMode ? '#059669' : '#34D399') : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: filterBySafety === 'Safe' ? '0 2px 8px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
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
                  background: filterBySafety === 'Caution' 
                    ? (isLightMode ? 'rgba(251, 191, 36, 0.12)' : 'rgba(251, 191, 36, 0.2)') 
                    : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                  color: filterBySafety === 'Caution' ? (isLightMode ? '#92400e' : '#fcd34d') : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: filterBySafety === 'Caution' ? '0 2px 8px rgba(251, 191, 36, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
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
                  background: filterBySafety === 'Expert' 
                    ? (isLightMode ? 'rgba(249, 115, 22, 0.12)' : 'rgba(249, 115, 22, 0.2)') 
                    : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                  color: filterBySafety === 'Expert' ? (isLightMode ? '#9a3412' : '#fb923c') : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: filterBySafety === 'Expert' ? '0 2px 8px rgba(249, 115, 22, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
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
                  background: filterBySafety === 'Dangerous' 
                    ? (isLightMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.2)') 
                    : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                  color: filterBySafety === 'Dangerous' ? (isLightMode ? '#991b1b' : '#fca5a5') : 'var(--theme-text-secondary)',
                  border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: filterBySafety === 'Dangerous' ? '0 2px 8px rgba(239, 68, 68, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
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
              onAiAdvisorOpen={setAiAdvisorPackage}
            />
          )}
        </main>

        {/* Right Info Panel - Hidden on mobile, shown on lg */}
        <aside className="hidden lg:block w-56 flex-shrink-0 overflow-y-auto glass-card p-4 space-y-3" style={{
          background: isLightMode
            ? 'rgba(255, 255, 255, 0.65)'
            : 'rgba(17, 17, 17, 0.6)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: isLightMode
            ? '0 4px 10px rgba(0, 0, 0, 0.06)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
          border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px'
        }}>
          {/* Total & Selected - Minimal Cards */}
          <div className="p-4 rounded-xl transition-all duration-200" style={{
            background: isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)',
            boxShadow: isLightMode ? '0 2px 6px rgba(0, 0, 0, 0.04)' : '0 2px 6px rgba(0, 0, 0, 0.2)',
            border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)'
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
              ? 'rgba(46, 196, 182, 0.10)'
              : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
            boxShadow: stats.selected > 0 
              ? '0 0 20px rgba(46, 196, 182, 0.15)'
              : (isLightMode ? '0 2px 6px rgba(0, 0, 0, 0.04)' : '0 2px 6px rgba(0, 0, 0, 0.2)'),
            border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)'
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
          <div className="h-px my-2" style={{background: isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'}} />

          {/* Safety Levels - Minimal Buttons */}
          <div className="space-y-2">{/* Safe */}
            <button
              onClick={() => setFilterBySafety(filterBySafety === 'Safe' ? null : 'Safe')}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
              style={{
                background: filterBySafety === 'Safe' ? 'rgba(16, 185, 129, 0.12)' : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                boxShadow: filterBySafety === 'Safe' ? '0 0 16px rgba(16, 185, 129, 0.15)' : (isLightMode ? '0 1px 3px rgba(0, 0, 0, 0.04)' : '0 1px 3px rgba(0, 0, 0, 0.2)'),
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Safe') {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Safe') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)';
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
                background: filterBySafety === 'Caution' ? 'rgba(251, 191, 36, 0.12)' : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                boxShadow: filterBySafety === 'Caution' ? '0 0 16px rgba(251, 191, 36, 0.15)' : (isLightMode ? '0 1px 3px rgba(0, 0, 0, 0.04)' : '0 1px 3px rgba(0, 0, 0, 0.2)'),
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Caution') {
                  e.currentTarget.style.background = 'rgba(251, 191, 36, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Caution') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)';
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
                background: filterBySafety === 'Expert' ? 'rgba(249, 115, 22, 0.12)' : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                boxShadow: filterBySafety === 'Expert' ? '0 0 16px rgba(249, 115, 22, 0.15)' : (isLightMode ? '0 1px 3px rgba(0, 0, 0, 0.04)' : '0 1px 3px rgba(0, 0, 0, 0.2)'),
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Expert') {
                  e.currentTarget.style.background = 'rgba(249, 115, 22, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Expert') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)';
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
                background: filterBySafety === 'Dangerous' ? 'rgba(239, 68, 68, 0.12)' : (isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'),
                boxShadow: filterBySafety === 'Dangerous' ? '0 0 16px rgba(239, 68, 68, 0.15)' : (isLightMode ? '0 1px 3px rgba(0, 0, 0, 0.04)' : '0 1px 3px rgba(0, 0, 0, 0.2)'),
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (filterBySafety !== 'Dangerous') {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterBySafety !== 'Dangerous') {
                  e.currentTarget.style.background = isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)';
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
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-xl" style={{
            background: isLightMode 
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(17, 17, 17, 0.95)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: isLightMode
              ? '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 40px rgba(46, 196, 182, 0.18)'
              : '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(88, 166, 175, 0.25)',
            border: isLightMode ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
              background: 'rgba(46, 196, 182, 0.12)',
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
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              layout
              className={
                'px-4 py-3 border min-w-[300px] shadow-lg rounded-xl backdrop-blur-md ' +
                (notification.type === 'success'
                  ? 'bg-green-50/90 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  : notification.type === 'error'
                  ? 'bg-red-50/90 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                  : 'bg-blue-50/90 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200')
              }
              whileHover={{ scale: 1.02, x: -5 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{notification.message}</span>
                <motion.button
                  onClick={() =>
                    setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
                  }
                  className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              {/* Progress bar for auto-dismiss */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 rounded-b-xl"
                style={{
                  background: notification.type === 'success' 
                    ? 'rgba(16, 185, 129, 0.5)'
                    : notification.type === 'error'
                    ? 'rgba(239, 68, 68, 0.5)'
                    : 'rgba(59, 130, 246, 0.5)'
                }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
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

      {/* AI Package Advisor Sidebar - Rendered at root level to avoid stacking context issues */}
      <AIPackageAdvisor
        packageName={aiAdvisorPackage}
        onClose={() => setAiAdvisorPackage(null)}
      />

      {/* Floating AI Chat */}
      <FloatingChat />
    </motion.div>
  );
};

// Main App Wrapper with Theme Provider
const AppWrapper: React.FC = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  
};

export default AppWrapper;
