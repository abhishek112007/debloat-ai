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
      className="flex items-center gap-2.5 px-3.5 py-1.5 text-sm font-medium"
      style={{
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
        background: 'transparent',
        color: 'var(--theme-text-primary)',
        cursor: 'pointer',
        borderRadius: '999px',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileHover={{
        y: -1,
        borderColor: isDark
          ? 'rgba(251, 191, 36, 0.5)'
          : 'rgba(99, 102, 241, 0.4)',
        boxShadow: isDark
          ? '0 0 12px rgba(251, 191, 36, 0.15)'
          : '0 0 12px rgba(99, 102, 241, 0.12)',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon */}
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center"
          >
            <FiSun className="w-4 h-4 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.4))' }} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center"
          >
            <FiMoon className="w-4 h-4 text-indigo-400" style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.4))' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isDark ? 'light' : 'dark'}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="hidden sm:inline text-xs font-semibold tracking-wide"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          {isDark ? 'Light' : 'Dark'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeSelector;
