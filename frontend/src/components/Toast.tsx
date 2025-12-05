import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getTypeStyles = (): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-600 dark:border-green-500 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-600 dark:border-red-500 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-600 dark:border-orange-500 text-orange-800 dark:text-orange-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-600 dark:border-gray-500 text-gray-800 dark:text-gray-200';
    }
  };

  const getIconColor = (): string => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return '';
    }
  };

  const getIcon = (): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed bottom-4 right-4 min-w-[300px] max-w-[400px] px-4 py-3 border-2 rounded-xl
            shadow-lg backdrop-blur-sm z-50
            ${getTypeStyles()}
          `}
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ 
            type: 'spring' as const, 
            stiffness: 400, 
            damping: 25 
          }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
      <div className="flex items-start justify-between gap-3">
        {/* Icon with animation */}
        <motion.div 
          className={`flex-shrink-0 text-lg font-bold mt-0.5 ${getIconColor()}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.1 }}
        >
          {getIcon()}
        </motion.div>

        {/* Message */}
        <motion.div 
          className="flex-1 text-sm font-medium leading-relaxed"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {message}
        </motion.div>

        {/* Close Button */}
        <motion.button
          onClick={handleClose}
          className="flex-shrink-0 text-lg font-bold opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          ✕
        </motion.button>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
