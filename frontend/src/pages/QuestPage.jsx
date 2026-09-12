import React, { useState } from 'react';
import { useRpg } from '../hooks/useRpg';
import QuestCard from '../components/QuestCard';
import QuestModal from '../components/QuestModal';
import questApi from '../services/questApi';

export const QuestPage = () => {
  const { quests, loading, refreshRpgData, showToast } = useRpg();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);

  const handleOpenCreateModal = () => {
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (quest) => {
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  const handleSaveQuest = async (questData) => {
    if (editingQuest) {
      const res = await questApi.updateQuest(editingQuest.id, questData);
      if (res.success) {
        showToast('Quest updated.', 'success');
        await refreshRpgData();
      } else {
        throw new Error(res.message || 'Failed to update quest.');
      }
    } else {
      const res = await questApi.createQuest(questData);
      if (res.success) {
        showToast('Quest created.', 'success');
        await refreshRpgData();
      } else {
        throw new Error(res.message || 'Failed to create quest.');
      }
    }
  };

  const handleDeleteQuest = async (questId) => {
    const res = await questApi.deleteQuest(questId);
    if (res.success) {
      showToast('Quest deleted.', 'info');
      await refreshRpgData();
    }
  };

  // Filter Quests
  const filteredQuests = quests.filter(q => {
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && q.status === 'ACTIVE') ||
      (filterStatus === 'COMPLETED' && q.status === 'COMPLETED');

    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'DAILY' && q.type === 'DAILY') ||
      (filterType === 'ONE_DAY' && q.type === 'ONE_DAY');

    const matchesCategory =
      filterCategory === 'ALL' || q.category === filterCategory;

    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Your quests</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Manage and track your daily and one-day quests.
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          Create Quest
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status & Type Tabs */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Status */}
            <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'COMPLETED', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    background: filterStatus === tab.id ? 'var(--primary)' : 'transparent',
                    color: filterStatus === tab.id ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'DAILY', label: 'Daily' },
                { id: 'ONE_DAY', label: 'One-Day' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    background: filterType === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: filterType === tab.id ? 'var(--cyan)' : 'var(--text-muted)',
                    border: filterType === tab.id ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quests..."
            style={{
              padding: '0.45rem 0.85rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              minWidth: '200px'
            }}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-dim)', alignSelf: 'center', fontWeight: 500 }}>Category:</span>
          {['ALL', 'FITNESS', 'CODING', 'STUDY', 'MEDITATION', 'PRODUCTIVITY'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: filterCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'var(--badge-bg)',
                border: filterCategory === cat ? '1px solid var(--primary)' : '1px solid transparent',
                color: filterCategory === cat ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: 500,
                fontSize: '0.775rem'
              }}
            >
              {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Quests Grid */}
      {loading && quests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading quests...
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>No quests found.</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            No quests match your selected filters.
          </p>
          <button onClick={handleOpenCreateModal} className="btn-primary">
            Create Quest
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.15rem' }}>
          {filteredQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteQuest}
            />
          ))}
        </div>
      )}

      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveQuest}
        initialQuest={editingQuest}
      />
    </div>
  );
};

export default QuestPage;

