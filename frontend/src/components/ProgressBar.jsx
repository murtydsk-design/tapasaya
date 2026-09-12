import React from 'react';

export const ProgressBar = ({ progress, character }) => {
  const level = character?.level || 1;
  const totalXp = character?.total_xp || 0;

  const currentLevelXp = progress?.xp_in_current_level || 0;
  const xpForNextLevel = progress?.xp_for_next_level || 100;
  const percent = progress?.progress_percent ?? 0;
  const xpRequiredTotal = progress?.xp_required_for_next_level || 100;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--primary)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)'
          }}>
            Level {level}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>Your Progress</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total XP: <strong style={{ color: 'var(--cyan)' }}>{totalXp} XP</strong>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>
            {currentLevelXp} / {xpForNextLevel} XP
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Level {level + 1} at {xpRequiredTotal} XP
          </div>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div style={{
        height: '10px',
        width: '100%',
        background: 'var(--track-bg)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, percent))}%`,
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--cyan) 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Progress: {percent}%</span>
        <span>{xpForNextLevel - currentLevelXp} XP remaining</span>
      </div>
    </div>
  );
};

export default ProgressBar;


