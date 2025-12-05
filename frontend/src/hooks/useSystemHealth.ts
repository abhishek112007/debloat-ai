/**
 * useSystemHealth Hook
 * 
 * High-performance hook for monitoring Android device system health.
 * Uses Tauri events for real-time updates without polling.
 * 
 * Features:
 * - Progressive loading (metrics appear as they're fetched)
 * - Automatic refresh with configurable interval
 * - "Last updated X seconds ago" tracking
 * - Error handling with retry capability
 * - Loading skeleton states
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { 
  SystemHealth, 
  HealthUpdateEvent,
} from '../types/system-health';

// ===== Default State =====

const DEFAULT_HEALTH: SystemHealth = {
  storage: { total_mb: 0, used_mb: 0, free_mb: 0, usage_percent: 0 },
  memory: { total_mb: 0, available_mb: 0, used_mb: 0, usage_percent: 0, buffers_mb: 0, cached_mb: 0 },
  cpu: { usage_percent: 0, user_percent: 0, system_percent: 0, idle_percent: 0 },
  services_count: 0,
  battery_drainers: [],
  thermal: { status: 'unknown', temperature_c: null, throttling: false },
  app_counts: { system_apps: 0, user_apps: 0, total_apps: 0 },
  timestamp: 0,
  device_id: '',
};

// ===== Hook Options =====

interface UseSystemHealthOptions {
  /** Auto-start monitoring when device connects */
  autoStart?: boolean;
  /** Refresh interval in milliseconds (default: 5000) */
  refreshInterval?: number;
  /** Device ID (from useDeviceMonitor) */
  deviceId?: string | null;
  /** Is device connected */
  isConnected?: boolean;
}

// ===== Hook State =====

interface SystemHealthState {
  health: SystemHealth;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  metricsLoaded: Set<string>;
  isComplete: boolean;
}

// ===== Hook Implementation =====

export function useSystemHealth(options: UseSystemHealthOptions = {}) {
  const {
    autoStart = true,
    refreshInterval = 5000,
    deviceId,
    isConnected = false,
  } = options;

  const [state, setState] = useState<SystemHealthState>({
    health: DEFAULT_HEALTH,
    loading: false,
    error: null,
    lastUpdated: 0,
    metricsLoaded: new Set(),
    isComplete: false,
  });

  const listenersRef = useRef<UnlistenFn[]>([]);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoringRef = useRef(false);

  // Calculate "X seconds ago"
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Update seconds ago every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.lastUpdated > 0) {
        setSecondsAgo(Math.floor((Date.now() - state.lastUpdated) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.lastUpdated]);

  // Cleanup listeners
  const cleanupListeners = useCallback(async () => {
    for (const unlisten of listenersRef.current) {
      await unlisten();
    }
    listenersRef.current = [];
  }, []);

  // Cleanup timer
  const cleanupTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Setup event listeners
  const setupListeners = useCallback(async () => {
    await cleanupListeners();

    // Listen for health updates
    const unlistenHealth = await listen<HealthUpdateEvent>('system_health_update', (event) => {
      const { health, metrics_updated, is_complete } = event.payload;

      setState(prev => ({
        ...prev,
        health,
        loading: !is_complete,
        lastUpdated: Date.now(),
        metricsLoaded: new Set([...prev.metricsLoaded, ...metrics_updated]),
        isComplete: is_complete,
        error: null,
      }));
    });

    listenersRef.current.push(unlistenHealth);
  }, [cleanupListeners]);

  // Fetch health data
  const fetchHealth = useCallback(async () => {
    if (!isConnected) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const health = await invoke<SystemHealth>('get_system_health');
      
      setState(prev => ({
        ...prev,
        health,
        loading: false,
        lastUpdated: Date.now(),
        isComplete: true,
        metricsLoaded: new Set(['storage', 'memory', 'cpu', 'services', 'battery', 'thermal', 'app_counts']),
      }));
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, [isConnected]);

  // Refresh (force fetch)
  const refresh = useCallback(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    if (isMonitoringRef.current || !isConnected) return;

    isMonitoringRef.current = true;
    await setupListeners();

    // Initial fetch
    await fetchHealth();

    // Setup periodic refresh
    cleanupTimer();
    refreshTimerRef.current = setInterval(() => {
      if (isConnected) {
        fetchHealth();
      }
    }, refreshInterval);
  }, [isConnected, setupListeners, fetchHealth, cleanupTimer, refreshInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    isMonitoringRef.current = false;
    cleanupTimer();
    await cleanupListeners();
    
    setState({
      health: DEFAULT_HEALTH,
      loading: false,
      error: null,
      lastUpdated: 0,
      metricsLoaded: new Set(),
      isComplete: false,
    });
  }, [cleanupTimer, cleanupListeners]);

  // Auto-start when device connects
  useEffect(() => {
    if (autoStart && isConnected && deviceId) {
      startMonitoring();
    } else if (!isConnected) {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [autoStart, isConnected, deviceId, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimer();
      cleanupListeners();
    };
  }, [cleanupTimer, cleanupListeners]);

  return {
    // Data
    health: state.health,
    
    // Status
    loading: state.loading,
    error: state.error,
    isComplete: state.isComplete,
    metricsLoaded: state.metricsLoaded,
    
    // Timing
    lastUpdated: state.lastUpdated,
    secondsAgo,
    
    // Actions
    refresh,
    startMonitoring,
    stopMonitoring,
  };
}

export default useSystemHealth;
