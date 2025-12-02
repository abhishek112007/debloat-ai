import React, { useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastItem extends ToastConfig {
  id: number;
}

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = toastIdCounter++;
    const newToast: ToastItem = {
      id,
      message: config.message,
      type: config.type,
      duration: config.duration,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer: React.FC = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            marginBottom: index < toasts.length - 1 ? '8px' : '0',
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer,
  };
};
