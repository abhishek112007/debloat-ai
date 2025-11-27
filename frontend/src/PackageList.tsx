import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useDeviceMonitor } from './useDeviceMonitor';
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
}

const PackageList: React.FC<PackageListProps> = ({
  selectedPackages,
  onSelectionChange,
  onStatsChange,
  filterBySafety,
  onPackageDataChange,
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [detailPackage, setDetailPackage] = useState<Package | null>(null);
  const { isConnected, deviceId } = useDeviceMonitor();

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await invoke<Package[]>('list_packages');
      setPackages(res ?? []);
      
      // Pass package data to parent for safety checking
      if (onPackageDataChange) {
        onPackageDataChange(res.map(p => ({ packageName: p.packageName, safetyLevel: p.safetyLevel })));
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
    <div className="w-full bg-white dark:bg-dark-card text-gray-800 dark:text-text-primary p-5 md:p-6 rounded-xl shadow-soft-lg border border-gray-200 dark:border-dark-border transition-all duration-300 animate-scale-in hover:shadow-soft-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-text-primary flex items-center gap-3 transition-colors duration-200">
            <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
              <FiPackage className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            Installed Packages
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-text-tertiary mt-2 ml-11 transition-colors duration-200">
            <span className={`font-semibold text-primary-600 dark:text-primary-400 transition-all duration-300 ${selectedPackages.size > 0 ? 'scale-110 inline-block' : ''}`}>{selectedPackages.size}</span> selected • 
            <span className="ml-1"><span className="font-semibold">{filtered.length}</span> of {packages.length} packages</span>
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 group-focus-within:scale-110 transition-all duration-200" />
        </div>
        <input
          type="text"
          placeholder="Search by package or app name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-modern pl-12 pr-12 text-sm shadow-sm"  
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-danger-500 dark:hover:text-danger-400 hover:scale-110 active:scale-95 transition-all duration-200"
            aria-label="Clear search"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden border-2 animate-scale-in">
          <div className="max-h-[calc(100vh-400px)] md:max-h-[500px] overflow-auto scrollbar-custom">
            {/* Header - Hidden on small mobile, visible on larger screens */}
            <div className="hidden sm:grid grid-cols-[56px_2fr_2fr_160px] bg-gray-100 dark:bg-dark-bg border-b-2 border-gray-300 dark:border-dark-border sticky top-0 z-10 shadow-sm">
              <div className="px-5 py-4 flex items-center">
                <div className="w-5 h-5"></div>
              </div>
              <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-text-secondary flex items-center gap-2 transition-colors duration-200">
                <FiPackage className="w-4 h-4" />
                Package Name
              </div>
              <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-text-secondary flex items-center gap-2 transition-colors duration-200">
                <FiPackage className="w-4 h-4" />
                App Name
              </div>
              <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-text-secondary transition-colors duration-200">
                Safety Level
              </div>
            </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-4 py-16 text-center animate-fade-in">
              <FiPackage className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-float" />
              <p className="text-base font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">No packages found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 transition-colors duration-200">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((pkg, index) => (
              <div key={pkg.packageName} className="animate-fade-in" style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}>
                {/* Mobile Card View (below sm breakpoint) */}
                <div
                  className="sm:hidden border-b border-gray-200 dark:border-dark-border p-4 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 active:bg-primary-100/50 dark:active:bg-primary-500/10 active:scale-[0.99] cursor-pointer transition-all duration-200"
                  onClick={() => setDetailPackage(pkg)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedPackages.has(pkg.packageName)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(pkg.packageName);
                        }}
                        className="checkbox-modern"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-text-primary mb-1.5 flex items-center gap-2 transition-colors duration-200">
                        <FiPackage className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                        {pkg.appName}
                      </div>
                      <div className="text-xs font-mono text-gray-500 dark:text-text-tertiary mb-2 bg-gray-100 dark:bg-dark-bg px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-dark-border transition-all duration-200">
                        {pkg.packageName}
                      </div>
                      <span className={getSafetyStyles(pkg.safetyLevel)}>
                        {getSafetyIcon(pkg.safetyLevel)} {pkg.safetyLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop Table View (sm and above) */}
                <div
                  className="hidden sm:grid grid-cols-[56px_2fr_2fr_160px] border-b border-gray-200 dark:border-dark-border hover:bg-primary-50/50 dark:hover:bg-primary-500/5 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.99] cursor-pointer transition-all duration-200 group"
                  onClick={() => setDetailPackage(pkg)}
                >
                  <div className="px-5 py-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPackages.has(pkg.packageName)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(pkg.packageName);
                      }}
                      className="checkbox-modern"
                    />
                  </div>
                  <div className="px-4 py-4 text-sm font-mono text-gray-700 dark:text-text-secondary truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 font-medium">
                    {pkg.packageName}
                  </div>
                  <div className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-text-primary truncate flex items-center gap-2.5 transition-colors duration-200">
                    <FiPackage className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    {pkg.appName}
                  </div>
                  <div className="px-4 py-4 text-sm">
                    <span className={getSafetyStyles(pkg.safetyLevel)}>
                      {getSafetyIcon(pkg.safetyLevel)} {pkg.safetyLevel}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      )}

      {/* Modal for package details */}
      {detailPackage && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setDetailPackage(null)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-2xl shadow-soft-xl border-2 border-gray-300 dark:border-dark-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
                  <FiInfo className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-text-primary">
                  Package Details
                </h4>
              </div>
              <button
                onClick={() => setDetailPackage(null)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-all duration-200 group"
                aria-label="Close dialog"
              >
                <FiX className="w-5 h-5 text-gray-500 dark:text-text-secondary group-hover:text-danger-500 dark:group-hover:text-danger-400 transition-colors" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="space-y-4">
              {/* Package Name */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-card rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-text-tertiary uppercase tracking-wider mb-3">
                  <FiPackage className="w-4 h-4" />
                  Package Name
                </div>
                <div className="font-mono text-sm font-semibold text-gray-900 dark:text-text-primary break-all bg-white dark:bg-dark-bg px-4 py-3 rounded-lg border border-gray-200 dark:border-dark-border shadow-inner-soft">
                  {detailPackage.packageName}
                </div>
              </div>
              
              {/* App Name */}
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-500/10 dark:to-primary-500/5 rounded-xl border-2 border-primary-200 dark:border-primary-500/30 hover:border-primary-300 dark:hover:border-primary-500/50 transition-all duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider mb-3">
                  <FiPackage className="w-4 h-4" />
                  Application Name
                </div>
                <div className="text-base font-bold text-gray-900 dark:text-text-primary">
                  {detailPackage.appName}
                </div>
              </div>
              
              {/* Safety Level */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-500/5 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3">
                  {getSafetyIcon(detailPackage.safetyLevel)}
                  Safety Level
                </div>
                <span className={getSafetyStyles(detailPackage.safetyLevel)}>
                  {getSafetyIcon(detailPackage.safetyLevel)} {detailPackage.safetyLevel}
                </span>
              </div>
            </div>
            
            {/* Modal Footer */}
            <button
              type="button"
              onClick={() => setDetailPackage(null)}
              className="mt-6 w-full btn-secondary text-sm font-semibold"        
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageList;