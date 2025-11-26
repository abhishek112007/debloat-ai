import React, { useEffect, useState } from 'react';

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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
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
              <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
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
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-base focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            className={
              'px-5 py-2.5 border font-medium text-base focus:outline-none focus:ring-2 ' +
              (isDangerous
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-500'
                : 'bg-green-600 hover:bg-green-700 text-white border-green-600 focus:ring-green-500')
            }
          >
            Confirm
          </button>
        </div>

        {/* ESC hint */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press ESC to cancel
        </p>
      </div>
    </div>
  );
};

export default ConfirmDialog;
