/**
 * SystemHealthPanel Component
 * 
 * Real-time Android device health monitoring dashboard.
 * Displays storage, memory, CPU, services, battery drainers, and thermal status.
 * 
 * Features:
 * - Responsive grid layout (2-4 columns)
 * - Animated progress bars with Framer Motion
 * - Color-coded health indicators (green/yellow/red)
 * - Skeleton loading states
 * - Auto-refresh with "Updated X seconds ago"
 * - Glassmorphic design matching app theme
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../App';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { useDeviceMonitor } from '../hooks/useDeviceMonitor';
import {
  getStorageHealthLevel,
  getMemoryHealthLevel,
  getCpuHealthLevel,
  getThermalHealthLevel,
  HealthLevel,
} from '../types/system-health';
import {
  FiHardDrive,
  FiCpu,
  FiActivity,
  FiServer,
  FiBattery,
  FiThermometer,
  FiPackage,
  FiRefreshCw,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

// ===== Health Color Utils =====

const getHealthColor = (level: HealthLevel, isLightMode: boolean) => {
  switch (level) {
    case 'healthy':
      return {
        bg: isLightMode ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.15)',
        border: isLightMode ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.3)',
        text: '#22C55E',
        bar: 'linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)',
      };
    case 'warning':
      return {
        bg: isLightMode ? 'rgba(234, 179, 8, 0.12)' : 'rgba(234, 179, 8, 0.15)',
        border: isLightMode ? 'rgba(234, 179, 8, 0.25)' : 'rgba(234, 179, 8, 0.3)',
        text: '#EAB308',
        bar: 'linear-gradient(90deg, #EAB308 0%, #FACC15 100%)',
      };
    case 'critical':
      return {
        bg: isLightMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.15)',
        border: isLightMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.3)',
        text: '#EF4444',
        bar: 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)',
      };
  }
};

const getHealthIcon = (level: HealthLevel) => {
  switch (level) {
    case 'healthy':
      return <FiCheckCircle className="w-4 h-4" />;
    case 'warning':
      return <FiAlertTriangle className="w-4 h-4" />;
    case 'critical':
      return <FiAlertCircle className="w-4 h-4" />;
  }
};

// ===== Skeleton Components =====

const SkeletonCard: React.FC<{ isLightMode: boolean }> = ({ isLightMode }) => (
  <div
    className="rounded-xl p-4 animate-pulse"
    style={{
      background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
      border: isLightMode ? '1px solid rgba(0,0,0,0.05)' : 'none',
    }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-10 h-10 rounded-lg"
        style={{ background: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
      />
      <div className="flex-1">
        <div
          className="h-4 rounded w-20 mb-2"
          style={{ background: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
        />
        <div
          className="h-3 rounded w-32"
          style={{ background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)' }}
        />
      </div>
    </div>
    <div
      className="h-2 rounded-full w-full"
      style={{ background: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
    />
  </div>
);

// ===== Progress Bar Component =====

interface ProgressBarProps {
  value: number;
  healthLevel: HealthLevel;
  isLightMode: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, healthLevel, isLightMode, animated = true }) => {
  const colors = getHealthColor(healthLevel, isLightMode);
  
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{
        background: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: colors.bar }}
        initial={animated ? { width: 0 } : { width: `${value}%` }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
};

// ===== Metric Card Component =====

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle?: string;
  progress?: number;
  healthLevel: HealthLevel;
  isLightMode: boolean;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  icon,
  value,
  subtitle,
  progress,
  healthLevel,
  isLightMode,
  delay = 0,
}) => {
  const colors = getHealthColor(healthLevel, isLightMode);

  return (
    <motion.div
      className="rounded-xl p-4"
      style={{
        background: isLightMode
          ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: isLightMode ? '1px solid rgba(0,0,0,0.06)' : 'none',
        boxShadow: isLightMode
          ? '0 4px 16px rgba(0,0,0,0.04)'
          : '0 4px 16px rgba(0,0,0,0.2)',
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -2,
        boxShadow: isLightMode
          ? '0 8px 24px rgba(0,0,0,0.08)'
          : '0 8px 24px rgba(0,0,0,0.3)',
        transition: { duration: 0.2 },
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="p-2.5 rounded-lg"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
          }}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <span style={{ color: colors.text }}>{icon}</span>
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--theme-text-tertiary)' }}>
            {title}
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              className="text-lg font-bold"
              style={{ color: 'var(--theme-text-primary)' }}
              key={value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.span>
            <span style={{ color: colors.text }}>{getHealthIcon(healthLevel)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <ProgressBar value={progress} healthLevel={healthLevel} isLightMode={isLightMode} />
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="text-xs mt-2" style={{ color: 'var(--theme-text-tertiary)' }}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
};

// ===== Battery Drainers Card =====

interface BatteryDrainersCardProps {
  drainers: Array<{ app_name: string; package_name: string; usage_percent: number }>;
  isLightMode: boolean;
}

const BatteryDrainersCard: React.FC<BatteryDrainersCardProps> = ({ drainers, isLightMode }) => {
  if (drainers.length === 0) {
    return (
      <motion.div
        className="rounded-xl p-4 col-span-2"
        style={{
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.06)' : 'none',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2.5 rounded-lg"
            style={{
              background: isLightMode ? 'rgba(234, 179, 8, 0.12)' : 'rgba(234, 179, 8, 0.15)',
            }}
          >
            <FiBattery className="w-5 h-5" style={{ color: '#EAB308' }} />
          </div>
          <div className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            Top Battery Drainers
          </div>
        </div>
        <div className="text-sm text-center py-4" style={{ color: 'var(--theme-text-tertiary)' }}>
          No battery stats available
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-xl p-4 col-span-2"
      style={{
        background: isLightMode
          ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: isLightMode ? '1px solid rgba(0,0,0,0.06)' : 'none',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="p-2.5 rounded-lg"
          style={{
            background: isLightMode ? 'rgba(234, 179, 8, 0.12)' : 'rgba(234, 179, 8, 0.15)',
          }}
          whileHover={{ scale: 1.05 }}
        >
          <FiBattery className="w-5 h-5" style={{ color: '#EAB308' }} />
        </motion.div>
        <div className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
          Top Battery Drainers
        </div>
      </div>

      <div className="space-y-2">
        {drainers.map((drainer, index) => (
          <motion.div
            key={drainer.package_name}
            className="flex items-center gap-3 p-2 rounded-lg"
            style={{
              background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{
              background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: index === 0 ? '#EF4444' : index === 1 ? '#F97316' : '#EAB308',
                color: 'white',
              }}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--theme-text-primary)' }}>
                {drainer.app_name}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--theme-text-tertiary)' }}>
                {drainer.package_name}
              </div>
            </div>
            <div className="text-sm font-bold" style={{ color: 'var(--theme-accent)' }}>
              {drainer.usage_percent.toFixed(1)}%
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ===== Main Component =====

export const SystemHealthPanel: React.FC = () => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const { isConnected, deviceId } = useDeviceMonitor();

  const {
    health,
    loading,
    error,
    isComplete,
    secondsAgo,
    refresh,
  } = useSystemHealth({
    autoStart: true,
    deviceId,
    isConnected,
    refreshInterval: 5000,
  });

  // Calculate health levels
  const storageHealth = useMemo(() => getStorageHealthLevel(health.storage.usage_percent), [health.storage.usage_percent]);
  const memoryHealth = useMemo(() => getMemoryHealthLevel(health.memory.usage_percent), [health.memory.usage_percent]);
  const cpuHealth = useMemo(() => getCpuHealthLevel(health.cpu.usage_percent), [health.cpu.usage_percent]);
  const thermalHealth = useMemo(() => getThermalHealthLevel(health.thermal.status), [health.thermal.status]);

  // Format bytes
  const formatMB = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  // Not connected state
  if (!isConnected) {
    return (
      <motion.div
        className="glass-card-float p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <FiActivity className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            System Health
          </h3>
        </div>
        <div className="text-center py-8">
          <FiServer className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--theme-text-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            Connect a device to monitor system health
          </p>
        </div>
      </motion.div>
    );
  }

  // Loading skeleton
  if (!isComplete && loading) {
    return (
      <motion.div
        className="glass-card-float p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FiActivity className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
              System Health
            </h3>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
          </motion.div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} isLightMode={isLightMode} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        className="glass-card-float p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <FiActivity className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            System Health
          </h3>
        </div>
        <div
          className="rounded-lg p-4 flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <FiAlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
              Failed to fetch health data
            </p>
            <p className="text-xs" style={{ color: '#EF4444', opacity: 0.8 }}>
              {error}
            </p>
          </div>
          <motion.button
            onClick={refresh}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span whileHover={{ rotate: 180 }} transition={{ type: 'spring', stiffness: 300 }}>
              <FiRefreshCw className="w-3.5 h-3.5" />
            </motion.span>
            Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card-float p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiActivity className="w-5 h-5 text-accent" />
          </motion.div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
              System Health
            </h3>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--theme-text-tertiary)' }}>
              <FiClock className="w-3 h-3" />
              <span>Updated {secondsAgo}s ago</span>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <motion.button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-lg"
          style={{
            background: isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
            border: isLightMode ? '1px solid rgba(0,0,0,0.05)' : 'none',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title="Refresh health data"
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Storage */}
        <MetricCard
          title="Storage"
          icon={<FiHardDrive className="w-5 h-5" />}
          value={`${health.storage.usage_percent.toFixed(0)}%`}
          subtitle={`${formatMB(health.storage.used_mb)} / ${formatMB(health.storage.total_mb)}`}
          progress={health.storage.usage_percent}
          healthLevel={storageHealth}
          isLightMode={isLightMode}
          delay={0}
        />

        {/* Memory */}
        <MetricCard
          title="Memory"
          icon={<FiCpu className="w-5 h-5" />}
          value={`${health.memory.usage_percent.toFixed(0)}%`}
          subtitle={`${formatMB(health.memory.used_mb)} / ${formatMB(health.memory.total_mb)}`}
          progress={health.memory.usage_percent}
          healthLevel={memoryHealth}
          isLightMode={isLightMode}
          delay={0.05}
        />

        {/* CPU */}
        <MetricCard
          title="CPU Load"
          icon={<FiActivity className="w-5 h-5" />}
          value={`${health.cpu.usage_percent.toFixed(0)}%`}
          subtitle={`User: ${health.cpu.user_percent.toFixed(0)}% | Sys: ${health.cpu.system_percent.toFixed(0)}%`}
          progress={health.cpu.usage_percent}
          healthLevel={cpuHealth}
          isLightMode={isLightMode}
          delay={0.1}
        />

        {/* Thermal */}
        <MetricCard
          title="Thermal"
          icon={<FiThermometer className="w-5 h-5" />}
          value={health.thermal.temperature_c ? `${health.thermal.temperature_c.toFixed(0)}°C` : health.thermal.status}
          subtitle={health.thermal.throttling ? 'Throttling active' : 'Normal operation'}
          healthLevel={thermalHealth}
          isLightMode={isLightMode}
          delay={0.15}
        />

        {/* Services */}
        <MetricCard
          title="Services"
          icon={<FiServer className="w-5 h-5" />}
          value={`${health.services_count}`}
          subtitle="Running background services"
          healthLevel={health.services_count > 150 ? 'warning' : 'healthy'}
          isLightMode={isLightMode}
          delay={0.2}
        />

        {/* App Counts */}
        <MetricCard
          title="Apps"
          icon={<FiPackage className="w-5 h-5" />}
          value={`${health.app_counts.total_apps}`}
          subtitle={`System: ${health.app_counts.system_apps} | User: ${health.app_counts.user_apps}`}
          healthLevel="healthy"
          isLightMode={isLightMode}
          delay={0.25}
        />

        {/* Battery Drainers */}
        <BatteryDrainersCard drainers={health.battery_drainers} isLightMode={isLightMode} />
      </div>
    </motion.div>
  );
};

export default SystemHealthPanel;
