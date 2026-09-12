import React, { useState } from 'react';
import { getPresetAvatar } from '../utils/avatarUtils';

const SIZES = {
  sm: 28,
  md: 40,
  lg: 80,
  xl: 96
};

const BACKEND_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';

export const Avatar = ({ user, size = 'md', style = {}, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const dimension = typeof size === 'number' ? size : SIZES[size] || 40;

  const avatarInfo = user?.avatar || {};
  const preset = getPresetAvatar(avatarInfo.id || 'avatar_01');

  // Custom photo
  const rawCustomUrl = avatarInfo.customUrl || (avatarInfo.type === 'custom' ? avatarInfo.url : null);
  const customUrl = rawCustomUrl && !rawCustomUrl.startsWith('http') && !rawCustomUrl.startsWith('blob:')
    ? `${BACKEND_URL}${rawCustomUrl}`
    : rawCustomUrl;

  const isCustomType = avatarInfo.type === 'custom' && customUrl && !imgError;
  const isGoogleType = avatarInfo.type === 'google' && avatarInfo.googleUrl && !imgError;

  const photoSrc = isCustomType
    ? customUrl
    : (isGoogleType ? avatarInfo.googleUrl : preset.url);

  return (
    <div
      className={`avatar-circle ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        minWidth: `${dimension}px`,
        minHeight: `${dimension}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid var(--border-color)',
        background: 'var(--badge-bg)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        boxSizing: 'border-box',
        ...style
      }}
      title={user?.name || preset.name}
    >
      <img
        src={photoSrc}
        alt={user?.name || preset.name}
        onError={() => setImgError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
      />
    </div>
  );
};

export default Avatar;
