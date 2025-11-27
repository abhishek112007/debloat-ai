import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import DevicePanel from './DevicePanel';
import PackageList from './PackageList';
import BackupManager from './BackupManager';
import UninstallDialog from './UninstallDialog';
import ThemeSelector from './ThemeSelector';
import { THEMES, ThemeName, applyTheme } from './themes';
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
  FiFilter,
  FiInfo,
  FiRefreshCw,
} from 'react-icons/fi';

// Theme Context
interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
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

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme,
      availableThemes: Object.keys(THEMES) as ThemeName[]
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
    <div className="h-full w-full overflow-hidden bg-theme-bg text-theme-text-primary transition-colors duration-300 flex flex-col animate-fade-in" style={{backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-primary)'}}>
      {/* Header */}
      <header className="border-b-2 bg-theme-card shadow-sm flex-shrink-0 animate-slide-down" style={{borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-card)'}}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-3">
          <div className="group">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 transition-all duration-300 hover:scale-105">
              Debloat AI
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-text-tertiary mt-0.5 transition-colors duration-200">
              AI-powered Android debloater - Remove bloatware safely
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* View Backups Button */}
            <button
              onClick={() => setShowBackupManager(!showBackupManager)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border-2 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              style={{borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-card)', color: 'var(--theme-text-primary)'}}
            >
              {showBackupManager ? (
                <>
                  <FiList className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                  <span>Package List</span>
                </>
              ) : (
                <>
                  <FiArchive className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>View Backups</span>
                </>
              )}
            </button>

            {/* Theme Selector */}
            <ThemeSelector />
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t px-4 sm:px-6 py-3 transition-all duration-300" style={{borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg)'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm font-medium transition-all duration-200" style={{color: 'var(--theme-text-secondary)'}}>
              <span className={`inline-block transition-all duration-300 ${selectedPackages.size > 0 ? 'scale-110 text-primary-600 dark:text-primary-400' : ''}`}>
                {selectedPackages.size}
              </span> package(s) selected
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
>
              <button
                onClick={handleBackupSelected}
                disabled={selectedPackages.size === 0}
                className="btn-success w-full sm:w-auto text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Backup ({selectedPackages.size})
              </button>
              <button
                onClick={handleUninstallSelected}
                disabled={selectedPackages.size === 0}
                className="btn-danger w-full sm:w-auto text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Uninstall ({selectedPackages.size})
              </button>
              <button
                onClick={() => setSelectedPackages(new Set())}
                disabled={selectedPackages.size === 0}
                className="btn-secondary w-full sm:w-auto text-sm flex items-center justify-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout - Responsive Grid */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Sidebar - Device Panel */}
        <aside className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r-2 p-5 overflow-y-auto" style={{borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-card)'}}>
          <DevicePanel />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto" style={{backgroundColor: 'var(--theme-bg)'}}>
          {/* Filter Indicator */}
          {filterBySafety && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-500/10 border-2 border-primary-200 dark:border-primary-500/30 rounded-lg shadow-sm">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Filtering by: <strong>{filterBySafety}</strong>
              </span>
              <button
                onClick={() => setFilterBySafety(null)}
                className="ml-auto px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700"
              >
                Clear Filter
              </button>
            </div>
          )}
          
          {/* Filter Controls - Only show when not in backup mode */}
          {!showBackupManager && (
            <div className="mb-6 flex flex-wrap items-center gap-2 p-4 rounded-xl border-2 shadow-sm" style={{backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)'}}>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{color: 'var(--theme-text-primary)'}}>
                <FiFilter className="w-4 h-4" /> Filter:
              </span>
              <button
                onClick={() => setFilterBySafety(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  filterBySafety === null
                    ? 'bg-primary-600 text-white shadow-md scale-105'
                    : 'border-2 hover:shadow-sm'
                }`}
                style={filterBySafety === null ? {} : {backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)'}}
              >
                All Packages
              </button>
              <button
                onClick={() => setFilterBySafety('Safe')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  filterBySafety === 'Safe'
                    ? 'bg-success-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 border-2 border-success-300 dark:border-success-700 text-success-700 dark:text-success-400 hover:border-success-500 hover:shadow-sm'
                }`}
              >
                <FiCheckCircle className="w-3.5 h-3.5" /> Safe
              </button>
              <button
                onClick={() => setFilterBySafety('Caution')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  filterBySafety === 'Caution'
                    ? 'bg-warning-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 border-2 border-warning-300 dark:border-warning-700 text-warning-700 dark:text-warning-400 hover:border-warning-500 hover:shadow-sm'
                }`}
              >
                <FiAlertTriangle className="w-3.5 h-3.5" /> Caution
              </button>
              <button
                onClick={() => setFilterBySafety('Expert')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  filterBySafety === 'Expert'
                    ? 'bg-orange-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 hover:border-orange-500 hover:shadow-sm'
                }`}
              >
                <FiZap className="w-3.5 h-3.5" /> Expert
              </button>
              <button
                onClick={() => setFilterBySafety('Dangerous')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  filterBySafety === 'Dangerous'
                    ? 'bg-danger-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 border-2 border-danger-300 dark:border-danger-700 text-danger-700 dark:text-danger-400 hover:border-danger-500 hover:shadow-sm'
                }`}
              >
                <FiXOctagon className="w-3.5 h-3.5" /> Dangerous
              </button>
              {filterBySafety && (
                <button
                  onClick={() => setFilterBySafety(null)}
                  className="ml-auto px-4 py-2 text-xs font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-1.5"
                >
                  <FiX className="w-3.5 h-3.5" /> Clear
                </button>
              )}
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

        {/* Right Sidebar - Quick Stats (Hidden on mobile, shown on large screens) */}
        <aside className="hidden lg:flex lg:flex-col w-[280px] border-l-2 overflow-hidden animate-slide-in-right" style={{borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-card)'}}>
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-5 border-b-2 bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 dark:from-primary-900/30 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm animate-gradient-x" style={{borderColor: 'var(--theme-border)'}}>
            <h3 className="text-lg font-bold flex items-center gap-2 animate-bounce-subtle" style={{color: 'var(--theme-text-primary)'}}>
              <FiFilter className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-pulse" />
              Quick Stats
            </h3>
            <p className="text-xs mt-1" style={{color: 'var(--theme-text-secondary)'}}>
              Package overview & filters
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Total Packages - EXTREME CARD */}
            <div className="group relative card p-4 border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-100 via-blue-50 to-purple-50 dark:from-primary-900/30 dark:via-blue-900/20 dark:to-purple-900/20 hover:scale-110 hover:rotate-2 hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-500 cursor-pointer overflow-hidden animate-slide-up">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 animate-gradient-x transition-opacity duration-500" />
              
              {/* Sparkle effects */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-60 group-hover:scale-150 transition-all duration-700" />
              
              <div className="relative z-10 text-3xl font-bold text-primary-600 dark:text-primary-400 group-hover:scale-125 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-all duration-500">
                {stats.total}
              </div>
              <div className="relative z-10 text-xs font-semibold text-gray-600 dark:text-text-tertiary uppercase tracking-wide mt-1 group-hover:tracking-wider transition-all duration-300">
                Total Packages
              </div>
            </div>

            {/* Selected - WILD CARD */}
            <div className={`group relative card p-4 border-2 transition-all duration-500 cursor-pointer overflow-hidden ${stats.selected > 0 ? 'animate-bounce-subtle border-info-400 dark:border-info-600 bg-gradient-to-br from-info-100 via-cyan-50 to-blue-50 dark:from-info-900/30 dark:via-cyan-900/20 dark:to-blue-900/20' : 'border-info-200 dark:border-info-800 bg-gradient-to-br from-info-50 to-white dark:from-info-900/20 dark:to-dark-card'} hover:scale-110 hover:-rotate-2 hover:shadow-2xl hover:shadow-info-500/50`} style={{animationDelay: '100ms'}}>
              {/* Pulse ring */}
              {stats.selected > 0 && (
                <div className="absolute inset-0 border-4 border-info-400 rounded-xl animate-ping opacity-20" />
              )}
              
              {/* Animated shine */}
              <div className="absolute -top-full left-0 w-full h-full bg-gradient-to-b from-transparent via-white/50 to-transparent group-hover:top-full transition-all duration-1000" />
              
              <div className={`relative z-10 text-3xl font-bold transition-all duration-500 ${stats.selected > 0 ? 'text-info-600 dark:text-info-400 group-hover:scale-150 animate-pulse' : 'text-info-600 dark:text-info-400 group-hover:scale-125'}`}>
                {stats.selected}
              </div>
              <div className="relative z-10 text-xs font-semibold text-gray-600 dark:text-text-tertiary uppercase tracking-wide mt-1 group-hover:tracking-widest transition-all duration-300">
                Selected
              </div>
            </div>

            {/* Safety Breakdown */}
            <div className="space-y-2 animate-fade-in" style={{animationDelay: '200ms'}}>
              <div className="text-xs font-bold text-gray-700 dark:text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-dark-border to-transparent animate-pulse"></div>
                Safety Levels
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-dark-border to-transparent animate-pulse"></div>
              </div>

              {/* Safe */}
              <button
                onClick={() => setFilterBySafety(filterBySafety === 'Safe' ? null : 'Safe')}
                className={`group relative w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden ${
                  filterBySafety === 'Safe'
                    ? 'bg-gradient-to-r from-success-100 via-green-100 to-emerald-100 dark:from-success-800/50 dark:via-green-800/50 dark:to-emerald-800/50 border-success-500 shadow-lg shadow-success-500/50 scale-105 animate-pulse'
                    : 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800 hover:bg-gradient-to-r hover:from-success-100 hover:to-green-100 dark:hover:from-success-800/40 dark:hover:to-green-800/40 hover:shadow-lg hover:scale-105 hover:border-success-400 active:scale-95'
                }`}
              >
                {/* Glowing orb */}
                <div className={`absolute inset-0 bg-gradient-to-r from-success-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${filterBySafety === 'Safe' ? 'animate-gradient-x' : ''}`} />
                
                <span className="relative z-10 text-sm font-semibold text-success-800 dark:text-success-200 flex items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                  <FiCheckCircle className={`w-4 h-4 ${filterBySafety === 'Safe' ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                  Safe
                </span>
                <span className={`relative z-10 text-lg font-bold text-success-600 dark:text-success-400 group-hover:scale-125 transition-transform duration-300 ${stats.safe > 0 ? 'animate-bounce-subtle' : ''}`}>
                  {stats.safe}
                </span>
              </button>

              {/* Caution */}
              <button
                onClick={() => setFilterBySafety(filterBySafety === 'Caution' ? null : 'Caution')}
                className={`group relative w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-lg hover:shadow-warning-500/50 ${
                  filterBySafety === 'Caution'
                    ? 'bg-gradient-to-r from-warning-100 via-yellow-100 to-amber-100 dark:bg-gradient-to-r dark:from-warning-800/50 dark:via-yellow-800/50 dark:to-amber-800/50 border-warning-500 shadow-lg shadow-warning-500/50 scale-105 animate-pulse'
                    : 'bg-gradient-to-r from-warning-50 via-yellow-50/50 to-amber-50/30 dark:bg-gradient-to-r dark:from-warning-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 border-warning-200 dark:border-warning-800 hover:border-warning-400'
                }`}
              >
                {/* Glowing orb effect */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-warning-400/30 to-yellow-500/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                
                <span className="text-sm font-semibold text-warning-800 dark:text-warning-200 flex items-center gap-2 relative z-10">
                  <FiAlertTriangle className={`w-4 h-4 transition-all duration-500 ${filterBySafety === 'Caution' ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  Caution
                </span>
                <span className={`text-lg font-bold text-warning-600 dark:text-warning-400 relative z-10 transition-all duration-300 ${filterBySafety === 'Caution' ? 'scale-125' : 'group-hover:scale-110'}`}>
                  {stats.caution}
                </span>
              </button>

              {/* Expert */}
              <button
                onClick={() => setFilterBySafety(filterBySafety === 'Expert' ? null : 'Expert')}
                className={`group relative w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 hover:-rotate-1 ${
                  filterBySafety === 'Expert'
                    ? 'bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:bg-gradient-to-r dark:from-orange-800/50 dark:via-amber-800/50 dark:to-yellow-800/50 border-orange-500 shadow-lg shadow-orange-500/50 scale-105 animate-bounce-subtle'
                    : 'bg-gradient-to-r from-orange-50 via-amber-50/50 to-yellow-50/30 dark:bg-gradient-to-r dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-400'
                }`}
              >
                {/* Lightning bolt effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-300/20 via-transparent to-yellow-300/20 group-hover:animate-pulse" />
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-gradient-to-tl from-orange-500/40 to-yellow-500/40 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                
                <span className="text-sm font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2 relative z-10">
                  <FiZap className={`w-4 h-4 transition-all duration-500 ${filterBySafety === 'Expert' ? 'animate-spin' : 'group-hover:rotate-[360deg] group-hover:scale-125'}`} />
                  Expert
                </span>
                <span className={`text-lg font-bold text-orange-600 dark:text-orange-400 relative z-10 transition-all duration-300 ${filterBySafety === 'Expert' ? 'scale-125 animate-bounce-subtle' : 'group-hover:scale-110'}`}>
                  {stats.expert}
                </span>
              </button>

              {/* Dangerous */}
              <button
                onClick={() => setFilterBySafety(filterBySafety === 'Dangerous' ? null : 'Dangerous')}
                className={`group relative w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-danger-500/60 ${
                  filterBySafety === 'Dangerous'
                    ? 'bg-gradient-to-r from-danger-100 via-red-100 to-pink-100 dark:bg-gradient-to-r dark:from-danger-800/50 dark:via-red-800/50 dark:to-pink-800/50 border-danger-500 shadow-2xl shadow-danger-500/60 scale-105 animate-shake'
                    : 'bg-gradient-to-r from-danger-50 via-red-50/50 to-pink-50/30 dark:bg-gradient-to-r dark:from-danger-900/20 dark:via-red-900/20 dark:to-pink-900/20 border-danger-200 dark:border-danger-800 hover:border-danger-400 hover:animate-shake'
                }`}
              >
                {/* Danger glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-danger-400/30 via-red-500/20 to-pink-500/30 group-hover:animate-pulse" />
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-gradient-to-tr from-danger-500/50 via-red-600/40 to-pink-500/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                
                <span className="text-sm font-semibold text-danger-800 dark:text-danger-200 flex items-center gap-2 relative z-10">
                  <FiXOctagon className={`w-4 h-4 transition-all duration-500 ${filterBySafety === 'Dangerous' ? 'animate-spin' : 'group-hover:rotate-180 group-hover:scale-125'}`} />
                  Dangerous
                </span>
                <span className={`text-lg font-bold text-danger-600 dark:text-danger-400 relative z-10 transition-all duration-300 ${filterBySafety === 'Dangerous' ? 'scale-150 animate-bounce-subtle' : 'group-hover:scale-125'}`}>
                  {stats.dangerous}
                </span>
              </button>
            </div>

            {/* Safety Tips */}
            <div className="mt-6 space-y-3">
              <div className="text-xs font-bold text-gray-700 dark:text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-300 dark:bg-dark-border"></div>
                Safety Tips
                <div className="h-px flex-1 bg-gray-300 dark:bg-dark-border"></div>
              </div>
              
              <div className="p-4 bg-info-50 dark:bg-info-900/20 border-2 border-info-200 dark:border-info-800 rounded-xl">
                <div className="text-xs text-info-800 dark:text-info-200 space-y-3">
                  <div className="flex items-start gap-2">
                    <FiDownload className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p><strong>Backup First:</strong> Always create a backup before uninstalling packages.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p><strong>Start Safe:</strong> Begin with "Safe" packages if you're unsure.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p><strong>Research:</strong> Google package names to understand their purpose.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiRefreshCw className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p><strong>Reboot:</strong> Some changes require a device restart to take effect.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-200 dark:border-warning-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-warning-800 dark:text-warning-200">
                    <strong>Warning:</strong> System apps marked "Dangerous" can brick your device. Only remove if you know what you're doing.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

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
    </div>
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
