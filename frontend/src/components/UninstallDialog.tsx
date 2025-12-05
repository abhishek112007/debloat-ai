import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, modalContent } from '../utils/animations';

interface UninstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageCount: number;
  hasDangerous: boolean;
  hasExpert: boolean;
}

const UninstallDialog: React.FC<UninstallDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  packageCount,
  hasDangerous,
  hasExpert,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!confirmed && (hasDangerous || hasExpert)) {
      return; // Require checkbox for dangerous/expert packages
    }
    onConfirm();
    setConfirmed(false);
  };

  const handleClose = () => {
    onClose();
    setConfirmed(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Confirm Uninstallation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {packageCount} package{packageCount !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        {/* Warning Messages */}
        <div className="space-y-3 mb-6">
          {hasDangerous && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <div className="font-semibold text-red-800 dark:text-red-200 text-sm mb-1">
                    CRITICAL WARNING
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    You've selected <strong>DANGEROUS</strong> packages. Uninstalling these may
                    cause system instability, boot loops, or complete device failure. Only proceed
                    if you know exactly what you're doing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasExpert && !hasDangerous && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="font-semibold text-orange-800 dark:text-orange-200 text-sm mb-1">
                    Expert Level Warning
                  </div>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    You've selected <strong>EXPERT</strong> level packages. These may break
                    functionality or cause unexpected behavior. Proceed with caution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">
                  Important Information
                </div>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Uninstalled packages can usually be reinstalled from Play Store or APK</li>
                  <li>• Create a backup first if you're unsure</li>
                  <li>• Some system apps may reinstall on next device reboot</li>
                  <li>• You may need to restart your device after uninstalling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox (Required for dangerous/expert) */}
        {(hasDangerous || hasExpert) && (
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I understand the risks and want to proceed with uninstalling these packages
            </span>
          </label>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[44px] rounded-lg"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleConfirm}
            disabled={(hasDangerous || hasExpert) && !confirmed}
            className={`flex-1 px-4 py-2.5 text-white min-h-[44px] rounded-lg ${
              (hasDangerous || hasExpert) && !confirmed
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
            }`}
            whileHover={(hasDangerous || hasExpert) && !confirmed ? {} : { 
              scale: 1.02, 
              y: -1,
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
            }}
            whileTap={(hasDangerous || hasExpert) && !confirmed ? {} : { scale: 0.98 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          >
            {hasDangerous ? '🚨 Uninstall Anyway' : hasExpert ? '⚡ Uninstall' : 'Uninstall'}
          </motion.button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UninstallDialog;
