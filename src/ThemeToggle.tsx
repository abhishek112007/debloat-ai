import React from 'react';
import { useDarkMode } from './useDarkMode';

/**
 * Example component showing how to use the useDarkMode hook
 */
export function ThemeToggle() {
  const { isDark, toggle, setTheme } = useDarkMode();

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Toggle button */}
      <button
        onClick={toggle}
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Direct theme setters */}
      <button
        onClick={() => setTheme('light')}
        disabled={!isDark}
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        ☀️ Light
      </button>

      <button
        onClick={() => setTheme('dark')}
        disabled={isDark}
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        🌙 Dark
      </button>

      {/* Current theme display */}
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Current: {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  );
}

/**
 * Example integration in main App component
 */
export function App() {
  const { isDark } = useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Android ADB Manager</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="p-6">
        <p>Theme is currently: {isDark ? 'Dark' : 'Light'}</p>
        {/* Your app content here */}
      </main>
    </div>
  );
}
