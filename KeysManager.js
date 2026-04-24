import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return { toasts, toast };
};

export const ToastContainer = ({ toasts }) => {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const colors = { success: '#4ade80', error: '#f87171', info: '#818cf8' };

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span style={{ color: colors[t.type], fontWeight: 700, flexShrink: 0 }}>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
