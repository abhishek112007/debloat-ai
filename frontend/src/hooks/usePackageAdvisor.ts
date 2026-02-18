import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { AnalysisState } from '../types/ai-advisor';

/**
 * React hook for analyzing Android packages using AI
 * 
 * @param packageName - The Android package name to analyze (e.g., "com.miui.analytics")
 * @returns AnalysisState with loading, error, and data properties
 * 
 * @example
 * const { loading, error, data, refetch } = usePackageAdvisor("com.miui.analytics");
 */
export function usePackageAdvisor(packageName: string | null) {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    error: null,
    data: null,
  });

  const analyze = useCallback(async (pkgName: string) => {
    setState({ loading: true, error: null, data: null });

    try {
      const result = await api.analyzePackage(pkgName);

      setState({ loading: false, error: null, data: result });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setState({ loading: false, error: errorMessage, data: null });
    }
  }, []);

  useEffect(() => {
    if (packageName) {
      analyze(packageName);
    } else {
      setState({ loading: false, error: null, data: null });
    }
  }, [packageName, analyze]);

  const refetch = useCallback(() => {
    if (packageName) {
      analyze(packageName);
    }
  }, [packageName, analyze]);

  return {
    ...state,
    refetch,
  };
}
