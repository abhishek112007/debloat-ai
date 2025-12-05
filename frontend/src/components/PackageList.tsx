/**
 * PackageList Component (Performance Optimized)
 * 
 * Uses streaming package loading and virtualized rendering for smooth performance.
 * Handles 200+ packages without lag or UI freezing.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceMonitor } from '../hooks/useDeviceMonitor';
import { usePackageStream, StreamedPackage } from '../hooks/usePackageStream';
import { useTheme } from '../App';
import { VirtualizedPackageList } from './VirtualizedPackageList';
import {
  FiPackage,
  FiAlertTriangle,
  FiCheckCircle,
  FiSearch,
  FiX,
  FiZap,
  FiXOctagon,
  FiInfo,
  FiRefreshCw,
} from 'react-icons/fi';

type SafetyLevel = 'Safe' | 'Caution' | 'Expert' | 'Dangerous';

interface PackageStats {
  total: number;
  safe: number;
  caution: number;
  expert: number;
  dangerous: number;
  selected: number;
}

interface PackageListProps {
  selectedPackages: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onStatsChange: (stats: PackageStats) => void;
  filterBySafety?: string | null;
  onPackageDataChange?: (packages: Array<{packageName: string; safetyLevel: string}>) => void;
  onAiAdvisorOpen?: (packageName: string) => void;
}

const PackageList: React.FC<PackageListProps> = ({
  selectedPackages,
  onSelectionChange,
  onStatsChange,
  filterBySafety,
  onPackageDataChange,
  onAiAdvisorOpen,
}) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [search, setSearch] = useState<string>('');
  const [detailPackage, setDetailPackage] = useState<StreamedPackage | null>(null);
  const { isConnected, deviceId } = useDeviceMonitor();

  // Use streaming hook for performant package loading
  const {
    packages,
    loading,
    error,
    progress,
    statusMessage,
    fromCache,
    refresh,
  } = usePackageStream({
    autoStart: true,
    deviceId,
    isConnected,
  });

  // Update stats whenever packages change
  useEffect(() => {
    const stats: PackageStats = {
      total: packages.length,
      safe: packages.filter((p) => p.safetyLevel === 'Safe').length,
      caution: packages.filter((p) => p.safetyLevel === 'Caution').length,
      expert: packages.filter((p) => p.safetyLevel === 'Expert').length,
      dangerous: packages.filter((p) => p.safetyLevel === 'Dangerous').length,
      selected: selectedPackages.size,
    };
    onStatsChange(stats);
  }, [packages, selectedPackages, onStatsChange]);

  // Pass package data to parent
  useEffect(() => {
    if (onPackageDataChange && packages.length > 0) {
      onPackageDataChange(packages.map(p => ({ 
        packageName: p.packageName, 
        safetyLevel: p.safetyLevel 
      })));
    }
  }, [packages, onPackageDataChange]);

  // Clear selection when device changes
  useEffect(() => {
    if (!isConnected) {
      onSelectionChange(new Set());
    }
  }, [isConnected, onSelectionChange]);

  const toggleSelect = useCallback((packageName: string) => {
    const newSet = new Set(selectedPackages);
    if (newSet.has(packageName)) {
      newSet.delete(packageName);
    } else {
      newSet.add(packageName);
    }
    onSelectionChange(newSet);
  }, [selectedPackages, onSelectionChange]);

  const handlePackageClick = useCallback((pkg: StreamedPackage) => {
    setDetailPackage(pkg);
  }, []);

  // Filtered count for display
  const filteredCount = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch = search === '' ||
        pkg.packageName.toLowerCase().includes(search.toLowerCase()) ||
        pkg.appName.toLowerCase().includes(search.toLowerCase());
      const matchesSafety = !filterBySafety || pkg.safetyLevel === filterBySafety;
      return matchesSearch && matchesSafety;
    }).length;
  }, [packages, search, filterBySafety]);

  const getSafetyStyles = (level: SafetyLevel): string => {
    switch (level) {
      case 'Safe':
        return 'badge-safe';
      case 'Caution':
        return 'badge-caution';
      case 'Expert':
        return 'badge-expert';
      case 'Dangerous':
        return 'badge-dangerous';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white';
    }
  };

  const getSafetyIcon = (level: SafetyLevel): JSX.Element => {
    switch (level) {
      case 'Safe':
        return <FiCheckCircle className="w-3.5 h-3.5" />;
      case 'Caution':
        return <FiAlertTriangle className="w-3.5 h-3.5" />;
      case 'Expert':
        return <FiZap className="w-3.5 h-3.5" />;
      case 'Dangerous':
        return <FiXOctagon className="w-3.5 h-3.5" />;
      default:
        return <FiInfo className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full glass-card-float text-gray-800 dark:text-text-primary p-5 md:p-6 animate-scale-in">
      {/* Minimal Header with Refresh */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary flex items-center gap-2.5 transition-colors duration-250">
            <FiPackage className="w-4 h-4 text-accent" />
            Packages
            {fromCache && (
              <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{
                background: isLightMode ? 'rgba(46, 196, 182, 0.1)' : 'rgba(88, 166, 175, 0.15)',
                color: 'var(--theme-accent)',
              }}>
                cached
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1.5 transition-colors duration-250">
            {filteredCount} of {packages.length} shown
          </p>
        </div>
        
        {/* Refresh Button */}
        <motion.button
          onClick={() => refresh()}
          disabled={loading}
          className="p-2 rounded-lg"
          style={{
            background: isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
            border: isLightMode ? '1px solid rgba(0,0,0,0.05)' : 'none',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title="Refresh packages"
        >
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading 
              ? { duration: 1, repeat: Infinity, ease: 'linear' } 
              : { duration: 0.3 }
            }
            whileHover={!loading ? { rotate: 180, scale: 1.1 } : {}}
          >
            <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
          </motion.div>
        </motion.button>
      </div>

      {/* Minimal Search Bar */}
      <div className="relative mb-5 group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <FiSearch className="w-4 h-4 text-gray-400 group-focus-within:text-accent transition-all duration-250" />
        </div>
        <input
          type="text"
          placeholder="Search packages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            backgroundColor: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
            border: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '10px 40px 10px 38px',
            width: '100%',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 250ms ease',
            color: 'var(--theme-text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)';
            e.target.style.borderColor = isLightMode ? 'rgba(46,196,182,0.25)' : 'rgba(88,166,175,0.25)';
            e.target.style.boxShadow = isLightMode ? '0 0 12px rgba(46,196,182,0.12)' : '0 0 12px rgba(88,166,175,0.12)';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)';
            e.target.style.borderColor = isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-accent transition-all duration-250"
            aria-label="Clear search"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div 
          className="mb-4 p-4 rounded-lg flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <FiAlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
              Error loading packages
            </p>
            <p className="text-xs" style={{ color: '#EF4444', opacity: 0.8 }}>
              {error}
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Virtualized Package List */}
      <VirtualizedPackageList
        packages={packages}
        loading={loading}
        progress={progress}
        statusMessage={statusMessage}
        selectedPackages={selectedPackages}
        onToggleSelect={toggleSelect}
        onPackageClick={handlePackageClick}
        onAiAdvisorOpen={onAiAdvisorOpen}
        search={search}
        filterBySafety={filterBySafety}
      />

      {/* Glassmorphic Modal */}
      <AnimatePresence>
        {detailPackage && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{
              background: isLightMode ? 'rgba(0,0,0,0.40)' : 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(12px)',
            }}
            onClick={() => setDetailPackage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{
                background: isLightMode
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.90) 100%)'
                  : 'linear-gradient(135deg, rgba(17,17,17,0.95) 0%, rgba(13,13,13,0.95) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: isLightMode ? '1px solid rgba(0,0,0,0.06)' : 'none',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: isLightMode
                  ? '0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(46,196,182,0.12)'
                  : '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(88,166,175,0.12)',
              }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div 
                  style={{
                    background: isLightMode ? 'rgba(46,196,182,0.12)' : 'rgba(88,166,175,0.12)',
                    borderRadius: '10px',
                    padding: '8px',
                  }}
                >
                  <FiInfo className="w-5 h-5 text-accent" />
                </div>
                <h4 className="text-lg font-semibold text-text-primary">
                  Package Details
                </h4>
              </div>
              <motion.button
                onClick={() => setDetailPackage(null)}
                style={{
                  background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                  border: isLightMode ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                whileHover={{
                  background: 'rgba(239,68,68,0.15)',
                  scale: 1.05,
                  rotate: 90,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close dialog"
              >
                <FiX className="w-5 h-5 text-text-secondary" />
              </motion.button>
            </div>
            
            {/* Modal Content */}
            <div className="space-y-4">
              {/* Package Name */}
              <div 
                style={{
                  background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                  border: isLightMode ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2.5">
                  <FiPackage className="w-3.5 h-3.5" />
                  Package Name
                </div>
                <div 
                  className="font-mono text-sm text-text-primary break-all"
                  style={{
                    background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}
                >
                  {detailPackage.packageName}
                </div>
              </div>
              
              {/* App Name */}
              <div 
                style={{
                  background: isLightMode ? 'rgba(46,196,182,0.10)' : 'rgba(88,166,175,0.08)',
                  border: isLightMode ? '1px solid rgba(46,196,182,0.15)' : 'none',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide mb-2.5">
                  <FiPackage className="w-3.5 h-3.5" />
                  Application Name
                </div>
                <div className="text-base font-semibold text-text-primary">
                  {detailPackage.appName}
                </div>
              </div>
              
              {/* Safety Level */}
              <div 
                style={{
                  background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                  border: isLightMode ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2.5">
                  {getSafetyIcon(detailPackage.safetyLevel)}
                  Safety Level
                </div>
                <span className={getSafetyStyles(detailPackage.safetyLevel)}>
                  {getSafetyIcon(detailPackage.safetyLevel)} {detailPackage.safetyLevel}
                </span>
              </div>
            </div>
            
            {/* Modal Footer */}
            <motion.button
              type="button"
              onClick={() => setDetailPackage(null)}
              className="mt-6 w-full btn-ghost text-sm font-semibold"
              style={{
                padding: '12px',
                borderRadius: '10px',
              }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackageList;