import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceMonitor } from '../hooks/useDeviceMonitor';
import { useTheme } from '../App';
import {
  FiSmartphone,
  FiRefreshCw,
  FiAlertCircle,
  FiCpu,
  FiHardDrive,
  FiBattery,
} from 'react-icons/fi';
import {
  staggerContainer,
  staggerItem,
} from '../utils/animations';

const DevicePanel: React.FC = () => {
  const { device, isConnected, loading, refresh } = useDeviceMonitor();
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  // Card style based on theme
  const cardStyle = {
    background: isLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
    border: isLightMode ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
  };

  // Card hover animation
  const cardHover = {
    rest: { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    hover: { 
      y: -4, 
      boxShadow: isLightMode 
        ? '0 12px 24px rgba(0,0,0,0.08)' 
        : '0 12px 24px rgba(0,0,0,0.2), 0 0 20px rgba(88,166,175,0.1)',
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <motion.div
      className="w-full"
      role="region"
      aria-label="Device panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header - Minimal */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2 rounded-lg transition-all duration-200" 
            style={{background: 'rgba(88, 166, 175, 0.10)'}}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSmartphone className="w-5 h-5" style={{color: 'var(--theme-accent)'}} />
          </motion.div>
          <div>
            <h3 className="text-base font-semibold" style={{color: 'var(--theme-text-primary)'}}>
              Device
            </h3>
            <motion.p 
              className="text-xs" 
              style={{color: 'var(--theme-text-secondary)'}}
              key={isConnected ? 'connected' : 'waiting'}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isConnected ? 'Connected' : 'Waiting...'}
            </motion.p>
          </div>
        </div>
        
        {/* Connection Status Indicator */}
        <AnimatePresence mode="wait">
          <motion.div 
            className="relative"
            key={isConnected ? 'active' : 'offline'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {isConnected ? (
              <motion.div 
                className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium" 
                style={{
                  background: isLightMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.2)',
                  color: isLightMode ? '#059669' : '#34D399'
                }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Active</span>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium" 
                style={{
                  background: isLightMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.2)',
                  color: isLightMode ? '#991b1b' : '#fca5a5'
                }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Offline</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Device Information */}
      <div className="space-y-3">
        {loading ? (
          <motion.div 
            className="space-y-3" 
            aria-live="polite"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i} 
                className="p-4 rounded-lg"
                variants={staggerItem}
                style={{
                  ...cardStyle,
                }}
              >
                <div className="animate-pulse">
                  <div className="h-3 w-1/3 rounded mb-2" style={{background: isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}}></div>
                  <div className="h-4 w-2/3 rounded" style={{background: isLightMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : device ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {/* Device Name */}
            <motion.div 
              className="group p-4 rounded-lg cursor-pointer" 
              style={cardStyle}
              variants={staggerItem}
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <motion.div variants={cardHover}>
                <div className="flex items-center gap-3 mb-2">
                  <motion.div 
                    className="p-1.5 rounded-md" 
                    style={{
                      background: isLightMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)'
                    }}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiSmartphone className="w-4 h-4" style={{color: isLightMode ? '#2563eb' : '#60a5fa'}} />
                  </motion.div>
                  <span className="text-xs font-semibold uppercase tracking-wider transition-colors duration-200" style={{color: 'var(--theme-text-secondary)'}}>
                    Device Name
                  </span>
                </div>
                <div className="text-sm font-semibold ml-9 transition-colors duration-200" style={{color: 'var(--theme-text-primary)'}}>
                  {device.name}
                  {device.model && (
                    <span className="ml-2 font-normal" style={{color: 'var(--theme-text-secondary)'}}>
                      • {device.model}
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Android Version */}
            <motion.div 
              className="group p-4 rounded-lg cursor-pointer" 
              style={cardStyle}
              variants={staggerItem}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <motion.div 
                  className="p-1.5 rounded-md" 
                  style={{
                    background: isLightMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)'
                  }}
                  whileHover={{ scale: 1.15, rotate: -10 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <FiCpu className="w-4 h-4" style={{color: isLightMode ? '#059669' : '#34d399'}} />
                </motion.div>
                <span className="text-xs font-semibold uppercase tracking-wider transition-colors duration-200" style={{color: 'var(--theme-text-secondary)'}}>
                  Android Version
                </span>
              </div>
              <div className="text-sm font-semibold ml-9 transition-colors duration-200" style={{color: 'var(--theme-text-primary)'}}>
                {device.androidVersion}
              </div>
            </motion.div>

            {/* Battery */}
            {device.batteryPercentage != null && (
              <motion.div 
                className="group p-4 rounded-lg cursor-pointer" 
                style={cardStyle}
                variants={staggerItem}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div 
                    className="p-1.5 rounded-md" 
                    style={{
                      background: isLightMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.15)'
                    }}
                    whileHover={{ scale: 1.15 }}
                    animate={device.batteryPercentage <= 20 ? { 
                      scale: [1, 1.1, 1],
                      transition: { duration: 1, repeat: Infinity }
                    } : {}}
                  >
                    <FiBattery className="w-4 h-4" style={{color: isLightMode ? '#d97706' : '#fbbf24'}} />
                  </motion.div>
                  <span className="text-xs font-semibold uppercase tracking-wider transition-colors duration-200" style={{color: 'var(--theme-text-secondary)'}}>
                    Battery
                  </span>
                </div>
                <div className="ml-9">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background: isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}}>
                      <motion.div
                        className={`h-full rounded-full ${
                          device.batteryPercentage > 50 ? 'bg-emerald-500' :
                          device.batteryPercentage > 20 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${device.batteryPercentage}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <motion.span 
                      className="text-sm font-semibold min-w-[3ch] transition-colors duration-200" 
                      style={{color: 'var(--theme-text-primary)'}}
                      key={device.batteryPercentage}
                      initial={{ scale: 1.2, color: 'var(--theme-accent)' }}
                      animate={{ scale: 1, color: 'var(--theme-text-primary)' }}
                      transition={{ duration: 0.3 }}
                    >
                      {device.batteryPercentage}%
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Storage */}
            {device.storageAvailable && (
              <motion.div 
                className="group p-4 rounded-lg cursor-pointer" 
                style={cardStyle}
                variants={staggerItem}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div 
                    className="p-1.5 rounded-md" 
                    style={{
                      background: isLightMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)'
                    }}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiHardDrive className="w-4 h-4" style={{color: isLightMode ? '#2563eb' : '#60a5fa'}} />
                  </motion.div>
                  <span className="text-xs font-semibold uppercase tracking-wider transition-colors duration-200" style={{color: 'var(--theme-text-secondary)'}}>
                    Storage Available
                  </span>
                </div>
                <div className="text-sm font-semibold ml-9 transition-colors duration-200" style={{color: 'var(--theme-text-primary)'}}>
                  {device.storageAvailable}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div 
              className="inline-flex p-4 rounded-full mb-4" 
              style={{background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FiAlertCircle className="w-12 h-12" style={{color: 'var(--theme-text-secondary)'}} />
            </motion.div>
            <p className="text-sm font-medium mb-1 transition-colors duration-200" style={{color: 'var(--theme-text-secondary)'}}>
              No Device Connected
            </p>
            <p className="text-xs transition-colors duration-200" style={{color: 'var(--theme-text-secondary)', opacity: 0.7}}>
              Connect your Android device via USB with debugging enabled
            </p>
          </motion.div>
        )}
      </div>

      {/* Refresh Button */}
      <motion.button
        type="button"
        onClick={refresh}
        disabled={loading}
        className="mt-6 w-full btn-primary text-sm flex items-center justify-center gap-2 group disabled:hover:translate-y-0 overflow-hidden relative"
        whileHover={{ 
          scale: 1.02, 
          y: -2,
          boxShadow: '0 8px 25px rgba(46, 196, 182, 0.3)'
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 55%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
          initial={{ backgroundPosition: '200% 0' }}
          whileHover={{ 
            backgroundPosition: '-200% 0',
            transition: { duration: 0.6, ease: 'easeInOut' }
          }}
        />
        <motion.div
          className="relative z-10"
          animate={loading ? { rotate: 360 } : { rotate: 0 }}
          transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
          whileHover={!loading ? { rotate: 180, scale: 1.1 } : {}}
        >
          <FiRefreshCw className="w-4 h-4" />
        </motion.div>
        <span className="relative z-10 transition-all duration-200">{loading ? 'Refreshing...' : 'Refresh Device Info'}</span>
      </motion.button>
    </motion.div>
  );
};

export default DevicePanel;
