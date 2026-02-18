import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceMonitor } from '../hooks/useDeviceMonitor';
import { useTheme } from '../App';
import {
  FiPackage,
  FiAlertTriangle,
  FiCheckCircle,
  FiSearch,
  FiX,
  FiZap,
  FiXOctagon,
  FiInfo,
} from 'react-icons/fi';
import {
  packageListContainer,
  packageListItem,
} from '../utils/animations';

type SafetyLevel = 'Safe' | 'Caution' | 'Expert' | 'Dangerous';

type Package = {
  packageName: string;
  appName: string;
  safetyLevel: SafetyLevel;
};

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
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [detailPackage, setDetailPackage] = useState<Package | null>(null);
  const { isConnected, deviceId } = useDeviceMonitor();

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.listPackages();
      const pkgs = res ?? [];
      setPackages(pkgs);
      
      // Pass package data to parent for safety checking
      if (onPackageDataChange) {
        onPackageDataChange(pkgs.map(p => ({ packageName: p.packageName, safetyLevel: p.safetyLevel })));
      }
    } catch (err) {
      console.error('list_packages failed', err);
      setPackages([]);
      if (onPackageDataChange) {
        onPackageDataChange([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages when device connects or changes
  useEffect(() => {
    if (isConnected && deviceId) {
      fetchPackages();
      // Clear selection when device changes
      onSelectionChange(new Set());
    } else {
      // Clear packages when device disconnects
      setPackages([]);
      onSelectionChange(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, deviceId]);

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

  const filtered = packages.filter((pkg) => {
    // Search filter
    const matchesSearch =
      pkg.packageName.toLowerCase().includes(search.toLowerCase()) ||
      pkg.appName.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Safety level filter
    if (filterBySafety) {
      return pkg.safetyLevel === filterBySafety;
    }
    
    return true;
  });

  const toggleSelect = (packageName: string) => {
    const newSet = new Set(selectedPackages);
    if (newSet.has(packageName)) {
      newSet.delete(packageName);
    } else {
      newSet.add(packageName);
    }
    onSelectionChange(newSet);
  };

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
      {/* Minimal Header */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-text-primary flex items-center gap-2.5 transition-colors duration-250">
          <FiPackage className="w-4 h-4 text-accent" />
          Packages
        </h3>
        <p className="text-xs text-gray-500 dark:text-text-tertiary mt-1.5 transition-colors duration-250">
          {filtered.length} of {packages.length} shown
        </p>
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
            style={{ transform: 'scale(1)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Clear search"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="h-14 rounded-xl animate-pulse" 
              style={{
                background: 'rgba(255,255,255,0.02)',
                animationDelay: `${i * 80}ms`
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 animate-scale-in">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center animate-fade-in">
              <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600 opacity-50" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-250">No packages found</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-250">Try adjusting your search</p>
            </div>
          ) : (
            <motion.div
              variants={packageListContainer}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {filtered.map((pkg) => {
                const isSelected = selectedPackages.has(pkg.packageName);
                
                return (
                  <motion.div
                    key={pkg.packageName}
                    variants={packageListItem}
                    layout
                  >
                    {/* Glassmorphic Chip Card */}
                    <motion.div
                      style={{
                        background: isSelected 
                          ? (isLightMode 
                              ? 'linear-gradient(135deg, rgba(46,196,182,0.12) 0%, rgba(46,196,182,0.08) 100%)'
                              : 'linear-gradient(135deg, rgba(88,166,175,0.12) 0%, rgba(88,166,175,0.08) 100%)')
                          : (isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                        border: isLightMode ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        boxShadow: isSelected
                          ? (isLightMode 
                              ? '0 0 16px rgba(46,196,182,0.15), 0 4px 12px rgba(0,0,0,0.06)'
                              : '0 0 16px rgba(88,166,175,0.12), 0 4px 12px rgba(0,0,0,0.04)')
                          : (isLightMode ? '0 2px 6px rgba(0,0,0,0.04)' : '0 2px 6px rgba(0,0,0,0.02)'),
                      }}
                      onClick={() => toggleSelect(pkg.packageName)}
                      whileHover={{
                        y: -2,
                        boxShadow: isSelected
                          ? (isLightMode 
                              ? '0 0 20px rgba(46,196,182,0.20), 0 6px 16px rgba(0,0,0,0.08)'
                              : '0 0 20px rgba(88,166,175,0.18), 0 6px 16px rgba(0,0,0,0.06)')
                          : (isLightMode 
                              ? '0 0 12px rgba(46,196,182,0.10), 0 4px 10px rgba(0,0,0,0.06)'
                              : '0 0 12px rgba(88,166,175,0.08), 0 4px 10px rgba(0,0,0,0.04)'),
                        background: isSelected
                          ? (isLightMode
                              ? 'linear-gradient(135deg, rgba(46,196,182,0.16) 0%, rgba(46,196,182,0.10) 100%)'
                              : 'linear-gradient(135deg, rgba(88,166,175,0.16) 0%, rgba(88,166,175,0.10) 100%)')
                          : (isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'),
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(pkg.packageName);
                        }}
                        className="checkbox-modern flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {/* Package Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FiPackage className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-text-primary truncate">
                            {pkg.appName}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-gray-500 dark:text-text-tertiary truncate">
                          {pkg.packageName}
                        </div>
                      </div>
                      
                      {/* AI Advisor Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAiAdvisorOpen?.(pkg.packageName);
                        }}
                        className="flex-shrink-0 p-2 rounded-lg"
                        style={{
                          background: isLightMode ? 'rgba(46, 196, 182, 0.12)' : 'rgba(88, 166, 175, 0.12)',
                          border: isLightMode ? '1px solid rgba(46, 196, 182, 0.15)' : 'none',
                        }}
                        whileHover={{
                          scale: 1.1,
                          boxShadow: isLightMode 
                            ? '0 4px 12px rgba(46, 196, 182, 0.25)'
                            : '0 4px 12px rgba(88, 166, 175, 0.25)',
                        }}
                        whileTap={{ scale: 0.95 }}
                        title="AI Safety Analysis"
                      >
                        <FiZap className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                      </motion.button>
                      
                      {/* Safety Badge */}
                      <div className="flex-shrink-0">
                        <span 
                          className={getSafetyStyles(pkg.safetyLevel)}
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {getSafetyIcon(pkg.safetyLevel)} {pkg.safetyLevel}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
            </motion.div>
          )}
        </div>
      )}

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