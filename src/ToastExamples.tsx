import React, { useState } from 'react';
import { useToast } from './useToast';

/**
 * Example component demonstrating how to use the Toast notification system
 */
const ToastExamples: React.FC = () => {
  const { showToast, ToastContainer } = useToast();

  const handleSuccess = () => {
    showToast({
      message: '✅ Operation completed successfully!',
      type: 'success',
      duration: 5000,
    });
  };

  const handleError = () => {
    showToast({
      message: '❌ An error occurred. Please try again.',
      type: 'error',
      duration: 6000,
    });
  };

  const handleWarning = () => {
    showToast({
      message: '⚠️ This action requires confirmation.',
      type: 'warning',
      duration: 4000,
    });
  };

  const handleInfo = () => {
    showToast({
      message: 'ℹ️ New updates are available.',
      type: 'info',
      duration: 5000,
    });
  };

  const handleMultiple = () => {
    showToast({ message: 'First notification', type: 'info' });
    setTimeout(() => {
      showToast({ message: 'Second notification', type: 'success' });
    }, 500);
    setTimeout(() => {
      showToast({ message: 'Third notification', type: 'warning' });
    }, 1000);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Toast Notification Examples</h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
        >
          Show Success Toast
        </button>

        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
        >
          Show Error Toast
        </button>

        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700"
        >
          Show Warning Toast
        </button>

        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Show Info Toast
        </button>

        <button
          onClick={handleMultiple}
          className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 col-span-2"
        >
          Show Multiple Toasts
        </button>
      </div>

      {/* Toast Container - REQUIRED */}
      <ToastContainer />
    </div>
  );
};

export default ToastExamples;
