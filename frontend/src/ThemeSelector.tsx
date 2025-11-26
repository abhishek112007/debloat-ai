import React from 'react';
import { useTheme } from './App';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="px-4 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
      style={{borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-card)', color: 'var(--theme-text-primary)'}}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeSelector;
