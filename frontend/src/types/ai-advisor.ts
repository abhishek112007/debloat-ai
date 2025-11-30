// TypeScript interfaces for AI Package Analysis

export interface PackageAnalysis {
  packageName: string;
  summary: string;
  purpose: string;
  dependencies: string[];
  safeToRemove: boolean;
  riskCategory: 'Safe' | 'Caution' | 'Expert' | 'Dangerous';
  consequences: string[];
  userReports: string[];
  technicalDetails: string;
  bestCase: string;
  worstCase: string;
}

export interface AnalysisState {
  loading: boolean;
  error: string | null;
  data: PackageAnalysis | null;
}
