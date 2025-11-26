import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setIsVisible(false);
    // Wait for fade-out animation to complete
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
    <div
      className={`
        fixed bottom-4 right-4 min-w-[300px] max-w-[400px] px-4 py-3 border-2
        shadow-lg transition-all duration-300 ease-in-out z-50
        ${getTypeStyles()}
        ${isVisible && !isExiting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-lg font-bold mt-0.5">
          {getIcon()}
        </div>

        {/* Message */}
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {message}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-lg font-bold opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
