import React from 'react';

const ATTRIBUTE_CONFIG = [
  { key: 'strength', label: 'Strength', cat: 'Fitness', color: 'var(--rose)' },
  { key: 'intellect', label: 'Intellect', cat: 'Coding', color: 'var(--emerald)' },
  { key: 'knowledge', label: 'Knowledge', cat: 'Study', color: 'var(--gold)' },
  { key: 'focus', label: 'Focus', cat: 'Meditation', color: 'var(--primary)' },
  { key: 'discipline', label: 'Discipline', cat: 'Productivity', color: 'var(--emerald)' }
];

export const AttributeCard = ({ character }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Completed Quests by Category</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Total completed quests in each category</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {ATTRIBUTE_CONFIG.map(attr => {
          const val = character?.[attr.key] ?? 0;
          const progressWidth = Math.min(100, Math.max(0, (val / 50) * 100));

          return (
            <div key={attr.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                  {attr.label} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({attr.cat} quests completed)</span>
                </span>
                <span style={{ fontWeight: 700, color: attr.color, fontSize: '0.9rem' }}>
                  {val} completed
                </span>
              </div>

              <div style={{
                height: '6px',
                width: '100%',
                background: 'var(--track-bg)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressWidth}%`,
                  background: attr.color,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttributeCard;


