import React, { useState, useEffect } from 'react';

export const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError('Unable to log out. Please try again.');
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'var(--glass-backdrop)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2
            id="logout-dialog-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: 0
            }}
          >
            Log out?
          </h2>
          <p
            id="logout-dialog-desc"
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
              margin: 0
            }}
          >
            Are you sure you want to log out? You'll need to sign in again to access your quests and progress.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--rose)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="btn-danger"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
