/**
 * VirtualizedPackageList Component
 * 
 * High-performance virtualized list for rendering large package lists.
 * Only renders visible items + buffer, preventing DOM overload.
 * 
 * Features:
 * - Virtual scrolling (renders only ~20 items at a time)
 * - Smooth skeleton loading during stream
 * - Stable keys for efficient React reconciliation
 * - Integrated with usePackageStream hook
 * - Supports selection, search, and safety filtering
 */

import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTheme } from '../App';
import {
  FiPackage,
  FiAlertTriangle,
  FiCheckCircle,
  FiZap,
  FiXOctagon,
  FiInfo,
  FiLoader,
} from 'react-icons/fi';
import { StreamedPackage } from '../hooks/usePackageStream';

// ===== Types =====

type SafetyLevel = 'Safe' | 'Caution' | 'Expert' | 'Dangerous';

interface VirtualizedPackageListProps {
  packages: StreamedPackage[];
  loading: boolean;
  progress: number;
  statusMessage: string;
  selectedPackages: Set<string>;
  onToggleSelect: (packageName: string) => void;
  onPackageClick: (pkg: StreamedPackage) => void;
  onAiAdvisorOpen?: (packageName: string) => void;
  search: string;
  filterBySafety?: string | null;
}

// ===== Constants =====

const ITEM_HEIGHT = 72;
const OVERSCAN = 5;

// ===== Skeleton Loader =====

