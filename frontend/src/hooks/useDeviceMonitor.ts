import { useState, useEffect } from 'react';
import { api, DeviceInfo } from '../utils/api';

/**
 * Hook to monitor device connection status
 * Returns current device info and connection status
 * Auto-refreshes every 3 seconds
 */
export const useDeviceMonitor = () => {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [previousDeviceId, setPreviousDeviceId] = useState<string | null>(null);

  const checkDevice = async () => {
    try {
      const res = await api.getDeviceInfo();
      const currentDeviceId = res?.name || null;
      
      // Detect device change (connect or disconnect)
      if (currentDeviceId !== previousDeviceId) {
        setPreviousDeviceId(currentDeviceId);
      }
      
      setDevice(res ?? null);
      setIsConnected(!!res);
    } catch (err) {
      console.error('Device check failed:', err);
      setDevice(null);
      setIsConnected(false);
      if (previousDeviceId !== null) {
        setPreviousDeviceId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check immediately
    checkDevice();

    // Auto-refresh every 3 seconds
    const interval = setInterval(checkDevice, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    device,
    isConnected,
    loading,
    deviceId: device?.name || null,
    refresh: checkDevice,
  };
};
