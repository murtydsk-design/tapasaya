import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRpg } from '../hooks/useRpg';
import { useTheme } from '../hooks/useTheme';
import { LogoutModal } from './LogoutModal';
import { Avatar } from './Avatar';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { character } = useRpg();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const gold = character?.gold ?? 0;
  const level = character?.level ?? 1;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

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

        {/* Quick Player Stat Bar & Theme Toggle & Profile Dropdown */}
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

          {/* Dynamic User Profile Dropdown */}
          {user?.name && (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-controls="user-profile-dropdown"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: dropdownOpen ? 'var(--badge-bg)' : 'transparent',
                  border: '1px solid',
                  borderColor: dropdownOpen ? 'var(--primary)' : 'transparent',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem 0.25rem 0.35rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Avatar user={user} size={28} />
                <span>{user.name}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: 'var(--text-muted)'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  id="user-profile-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 0.5rem)',
                    width: '190px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '0.35rem 0',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Avatar user={user} size={36} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.name}
                      </div>
                      {user.email && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--badge-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--rose)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--badge-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
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


