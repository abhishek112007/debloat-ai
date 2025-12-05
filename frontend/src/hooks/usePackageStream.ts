/**
 * usePackageStream Hook
 * 
 * High-performance hook for streaming package data from Android devices.
 * Uses Tauri events to receive packages in chunks, preventing UI freezes.
 * 
 * Features:
 * - Chunked data streaming (30 packages per chunk)
 * - Automatic caching with 5-minute expiry
 * - Progress tracking for loading states
 * - Stable sorting for consistent rendering
 * - Memory-efficient incremental updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

// ===== Types =====

export interface StreamedPackage {
  packageName: string;
  appName: string;
  safetyLevel: 'Safe' | 'Caution' | 'Expert' | 'Dangerous';
}

interface PackageChunk {
  packages: StreamedPackage[];
  chunkIndex: number;
  totalSoFar: number;
  isFinal: boolean;
}

interface StreamProgress {
  status: string;
  packagesLoaded: number;
  isComplete: boolean;
  error: string | null;
}

interface StreamComplete {
  totalPackages: number;
  durationMs: number;
  fromCache: boolean;
}

interface PackageStreamState {
  packages: StreamedPackage[];
  loading: boolean;
  error: string | null;
  progress: number;
  statusMessage: string;
  fromCache: boolean;
  totalCount: number;
}

interface UsePackageStreamOptions {
  autoStart?: boolean;
  deviceId?: string | null;
  isConnected?: boolean;
}

// ===== Hook Implementation =====

export function usePackageStream(options: UsePackageStreamOptions = {}) {
  const { autoStart = true, deviceId, isConnected = false } = options;
  
  const [state, setState] = useState<PackageStreamState>({
    packages: [],
    loading: false,
    error: null,
    progress: 0,
    statusMessage: '',
    fromCache: false,
    totalCount: 0,
  });
  
  // Use ref to accumulate packages to avoid stale closure issues
  const packagesRef = useRef<Map<string, StreamedPackage>>(new Map());
  const listenersRef = useRef<UnlistenFn[]>([]);
  const isStreamingRef = useRef(false);
  
  // Cleanup listeners
  const cleanupListeners = useCallback(async () => {
    for (const unlisten of listenersRef.current) {
      await unlisten();
    }
    listenersRef.current = [];
  }, []);
  
  // Start streaming packages
  const startStream = useCallback(async (forceRefresh = false) => {
    if (isStreamingRef.current) return;
    
    isStreamingRef.current = true;
    packagesRef.current.clear();
    
    setState(prev => ({
      ...prev,
      packages: [],
      loading: true,
      error: null,
      progress: 0,
      statusMessage: 'Connecting to device...',
      fromCache: false,
      totalCount: 0,
    }));
    
    try {
      // Cleanup existing listeners
      await cleanupListeners();
      
      // Set up event listeners BEFORE starting the stream
      const chunkListener = await listen<PackageChunk>('package_chunk', (event) => {
        const { packages: newPackages, totalSoFar } = event.payload;
        
        // Add to map (deduplication)
        for (const pkg of newPackages) {
          packagesRef.current.set(pkg.packageName, pkg);
        }
        
        // Convert to sorted array
        const sortedPackages = Array.from(packagesRef.current.values())
          .sort((a, b) => a.packageName.localeCompare(b.packageName));
        
        setState(prev => ({
          ...prev,
          packages: sortedPackages,
          totalCount: totalSoFar,
          progress: Math.min(95, Math.round((totalSoFar / Math.max(totalSoFar + 50, 200)) * 100)),
        }));
      });
      
      const progressListener = await listen<StreamProgress>('package_stream_progress', (event) => {
        const { status, isComplete, error } = event.payload;
        
        setState(prev => ({
          ...prev,
          statusMessage: status,
          loading: !isComplete,
          error: error || prev.error,
          progress: isComplete ? 100 : prev.progress,
        }));
        
        if (isComplete) {
          isStreamingRef.current = false;
        }
      });
      
      const completeListener = await listen<StreamComplete>('package_stream_complete', (event) => {
        const { totalPackages, fromCache } = event.payload;
        
        // Final sort and update
        const sortedPackages = Array.from(packagesRef.current.values())
          .sort((a, b) => a.packageName.localeCompare(b.packageName));
        
        setState(prev => ({
          ...prev,
          packages: sortedPackages,
          loading: false,
          progress: 100,
          fromCache,
          totalCount: totalPackages,
          statusMessage: fromCache ? 'Loaded from cache' : 'Complete',
        }));
        
        isStreamingRef.current = false;
      });
      
      listenersRef.current = [chunkListener, progressListener, completeListener];
      
      // Start the stream
      await invoke('start_package_stream', { forceRefresh });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        statusMessage: 'Failed to load packages',
      }));
      isStreamingRef.current = false;
    }
  }, [cleanupListeners]);
  
  // Refresh packages (force fetch)
  const refresh = useCallback(() => {
    return startStream(true);
  }, [startStream]);
  
  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      await invoke('clear_package_cache');
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, []);
  
  // Auto-start when device connects
  useEffect(() => {
    if (autoStart && isConnected && deviceId) {
      startStream(false);
    }
    
    if (!isConnected) {
      // Clear packages when device disconnects
      packagesRef.current.clear();
      setState({
        packages: [],
        loading: false,
        error: null,
        progress: 0,
        statusMessage: '',
        fromCache: false,
        totalCount: 0,
      });
    }
    
    return () => {
      cleanupListeners();
    };
  }, [autoStart, isConnected, deviceId, startStream, cleanupListeners]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);
  
  return {
    ...state,
    startStream,
    refresh,
    clearCache,
    isStreaming: isStreamingRef.current,
  };
}

export default usePackageStream;
