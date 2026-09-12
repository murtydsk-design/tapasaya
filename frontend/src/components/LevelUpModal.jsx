import React from 'react';
import { useRpg } from '../hooks/useRpg';

export const LevelUpModal = () => {
  const { levelUpData, setLevelUpData } = useRpg();

  if (!levelUpData) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(13, 17, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem 1.75rem',
        textAlign: 'center',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.75rem',
            color: 'var(--text-main)',
            fontWeight: 700
          }}>
            Level Up!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Nice work. You reached Level {levelUpData.newLevel}.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '0.85rem 1.75rem',
          borderRadius: 'var(--radius-md)',
          margin: '0.25rem 0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Previous</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Level {levelUpData.oldLevel}
            </div>
          </div>

          <div style={{ fontSize: '1.25rem', color: 'var(--cyan)' }}>→</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600 }}>New Level</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Level {levelUpData.newLevel}
            </div>
          </div>
        </div>

        <button
          onClick={() => setLevelUpData(null)}
          className="btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;

