import React, { useState, useEffect } from 'react';
import { PRESET_AVATARS } from '../utils/avatarUtils';

export const AvatarModal = ({ isOpen, onClose, onSave, user }) => {
  const [selectedType, setSelectedType] = useState('preset');
  const [selectedId, setSelectedId] = useState('avatar_01');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setSelectedType(user.avatar?.type || 'preset');
      setSelectedId(user.avatar?.id || 'avatar_01');
      setSaving(false);
      setError(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const hasGooglePhoto = !!user?.avatar?.googleUrl;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(selectedType, selectedId);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to save avatar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saving) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title"
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
          maxWidth: '460px',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2
            id="avatar-modal-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: 0
            }}
          >
            Choose your avatar
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem'
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
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

        {/* Google Photo Option (If Available) */}
        {hasGooglePhoto && (
          <div
            onClick={() => setSelectedType('google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${selectedType === 'google' ? 'var(--primary)' : 'var(--border-color)'}`,
              background: selectedType === 'google' ? 'var(--badge-bg)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src={user.avatar.googleUrl}
              alt="Google Profile"
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Google Profile Picture
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Use verified photo from your Google account
              </div>
            </div>
            {selectedType === 'google' && (
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>✓ Selected</span>
            )}
          </div>
        )}

        {/* TAPASYA Preset Avatars Section */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            TAPASYA Built-in Avatars
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.85rem'
            }}
          >
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = selectedType === 'preset' && selectedId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    setSelectedType('preset');
                    setSelectedId(avatar.id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.6rem 0.3rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: isSelected ? 'var(--badge-bg)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: avatar.bgGradient,
                      border: `1.5px solid ${avatar.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.35rem'
                    }}
                  >
                    {avatar.renderIcon('#ffffff')}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ padding: '0.55rem 1.4rem', fontSize: '0.875rem' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
