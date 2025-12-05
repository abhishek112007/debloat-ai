import { useState, useEffect } from 'react';
import { ThemeName, THEMES, applyTheme } from '../utils/themes';

interface UseThemeReturn {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isDark: boolean;
  toggle: () => void;
  availableThemes: ThemeName[];
}

const STORAGE_KEY = 'theme-preference';

// Get initial theme with memoization
const getInitialTheme = (): ThemeName => {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  if (stored && THEMES[stored]) return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Unified theme hook - replaces both useDarkMode and ThemeContext
 * Reduces bundle size by consolidating theme logic
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    requestAnimationFrame(() => applyTheme(theme));
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    setTheme: setThemeState,
    isDark: theme === 'dark',
    toggle: () => setThemeState(prev => prev === 'light' ? 'dark' : 'light'),
    availableThemes: Object.keys(THEMES) as ThemeName[],
  };
}

// Deprecated: Use useTheme instead
export const useDarkMode = useTheme;

export default useTheme;