const PackageSkeleton: React.FC<{ isLightMode: boolean }> = ({ isLightMode }) => (
  <div 
    className="flex items-center gap-4 px-4 py-3 rounded-xl animate-pulse"
    style={{
      height: ITEM_HEIGHT,
      background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
    }}
  >
    <div 
      className="w-5 h-5 rounded"
      style={{ background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
    />
    <div className="flex-1 space-y-2">
      <div 
        className="h-4 rounded w-1/3"
        style={{ background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
      />
      <div 
        className="h-3 rounded w-2/3"
        style={{ background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
      />
    </div>
    <div 
      className="w-16 h-6 rounded-full"
      style={{ background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
    />
  </div>
);

// ===== Loading State Component =====

const LoadingState: React.FC<{ 
  isLightMode: boolean; 
  progress: number; 
  statusMessage: string;
  packagesLoaded: number;
}> = ({ isLightMode, progress, statusMessage, packagesLoaded }) => (
  <div className="space-y-4">
    {/* Progress Bar */}
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
          {statusMessage}
        </span>
        <span className="text-sm font-mono" style={{ color: 'var(--theme-accent)' }}>
          {packagesLoaded > 0 ? `${packagesLoaded} packages` : `${progress}%`}
        </span>
      </div>
      <div 
        className="h-2 rounded-full overflow-hidden"
        style={{ background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--theme-accent)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
    
    {/* Skeleton Items */}
    {[...Array(8)].map((_, i) => (
      <PackageSkeleton key={i} isLightMode={isLightMode} />
    ))}
  </div>
);

// ===== Package Row Component (Memoized) =====

interface PackageRowProps {
  pkg: StreamedPackage;
  isSelected: boolean;
  isLightMode: boolean;
  onToggleSelect: (packageName: string) => void;
  onPackageClick: (pkg: StreamedPackage) => void;
  onAiAdvisorOpen?: (packageName: string) => void;
  style: React.CSSProperties;
}

const PackageRow = React.memo<PackageRowProps>(({
  pkg,
  isSelected,
  isLightMode,
  onToggleSelect,
  onPackageClick,
  onAiAdvisorOpen,
  style,
}) => {
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
        return '';
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
    <div style={style}>
      <motion.div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
          isSelected ? 'ring-2 ring-accent' : ''
        }`}
        style={{
          height: ITEM_HEIGHT - 8,
          marginBottom: 8,
          background: isSelected
            ? isLightMode ? 'rgba(46, 196, 182, 0.08)' : 'rgba(88, 166, 175, 0.12)'
            : isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.04)' : 'none',
        }}
        onClick={() => onPackageClick(pkg)}
        whileHover={{ 
          scale: 1.005,
          background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
        }}
        whileTap={{ scale: 0.995 }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(pkg.packageName);
          }}
          className="w-4 h-4 rounded border-2 cursor-pointer accent-accent"
          style={{
            accentColor: 'var(--theme-accent)',
          }}
        />
        
        {/* Package Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FiPackage className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--theme-accent)' }} />
            <span 
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {pkg.appName}
            </span>
          </div>
          <div 
            className="text-xs font-mono truncate"
            style={{ color: 'var(--theme-text-tertiary)' }}
          >
            {pkg.packageName}
          </div>
        </div>
        
        {/* AI Advisor Button */}
        {onAiAdvisorOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAiAdvisorOpen(pkg.packageName);
            }}
            className="p-2 rounded-lg transition-all duration-150"
            style={{
              background: isLightMode ? 'rgba(46, 196, 182, 0.1)' : 'rgba(88, 166, 175, 0.1)',
            }}
            title="AI Safety Analysis"
          >
            <FiZap className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
          </button>
        )}
        
        {/* Safety Badge */}
        <span className={`${getSafetyStyles(pkg.safetyLevel as SafetyLevel)} flex items-center gap-1`}>
          {getSafetyIcon(pkg.safetyLevel as SafetyLevel)}
          <span className="hidden sm:inline">{pkg.safetyLevel}</span>
        </span>
      </motion.div>
    </div>
  );
});

PackageRow.displayName = 'PackageRow';

// ===== Main Component =====

export const VirtualizedPackageList: React.FC<VirtualizedPackageListProps> = ({
  packages,
  loading,
  progress,
  statusMessage,
  selectedPackages,
  onToggleSelect,
  onPackageClick,
  onAiAdvisorOpen,
  search,
  filterBySafety,
}) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Filter packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch = search === '' ||
        pkg.packageName.toLowerCase().includes(search.toLowerCase()) ||
        pkg.appName.toLowerCase().includes(search.toLowerCase());
      
      const matchesSafety = !filterBySafety || pkg.safetyLevel === filterBySafety;
      
      return matchesSearch && matchesSafety;
    });
  }, [packages, search, filterBySafety]);
  
  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: filteredPackages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERSCAN,
  });
  
  const virtualItems = virtualizer.getVirtualItems();
  
  // Show loading state
  if (loading && packages.length === 0) {
    return (
      <LoadingState 
        isLightMode={isLightMode}
        progress={progress}
        statusMessage={statusMessage}
        packagesLoaded={0}
      />
    );
  }
  
  // Empty state
  if (!loading && packages.length === 0) {
    return (
      <div className="text-center py-12">
        <FiPackage className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--theme-text-tertiary)' }} />
        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          No packages found
        </p>
      </div>
    );
  }
  
  // No results after filter
  if (filteredPackages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          No packages match your search
        </p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Loading overlay when streaming more packages */}
      {loading && packages.length > 0 && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-4 py-2 rounded-lg mb-2"
          style={{ background: isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }}
        >
          <FiLoader className="w-4 h-4 animate-spin" style={{ color: 'var(--theme-accent)' }} />
          <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            {statusMessage} ({packages.length} loaded)
          </span>
        </div>
      )}
      
      {/* Virtualized List Container */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: 'calc(100vh - 350px)',
          minHeight: '400px',
          maxHeight: '800px',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const pkg = filteredPackages[virtualItem.index];
            return (
              <PackageRow
                key={pkg.packageName}
                pkg={pkg}
                isSelected={selectedPackages.has(pkg.packageName)}
                isLightMode={isLightMode}
                onToggleSelect={onToggleSelect}
                onPackageClick={onPackageClick}
                onAiAdvisorOpen={onAiAdvisorOpen}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Stats Footer */}
      <div 
        className="mt-4 pt-4 flex items-center justify-between text-xs"
        style={{ 
          borderTop: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
          color: 'var(--theme-text-tertiary)',
        }}
      >
        <span>
          Showing {filteredPackages.length} of {packages.length} packages
        </span>
        <span>
          {selectedPackages.size} selected
        </span>
      </div>
    </div>
  );
};

export default VirtualizedPackageList;
