import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Icon animation variants
  const iconVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 15
      }
    },
    exit: { 
      scale: 0, 
      rotate: 180, 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.button 
      id="theme-toggle-btn"
      onClick={toggleTheme}
      disabled={isAnimating}
      className="relative px-4 py-2 text-sm font-medium border-2 rounded-lg shadow-sm flex items-center gap-2 overflow-hidden group"
      style={{
        borderColor: 'var(--theme-border)', 
        backgroundColor: 'var(--theme-card)', 
        color: 'var(--theme-text-primary)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileHover={{ 
        scale: 1.03, 
        y: -2,
        boxShadow: isDark 
          ? '0 8px 20px rgba(0,0,0,0.3), 0 0 20px rgba(88,166,175,0.15)'
          : '0 8px 20px rgba(0,0,0,0.1), 0 0 20px rgba(46,196,182,0.15)'
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Icon with AnimatePresence for smooth transitions */}
      <motion.div 
        className="relative z-10 w-4 h-4"
        whileHover={{ scale: 1.2, rotate: 15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiSun className="w-4 h-4 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiMoon className="w-4 h-4 text-indigo-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Text with slide animation */}
      <span className="hidden sm:inline relative z-10">
        <AnimatePresence mode="wait">
          <motion.span
            key={isDark ? 'light' : 'dark'}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? 'Light' : 'Dark'}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.2) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        initial={{ backgroundPosition: '200% 0' }}
        whileHover={{ 
          backgroundPosition: '-200% 0',
          transition: { duration: 0.8, ease: 'easeInOut' }
        }}
      />
    </motion.button>
  );
};

export default ThemeSelector;
