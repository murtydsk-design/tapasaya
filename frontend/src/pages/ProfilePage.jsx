import React, { useState, useEffect, useCallback } from 'react';
import profileApi from '../services/profileApi';

export const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allCompletions, setAllCompletions] = useState([]);

  const fetchProfile = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await profileApi.getProfile(pageNum, 10);
      if (res.success && res.data) {
        setProfileData(res.data);
        if (isLoadMore) {
          setAllCompletions(prev => [...prev, ...(res.data.recentCompletions || [])]);
        } else {
          setAllCompletions(res.data.recentCompletions || []);
        }
      } else {
        setError(res.message || 'Unable to load your profile. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(1);
  }, [fetchProfile]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProfile(nextPage, true);
  };

  const formatMemberDate = (dateStr) => {
    if (!dateStr) return 'TAPASYA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading && !profileData) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
        <p style={{ color: 'var(--rose)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => fetchProfile(1)} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const { user, progress, questStats, bestStreak, dailyStreaks, pagination } = profileData || {};
  const attributes = progress?.attributes || {};
  const hasMoreCompletions = pagination ? page < pagination.totalPages : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Profile Header */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
            {user?.name || 'User Profile'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Member since {formatMemberDate(user?.createdAt)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>Email</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 500, marginTop: '0.1rem' }}>{user?.email}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>Joined</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 500, marginTop: '0.1rem' }}>{formatDate(user?.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Progress & Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Progress Overview */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Progress</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div className="glass-panel" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>LEVEL</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem' }}>
                {progress?.level || 1}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>XP</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '0.2rem' }}>
                {progress?.totalXp || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                / {progress?.xpRequiredForNextLevel || 100}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>GOLD</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--gold)', marginTop: '0.1rem' }}>
                {progress?.gold || 0}
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              <span>XP in Level {progress?.level || 1}</span>
              <span>{progress?.xpInCurrentLevel || 0} / {progress?.xpForNextLevel || 100} XP</span>
            </div>
            <div style={{
              height: '8px',
              width: '100%',
              background: 'var(--track-bg)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, progress?.progressPercent || 0))}%`,
                background: 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Quest Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Quest Summary</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.65rem 0.85rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Quests</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                {questStats?.total || 0}
              </div>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '0.1rem' }}>
                {questStats?.completed || 0}
              </div>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem' }}>
                {questStats?.active || 0}
              </div>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily / One-Day</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {questStats?.daily || 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>daily</span> · {questStats?.oneDay || 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>one-day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Best Streak Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Best Streak</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Your highest individual daily quest streak
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold)' }}>
              {bestStreak?.days || 0} {bestStreak?.days === 1 ? 'day' : 'days'}
            </div>
            {bestStreak?.questTitle ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500, marginTop: '0.25rem' }}>
                {bestStreak.questTitle}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                No daily streaks recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attributes Summary */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Completed Quests by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Strength</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose)', marginTop: '0.15rem' }}>{attributes.strength ?? 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fitness completed</div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Intellect</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '0.15rem' }}>{attributes.intellect ?? 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coding completed</div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Knowledge</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)', marginTop: '0.15rem' }}>{attributes.knowledge ?? 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Study completed</div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Focus</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.15rem' }}>{attributes.focus ?? 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Meditation completed</div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Discipline</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '0.15rem' }}>{attributes.discipline ?? 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Productivity completed</div>
          </div>
        </div>
      </div>

      {/* Daily Streaks List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Daily Streaks</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Individual streaks for each active daily quest
        </p>

        {(!dailyStreaks || dailyStreaks.length === 0) ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)' }}>
            No daily quests yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {dailyStreaks.map(streak => (
              <div
                key={streak.id}
                style={{
                  padding: '1rem 1.15rem',
                  background: 'var(--badge-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {streak.title}
                  </h3>
                  <span className="badge" style={{ background: 'var(--badge-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                    {streak.category}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Current streak: </span>
                    <strong style={{ color: 'var(--gold)' }}>{streak.current} {streak.current === 1 ? 'day' : 'days'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Best streak: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{streak.best} {streak.best === 1 ? 'day' : 'days'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quest History Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Quest History</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Recently completed quests and rewards earned
            </p>
          </div>
        </div>

        {(!allCompletions || allCompletions.length === 0) ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)' }}>
            No completed quests yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {allCompletions.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.85rem 1.15rem',
                  background: 'var(--badge-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {item.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Completed {formatDate(item.completedAt)} · <span style={{ color: 'var(--text-dim)' }}>{item.category}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--emerald)' }}>+{item.xpEarned} XP</span>
                  <span style={{ color: 'var(--gold)' }}>+{item.goldEarned} Gold</span>
                  {item.attribute && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                      +{item.attribute}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {hasMoreCompletions && (
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1.5rem', fontSize: '0.85rem' }}
                >
                  {loadingMore ? 'Loading...' : 'Load More History'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
