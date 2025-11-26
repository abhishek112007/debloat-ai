import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface UseDarkModeReturn {
  isDark: boolean;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'theme-preference';

/**
 * Custom hook for managing dark mode with localStorage persistence
 * 
 * Features:
 * - Persists theme preference to localStorage
 * - Defaults to system preference if no saved preference
 * - Updates HTML class for Tailwind dark mode
 * - Provides toggle and direct setter functions
 * 
 * @returns {UseDarkModeReturn} Object with isDark, toggle, and setTheme
 * 
 * @example
 * const { isDark, toggle, setTheme } = useDarkMode();
 * 
 * // Toggle theme
 * <button onClick={toggle}>Toggle Dark Mode</button>
 * 
 * // Set specific theme
 * <button onClick={() => setTheme('dark')}>Dark Mode</button>
 */
export function useDarkMode(): UseDarkModeReturn {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): Theme => {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme to document and localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes (optional: update if user hasn't set preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggle = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return {
    isDark: theme === 'dark',
    toggle,
    setTheme,
  };
}

export default useDarkMode;
