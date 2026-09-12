import React, { useState, useEffect, useRef } from 'react';
import { PRESET_AVATARS } from '../utils/avatarUtils';

export const AvatarModal = ({ isOpen, onClose, onSave, user }) => {
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'custom' | 'google'
  const [selectedPresetId, setSelectedPresetId] = useState('avatar_01');
  const [customFile, setCustomFile] = useState(null);
  const [customPreviewUrl, setCustomPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const hasGooglePhoto = !!user?.avatar?.googleUrl;

  useEffect(() => {
    if (isOpen && user) {
      const type = user.avatar?.type || 'preset';
      if (type === 'custom') {
        setActiveTab('custom');
      } else if (type === 'google' && hasGooglePhoto) {
        setActiveTab('google');
      } else {
        setActiveTab('preset');
      }
      setSelectedPresetId(user.avatar?.id || 'avatar_01');
      setCustomFile(null);
      setCustomPreviewUrl(null);
      setSaving(false);
      setError(null);
    }
  }, [isOpen, user, hasGooglePhoto]);

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setError('Please choose an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Please choose a smaller image.');
      return;
    }

    setCustomFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCustomPreviewUrl(objectUrl);
    setActiveTab('custom');
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      if (activeTab === 'custom') {
        if (customFile) {
          const formData = new FormData();
          formData.append('file', customFile);
          await onSave(formData);
        } else if (user?.avatar?.customUrl) {
          await onSave('custom');
        } else {
          setError('Please select a photo first.');
          setSaving(false);
          return;
        }
      } else if (activeTab === 'google') {
        await onSave('google');
      } else {
        await onSave('preset', selectedPresetId);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to save profile picture. Please try again.');
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
        background: 'rgba(0, 0, 0, 0.7)',
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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
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
        {/* Header */}
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
            Choose your profile picture
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

        {/* Error Notice */}
        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--rose)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.5rem'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'preset' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'preset' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            TAPASYA Avatars
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'custom' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'custom' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Your Photo
          </button>

          {hasGooglePhoto && (
            <button
              type="button"
              onClick={() => setActiveTab('google')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'google' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'google' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Google Photo
            </button>
          )}
        </div>

        {/* Tab 1: TAPASYA Avatars Grid (24 Official PNG Avatars) */}
        {activeTab === 'preset' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
                gap: '0.75rem',
                maxHeight: '340px',
                overflowY: 'auto',
                paddingRight: '0.25rem'
              }}
            >
              {PRESET_AVATARS.map((avatar) => {
                const isSelected = selectedPresetId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedPresetId(avatar.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? 'var(--gold)' : 'transparent'}`,
                      background: isSelected ? 'var(--badge-bg)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      boxShadow: isSelected ? '0 0 0 2px rgba(245, 158, 11, 0.4)' : 'none'
                    }}
                    title={avatar.name}
                  >
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--border-color)'}`,
                        background: 'var(--badge-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Your Photo (Upload Device Photo) */}
        {activeTab === 'custom' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem 1rem',
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--badge-bg)',
              gap: '1rem',
              textAlign: 'center'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
            />

            {(customPreviewUrl || user?.avatar?.customUrl) ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid var(--primary)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  <img
                    src={customPreviewUrl || (user.avatar.customUrl.startsWith('http') ? user.avatar.customUrl : `http://localhost:5000${user.avatar.customUrl}`)}
                    alt="Photo Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {customFile && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {customFile.name} ({(customFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1.15rem' }}
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Select an image file from your device (JPG, PNG, WEBP — Max 5MB)
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  style={{ fontSize: '0.875rem', padding: '0.55rem 1.5rem' }}
                >
                  Choose Photo
                </button>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Google Photo (If Available) */}
        {activeTab === 'google' && hasGooglePhoto && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.5rem',
              background: 'var(--badge-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--primary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <img
                src={user.avatar.googleUrl}
                alt="Google Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Verified Google Profile Photo
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Use your official Google account picture
              </div>
            </div>
          </div>
        )}

        {/* Actions Footer */}
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
            style={{ padding: '0.55rem 1.5rem', fontSize: '0.875rem' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
