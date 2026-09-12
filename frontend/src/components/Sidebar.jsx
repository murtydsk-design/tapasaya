import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/quests', label: 'Quests' },
    { path: '/character', label: 'Character' },
    { path: '/rewards', label: 'Rewards' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/profile', label: 'Profile' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: '220px',
        background: 'var(--bg-nav)',
        backdropFilter: 'var(--glass-backdrop)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
      }}>
        <div style={{ padding: '0 0.75rem 0.75rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          Navigation
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              background: isActive ? 'var(--badge-bg)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            })}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-navbar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-nav)',
        backdropFilter: 'var(--glass-backdrop)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.75rem 0',
        zIndex: 100
      }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '0.8rem',
              color: isActive ? 'var(--cyan)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500
            })}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-navbar {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-navbar {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;


