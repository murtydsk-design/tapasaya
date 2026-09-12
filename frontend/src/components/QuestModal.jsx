import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { value: 'FITNESS', label: 'Fitness (+1 Strength)', attr: 'Strength' },
  { value: 'CODING', label: 'Coding (+1 Intellect)', attr: 'Intellect' },
  { value: 'STUDY', label: 'Study (+1 Knowledge)', attr: 'Knowledge' },
  { value: 'MEDITATION', label: 'Meditation (+1 Focus)', attr: 'Focus' },
  { value: 'PRODUCTIVITY', label: 'Productivity (+1 Discipline)', attr: 'Discipline' }
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy (20 XP, 10 Gold)', xp: 20, gold: 10 },
  { value: 'MEDIUM', label: 'Medium (40 XP, 20 Gold)', xp: 40, gold: 20 },
  { value: 'HARD', label: 'Hard (75 XP, 40 Gold)', xp: 75, gold: 40 }
];

export const QuestModal = ({ isOpen, onClose, onSubmit, initialQuest = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CODING');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [type, setType] = useState('DAILY');
  const [questDate, setQuestDate] = useState(new Date().toISOString().substring(0, 10));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title || '');
      setDescription(initialQuest.description || '');
      setCategory(initialQuest.category || 'CODING');
      setDifficulty(initialQuest.difficulty || 'MEDIUM');
      setType(initialQuest.type || 'DAILY');
      setQuestDate(initialQuest.quest_date ? initialQuest.quest_date.substring(0, 10) : new Date().toISOString().substring(0, 10));
      setStartDate(initialQuest.start_date ? initialQuest.start_date.substring(0, 10) : '');
      setEndDate(initialQuest.end_date ? initialQuest.end_date.substring(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('CODING');
      setDifficulty('MEDIUM');
      setType('DAILY');
      setQuestDate(new Date().toISOString().substring(0, 10));
      setStartDate(new Date().toISOString().substring(0, 10));
      setEndDate('');
    }
    setError(null);
  }, [initialQuest, isOpen]);

  if (!isOpen) return null;

  const currentDiff = DIFFICULTIES.find(d => d.value === difficulty) || DIFFICULTIES[1];
  const currentCat = CATEGORIES.find(c => c.value === category) || CATEGORIES[1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a quest title.');
      return;
    }

    if (type === 'ONE_DAY' && !questDate) {
      setError('Please select a date for the one-day quest.');
      return;
    }

    if (type === 'DAILY' && startDate && endDate && startDate > endDate) {
      setError('Start Date cannot be after End Date.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        category,
        difficulty,
        type,
        quest_date: type === 'ONE_DAY' ? questDate : null,
        start_date: type === 'DAILY' && startDate ? startDate : null,
        end_date: type === 'DAILY' && endDate ? endDate : null
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to save quest. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'var(--glass-backdrop)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
            {initialQuest ? 'Edit Quest' : 'Create Quest'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>

        {/* Quest Type Selection Tabs */}
        {!initialQuest && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'var(--badge-bg)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              onClick={() => setType('DAILY')}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: type === 'DAILY' ? 'var(--primary)' : 'transparent',
                color: type === 'DAILY' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Daily Quest
            </button>
            <button
              type="button"
              onClick={() => setType('ONE_DAY')}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: type === 'ONE_DAY' ? 'var(--primary)' : 'transparent',
                color: type === 'ONE_DAY' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              One-Day Quest
            </button>
          </div>
        )}

        <p style={{ fontSize: '0.825rem', color: 'var(--cyan)', marginBottom: '1rem' }}>
          {type === 'DAILY'
            ? 'Daily quests repeat every day. Complete them daily to build your streak.'
            : 'One-day quests are for specific tasks on a single date.'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--rose)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Quest Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'DAILY' ? 'e.g. Study for 1 hour' : 'e.g. Submit Assignment'}
              maxLength={150}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this quest..."
              rows={2}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: type === 'ONE_DAY' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              >
                {DIFFICULTIES.map(d => (
                  <option key={d.value} value={d.value} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {type === 'ONE_DAY' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={questDate}
                  onChange={(e) => setQuestDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            )}
          </div>

          {type === 'DAILY' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Today"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Ongoing"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Reward Preview */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Rewards:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--cyan)' }}>+{currentDiff.xp} XP</span>
              <span style={{ color: 'var(--gold)' }}>+{currentDiff.gold} Gold</span>
              <span style={{ color: '#c084fc' }}>+{currentCat.attr}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : (initialQuest ? 'Save Changes' : (type === 'DAILY' ? 'Create Daily Quest' : 'Create One-Day Quest'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestModal;
