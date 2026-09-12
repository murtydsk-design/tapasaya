import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRpg } from '../hooks/useRpg';
import AttributeCard from '../components/AttributeCard';
import ProgressBar from '../components/ProgressBar';
import StreakBadge from '../components/StreakBadge';

export const CharacterPage = () => {
  const { user } = useAuth();
  const { character, progress, loading } = useRpg();

  if (loading && !character) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading character stats...
      </div>
    );
  }

  const level = character?.level ?? 1;
  const totalXp = character?.total_xp ?? 0;
  const gold = character?.gold ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Character Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>
            {user?.name || 'User'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'TAPASYA'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '0.65rem 1rem', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Level</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>Level {level}</div>
          </div>

          <div className="glass-panel" style={{ padding: '0.65rem 1rem', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Gold</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.1rem' }}>{gold} Gold</div>
          </div>
        </div>
      </div>

      {/* Progress & Streak Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <ProgressBar progress={progress} character={character} />
        <StreakBadge streak={progress?.streak} />
      </div>

      {/* Attributes & Progression Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <AttributeCard character={character} />

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Level progress
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Complete quests to gain XP and level up.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Total XP:</span>
              <strong style={{ color: 'var(--cyan)' }}>{totalXp} XP</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>XP Needed for Level {level + 1}:</span>
              <strong style={{ color: 'var(--primary)' }}>{progress?.xp_for_next_level || 100} XP</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total XP for Level {level + 1}:</span>
              <strong style={{ color: 'var(--text-main)' }}>{progress?.xp_required_for_next_level || 100} XP</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gold Balance:</span>
              <strong style={{ color: 'var(--gold)' }}>{gold} Gold</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
