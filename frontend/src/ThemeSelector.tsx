import React, { useState } from 'react';
import { useTheme } from './App';
import { FiSun, FiMoon, FiZap } from 'react-icons/fi';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    setIsAnimating(true);
    
    // Create explosion effect
    const button = document.getElementById('theme-toggle-btn');
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create particles
      for (let i = 0; i < 20; i++) {
        createParticle(x, y, isDark);
      }
      
      // Create flash overlay
      createFlash();
    }
    
    // Toggle theme with delay for dramatic effect
    setTimeout(() => {
      setTheme(isDark ? 'light' : 'dark');
      setTimeout(() => setIsAnimating(false), 500);
    }, 300);
  };

  const createParticle = (x: number, y: number, isDark: boolean) => {
    const particle = document.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 100;
    const size = 4 + Math.random() * 8;
    
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    particle.style.background = isDark 
      ? `hsl(${Math.random() * 60 + 30}, 100%, 60%)` // Warm colors for light mode
      : `hsl(${Math.random() * 60 + 200}, 100%, 60%)`; // Cool colors for dark mode
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.boxShadow = '0 0 10px currentColor';
    
    document.body.appendChild(particle);
    
    const deltaX = Math.cos(angle) * velocity;
    const deltaY = Math.sin(angle) * velocity;
    
    particle.animate([
      { 
        transform: 'translate(0, 0) scale(1) rotate(0deg)', 
        opacity: 1 
      },
      { 
        transform: `translate(${deltaX}px, ${deltaY}px) scale(0) rotate(${Math.random() * 720}deg)`, 
        opacity: 0 
      }
    ], {
      duration: 800 + Math.random() * 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => particle.remove();
  };

  const createFlash = () => {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9998';
    
    document.body.appendChild(flash);
    
    flash.animate([
      { opacity: 0, transform: 'scale(0.5)' },
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(1.5)' }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => flash.remove();
  };

  return (
    <button 
      id="theme-toggle-btn"
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`
        relative px-4 py-2 text-sm font-medium border-2 rounded-lg 
        transition-all duration-300 shadow-lg hover:shadow-2xl 
        flex items-center gap-2 overflow-hidden group
        ${isAnimating ? 'scale-110 rotate-180' : 'hover:scale-105 hover:-rotate-3 active:scale-95'}
      `}
      style={{
        borderColor: 'var(--theme-border)', 
        backgroundColor: 'var(--theme-card)', 
        color: 'var(--theme-text-primary)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500
        ${isDark 
          ? 'from-yellow-400 via-orange-400 to-red-400' 
          : 'from-blue-600 via-purple-600 to-indigo-600'}
      `} />
      
      {/* Lightning bolts on hover */}
      <FiZap className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-20 h-20 text-yellow-400 opacity-0 
        group-hover:opacity-30 transition-all duration-300
        group-hover:scale-150 group-hover:rotate-12
        pointer-events-none
      `} />
      
      {/* Icon with crazy animations */}
      <div className={`
        relative z-10 transition-all duration-500
        ${isAnimating ? 'scale-150 rotate-[720deg]' : 'group-hover:rotate-[360deg] group-hover:scale-125'}
      `}>
        {isDark ? (
          <FiSun className={`
            w-4 h-4 
            ${isAnimating ? 'animate-spin text-yellow-400' : 'group-hover:animate-pulse'}
          `} />
        ) : (
          <FiMoon className={`
            w-4 h-4
            ${isAnimating ? 'animate-spin text-blue-400' : 'group-hover:animate-pulse'}
          `} />
        )}
      </div>
      
      {/* Text with slide animation */}
      <span className={`
        hidden sm:inline relative z-10 transition-all duration-300
        ${isAnimating ? 'opacity-0 translate-x-4' : 'group-hover:translate-x-1'}
      `}>
        {isDark ? 'Light' : 'Dark'}
      </span>
      
      {/* Ripple effect */}
      <div className={`
        absolute inset-0 rounded-lg bg-white dark:bg-gray-800
        opacity-0 group-active:opacity-30 
        transition-opacity duration-150
      `} />
    </button>
  );
};

export default ThemeSelector;
