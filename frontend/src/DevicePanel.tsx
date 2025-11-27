import React from 'react';
import { useDeviceMonitor } from './useDeviceMonitor';
import {
  FiSmartphone,
  FiRefreshCw,
  FiAlertCircle,
  FiCpu,
  FiHardDrive,
  FiBattery,
} from 'react-icons/fi';

const DevicePanel: React.FC = () => {
  const { device, isConnected, loading, refresh } = useDeviceMonitor();

  return (
    <div
      className="w-full bg-white dark:bg-dark-card text-gray-800 dark:text-text-primary p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 animate-scale-in"
      role="region"
      aria-label="Device panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
            <FiSmartphone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-text-primary transition-colors duration-200">
              Device Status
            </h3>
            <p className="text-xs text-gray-500 dark:text-text-tertiary transition-colors duration-200">
              {isConnected ? 'ADB Connected' : 'Waiting for connection'}
            </p>
          </div>
        </div>
        
        {/* Connection Status Badge */}
        <div className="relative">
          <span
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105
              ${isConnected
                ? 'bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400 border-2 border-success-200 dark:border-success-500/30'
                : 'bg-danger-50 dark:bg-danger-500/10 text-danger-700 dark:text-danger-400 border-2 border-danger-200 dark:border-danger-500/30'
              }
            `}
            aria-live="polite"
          >
            {/* Status Dot with Pulse Animation */}
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-all duration-300 ${isConnected ? 'bg-success-500' : 'bg-danger-500'}`}></span>
            </span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Device Information */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3" aria-live="polite">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg animate-pulse" style={{animationDelay: `${i * 100}ms`}}>
                <div className="h-3 bg-gray-200 dark:bg-dark-border w-1/3 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 w-2/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : device ? (
          <>
            {/* Device Name */}
            <div className="group p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-slide-up">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 bg-primary-100 dark:bg-primary-500/10 rounded-md group-hover:scale-110 transition-transform duration-200">
                  <FiSmartphone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-text-tertiary uppercase tracking-wider transition-colors duration-200">
                  Device Name
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-text-primary ml-9 transition-colors duration-200">
                {device.name}
                {device.model && (
                  <span className="ml-2 text-gray-500 dark:text-text-secondary font-normal">
                    • {device.model}
                  </span>
                )}
              </div>
            </div>

            {/* Android Version */}
            <div className="group p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border hover:border-success-300 dark:hover:border-success-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-slide-up" style={{animationDelay: '100ms'}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 bg-success-100 dark:bg-success-500/10 rounded-md group-hover:scale-110 transition-transform duration-200">
                  <FiCpu className="w-4 h-4 text-success-600 dark:text-success-400" />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-text-tertiary uppercase tracking-wider transition-colors duration-200">
                  Android Version
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-text-primary ml-9 transition-colors duration-200">
                {device.androidVersion}
              </div>
            </div>

            {/* Battery */}
            {device.batteryPercentage != null && (
              <div className="group p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border hover:border-warning-300 dark:hover:border-warning-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-slide-up" style={{animationDelay: '200ms'}}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-warning-100 dark:bg-warning-500/10 rounded-md group-hover:scale-110 transition-transform duration-200">
                    <FiBattery className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-text-tertiary uppercase tracking-wider transition-colors duration-200">
                    Battery
                  </span>
                </div>
                <div className="ml-9">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          device.batteryPercentage > 50 ? 'bg-success-500' :
                          device.batteryPercentage > 20 ? 'bg-warning-500' : 'bg-danger-500'
                        }`}
                        style={{ width: `${device.batteryPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-text-primary min-w-[3ch] transition-colors duration-200">
                      {device.batteryPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Storage */}
            {device.storageAvailable && (
              <div className="group p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border hover:border-info-300 dark:hover:border-info-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-slide-up" style={{animationDelay: '300ms'}}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-info-100 dark:bg-info-500/10 rounded-md group-hover:scale-110 transition-transform duration-200">
                    <FiHardDrive className="w-4 h-4 text-info-600 dark:text-info-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-text-tertiary uppercase tracking-wider transition-colors duration-200">
                    Storage Available
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-text-primary ml-9 transition-colors duration-200">
                  {device.storageAvailable}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-dark-bg rounded-full mb-4 animate-float">
              <FiAlertCircle className="w-12 h-12 text-gray-400 dark:text-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-text-secondary mb-1 transition-colors duration-200">
              No Device Connected
            </p>
            <p className="text-xs text-gray-500 dark:text-text-tertiary transition-colors duration-200">
              Connect your Android device via USB with debugging enabled
            </p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <button
        type="button"
        onClick={refresh}
        disabled={loading}
        className="mt-6 w-full btn-primary text-sm flex items-center justify-center gap-2 group disabled:hover:translate-y-0"
      >
        <FiRefreshCw className={`w-4 h-4 transition-all duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180 group-active:rotate-90'}`} />
        <span className="transition-all duration-200">{loading ? 'Refreshing...' : 'Refresh Device Info'}</span>
      </button>
    </div>
  );
};

export default DevicePanel;
