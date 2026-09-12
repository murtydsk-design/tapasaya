import React, { useEffect } from 'react';
import { useRpg } from '../hooks/useRpg';

export const ToastNotification = () => {
  const { toast, clearToast } = useRpg();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 400,
      background: isError ? '#991b1b' : isSuccess ? '#065f46' : '#3730a3',
      border: `1px solid ${isError ? '#f87171' : isSuccess ? '#34d399' : '#818cf8'}`,
      color: '#ffffff',
      padding: '0.75rem 1.15rem',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      maxWidth: '380px'
    }}>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={clearToast}
        style={{ background: 'transparent', color: '#ffffff', opacity: 0.8, fontSize: '0.9rem', padding: '0 0.25rem' }}
      >
        ✕
      </button>
    </div>
  );
};

export default ToastNotification;

