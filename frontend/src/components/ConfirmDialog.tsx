import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, modalContent } from '../utils/animations';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  isDangerous?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  isDangerous = false,
}) => {
  const [showLearnMore, setShowLearnMore] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  // Reset "Learn more" state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setShowLearnMore(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 w-full max-w-md p-6 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
        {/* Title */}
        <h2
          id="dialog-title"
          className={
            'text-xl font-semibold mb-4 ' +
            (isDangerous
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-900 dark:text-white')
          }
        >
          {title}
        </h2>

        {/* Message */}
        <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Learn More Section (Collapsible) */}
        {isDangerous && (
          <div className="mb-6">
            <button
              onClick={() => setShowLearnMore(!showLearnMore)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              {showLearnMore ? '▼' : '▶'} Learn more
            </button>

            {showLearnMore && (
              <motion.div 
                className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                  <strong>⚠️ Warning:</strong> This action may affect system
                  functionality. Removing critical packages can cause:
                </p>
                <ul className="mt-2 ml-4 text-sm text-red-800 dark:text-red-200 list-disc space-y-1">
                  <li>Loss of important features</li>
                  <li>App crashes or instability</li>
                  <li>Difficulty reinstalling</li>
                  <li>Potential bootloop or soft-brick</li>
                </ul>
                <p className="mt-3 text-sm text-red-800 dark:text-red-200">
                  Only proceed if you understand the risks and have a backup.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {/* Cancel Button */}
          <motion.button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-base focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-lg"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          >
            Cancel
          </motion.button>

          {/* Confirm Button */}
          <motion.button
            onClick={onConfirm}
            className={
              'px-5 py-2.5 border font-medium text-base focus:outline-none focus:ring-2 rounded-lg ' +
              (isDangerous
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-500'
                : 'bg-green-600 hover:bg-green-700 text-white border-green-600 focus:ring-green-500')
            }
            whileHover={{ 
              scale: 1.02, 
              y: -1,
              boxShadow: isDangerous 
                ? '0 8px 20px rgba(239, 68, 68, 0.3)'
                : '0 8px 20px rgba(34, 197, 94, 0.3)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          >
            Confirm
          </motion.button>
        </div>

        {/* ESC hint */}
        <motion.p 
          className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Press ESC to cancel
        </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
