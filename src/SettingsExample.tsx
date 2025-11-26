import React from 'react';
import Settings from './Settings';

/**
 * Example showing how to integrate Settings component
 */
const SettingsExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <Settings />
    </div>
  );
};

export default SettingsExample;

/**
 * Example: Using settings in other components
 */

// Read settings from localStorage
export function getAppSettings() {
  try {
    const stored = localStorage.getItem('app-settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return null;
}

// Example: Apply auto-refresh based on settings
export function useAutoRefresh(callback: () => void) {
  React.useEffect(() => {
    const settings = getAppSettings();
    const interval = settings?.autoRefreshInterval || 0;

    if (interval > 0) {
      const timer = setInterval(callback, interval * 1000);
      return () => clearInterval(timer);
    }
  }, [callback]);
}

// Example usage in DevicePanel
/*
import { useAutoRefresh } from './SettingsExample';

const DevicePanel: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);

  const fetchDeviceInfo = async () => {
    const info = await invoke('get_device_info');
    setDeviceInfo(info);
  };

  // Auto-refresh based on settings
  useAutoRefresh(fetchDeviceInfo);

  useEffect(() => {
    fetchDeviceInfo();
  }, []);

  // ... rest of component
};
*/
