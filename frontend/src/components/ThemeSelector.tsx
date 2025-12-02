import React, { useState } from 'react';
import { useTheme } from '../App';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Create ripple effect from button center
    const button = document.getElementById('theme-toggle-btn');
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      createRipple(x, y, isDark);
    }
    
    // Switch theme with smooth timing
    setTimeout(() => {
      setTheme(isDark ? 'light' : 'dark');
    }, 200);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const createRipple = (x: number, y: number, isDark: boolean) => {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.background = isDark 
      ? 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(251, 146, 60, 0.2) 50%, transparent 100%)'
      : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 100%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';
    
    document.body.appendChild(ripple);
    
    ripple.animate([
      { 
        width: '20px',
        height: '20px',
        opacity: 1
      },
      { 
        width: '2000px',
        height: '2000px',
        opacity: 0
      }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => ripple.remove();
  };

  return (
    <button 
      id="theme-toggle-btn"
      onClick={toggleTheme}
      disabled={isAnimating}
      className="relative px-4 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 overflow-hidden group hover:-translate-y-0.5 active:scale-95"
      style={{
        borderColor: 'var(--theme-border)', 
        backgroundColor: 'var(--theme-card)', 
        color: 'var(--theme-text-primary)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon with smooth rotation */}
      <div className={`relative z-10 transition-all duration-300 ${isAnimating ? 'rotate-180 scale-110' : ''}`}>
        {isDark ? (
          <FiSun className="w-4 h-4" />
        ) : (
          <FiMoon className="w-4 h-4" />
        )}
      </div>
      
      {/* Text */}
      <span className="hidden sm:inline relative z-10 transition-opacity duration-200">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export default ThemeSelector;
