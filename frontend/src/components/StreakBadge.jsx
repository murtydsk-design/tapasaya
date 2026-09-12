import React from 'react';

export const StreakBadge = ({ streak }) => {
  const currentStreak = streak?.current_streak ?? 0;
  const bestStreak = streak?.best_streak ?? 0;

  return (
    <div className="glass-panel" style={{
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--badge-bg)',
      borderColor: 'var(--border-color)'
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>
          {currentStreak} day streak
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Complete at least 1 quest daily to maintain your streak.
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          Best streak
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gold)', marginTop: '0.1rem' }}>
          {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
        </div>
      </div>
    </div>
  );
};

export default StreakBadge;
