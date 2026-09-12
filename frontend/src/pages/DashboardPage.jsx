import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRpg } from '../hooks/useRpg';
import ProgressBar from '../components/ProgressBar';
import StreakBadge from '../components/StreakBadge';
import QuestCard from '../components/QuestCard';
import QuestModal from '../components/QuestModal';
import questApi from '../services/questApi';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { character, progress, quests, loading, refreshRpgData, showToast } = useRpg();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeQuests = quests.filter(q => q.status === 'ACTIVE');

  const handleCreateQuest = async (questData) => {
    const res = await questApi.createQuest(questData);
    if (res.success) {
      showToast('Quest created.', 'success');
      await refreshRpgData();
    } else {
      throw new Error(res.message || 'Failed to create quest.');
    }
  };

  const handleDeleteQuest = async (questId) => {
    const res = await questApi.deleteQuest(questId);
    if (res.success) {
      showToast('Quest deleted.', 'info');
      await refreshRpgData();
    }
  };

  if (loading && !character) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>
            Welcome back, {user?.name || 'User'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Here is your progress and active quests for today.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ padding: '0.65rem 1.25rem' }}
        >
          Create Quest
        </button>
      </div>

      {/* Progress & Streak Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <ProgressBar progress={progress} character={character} />
        <StreakBadge streak={progress?.streak} />
      </div>

      {/* Stats Quick Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.85rem'
      }}>
        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Strength</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose)', marginTop: '0.1rem' }}>{character?.strength ?? 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fitness completed</div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Intellect</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '0.1rem' }}>{character?.intellect ?? 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coding completed</div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Knowledge</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)', marginTop: '0.1rem' }}>{character?.knowledge ?? 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Study completed</div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Focus</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem' }}>{character?.focus ?? 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Meditation completed</div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Discipline</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '0.1rem' }}>{character?.discipline ?? 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Productivity completed</div>
        </div>
      </div>

      {/* Active Quests Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Active quests ({activeQuests.length})</h2>
          </div>

          <Link to="/quests" style={{ fontSize: '0.875rem', color: 'var(--cyan)', fontWeight: 500 }}>
            View all quests ({quests.length})
          </Link>
        </div>

        {activeQuests.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>No quests yet.</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Create your first quest to get started.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              Create Quest
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.15rem' }}>
            {activeQuests.slice(0, 6).map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onEdit={() => setIsModalOpen(true)}
                onDelete={handleDeleteQuest}
              />
            ))}
          </div>
        )}
      </div>

      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateQuest}
      />
    </div>
  );
};

export default DashboardPage;

