import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRpg } from '../hooks/useRpg';
import { useTheme } from '../hooks/useTheme';
import { LogoutModal } from './LogoutModal';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { character } = useRpg();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const gold = character?.gold ?? 0;
  const level = character?.level ?? 1;

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <header style={{
        background: 'var(--bg-nav)',
        backdropFilter: 'var(--glass-backdrop)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              TAPASYA
            </span>
          </NavLink>
        </div>

        {/* Quick Player Stat Bar & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--badge-bg)',
            border: '1px solid var(--border-color)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            color: 'var(--gold)',
            fontSize: '0.85rem'
          }}>
            <span>{gold} Gold</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--badge-bg)',
            border: '1px solid var(--border-color)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            color: 'var(--primary)',
            fontSize: '0.85rem'
          }}>
            <span>Level {level}</span>
          </div>

          {/* Theme Toggle Switch */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            <span style={{ fontSize: '0.8rem' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user?.name && (
              <NavLink to="/profile" style={{ textDecoration: 'none', fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }} title="View Profile">
                {user.name}
              </NavLink>
            )}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Navbar;


