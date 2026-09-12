import React, { useState, useEffect, useCallback } from 'react';
import profileApi from '../services/profileApi';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/Avatar';
import { AvatarModal } from '../components/AvatarModal';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allCompletions, setAllCompletions] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

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

  const handleSaveAvatar = async (avatarType, avatarId) => {
    const res = await profileApi.updateAvatar(avatarType, avatarId);
    if (res.success && res.data?.user) {
      updateUser(res.data.user);
      setProfileData(prev => prev ? { ...prev, user: { ...prev.user, avatar: res.data.user.avatar } } : prev);
    }
  };

  const handleOpenEditProfile = () => {
    const currentUser = profileData?.user || user;
    setEditForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || currentUser?.phone_number || ''
    });
    setFormError(null);
    setFormSuccess(null);
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setFormError(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const nameTrimmed = editForm.name.trim();
    const emailTrimmed = editForm.email.trim();
    const phoneTrimmed = editForm.phone ? editForm.phone.trim() : '';

    if (!nameTrimmed) {
      setFormError('Please enter your name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (phoneTrimmed && !/^[+\d\s\-()]*$/.test(phoneTrimmed)) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await profileApi.updateProfile({
        name: nameTrimmed,
        email: emailTrimmed,
        phone: phoneTrimmed
      });

      if (res.success && res.data?.user) {
        const updatedUser = res.data.user;
        updateUser(updatedUser);
        setProfileData(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone || updatedUser.phone_number || null,
            phone_number: updatedUser.phone_number || updatedUser.phone || null
          }
        } : prev);

        setFormSuccess('Profile updated successfully.');
        setIsEditingProfile(false);
      } else {
        setFormError(res.message || 'Unable to update your profile. Please try again.');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Unable to update your profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

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

  const { user: profileUser, progress, questStats, bestStreak, dailyStreaks, pagination } = profileData || {};
  const displayUser = profileUser || user;
  const attributes = progress?.attributes || {};
  const hasMoreCompletions = pagination ? page < pagination.totalPages : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Profile Header & Avatar Card */}
      {!isEditingProfile ? (
        <div className="glass-panel" style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem'
        }}>
          <Avatar user={displayUser} size={96} />

          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>
              {displayUser?.name || 'User Profile'}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
              {displayUser?.email}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
              Phone: {displayUser?.phone || displayUser?.phone_number ? (displayUser.phone || displayUser.phone_number) : 'Not added'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Member since {formatMemberDate(displayUser?.createdAt)}
            </p>
          </div>

          {formSuccess && (
            <div style={{
              padding: '0.6rem 1rem',
              background: 'rgba(120, 184, 146, 0.15)',
              border: '1px solid var(--emerald)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--emerald)',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              {formSuccess}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 500 }}
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="btn-secondary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 500 }}
            >
              Change Avatar
            </button>
          </div>
        </div>
      ) : (
        /* Edit Profile Form Card */
        <div className="glass-panel" style={{
          padding: '2rem',
          maxWidth: '520px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Avatar user={displayUser} size={64} />
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 700 }}>Edit Profile</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update your personal profile information</p>
            </div>
          </div>

          {formError && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(217, 120, 120, 0.15)',
              border: '1px solid var(--rose)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--rose)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem'
            }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label htmlFor="edit-profile-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Name
              </label>
              <input
                id="edit-profile-name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter your name"
                required
                disabled={savingProfile}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="edit-profile-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Email
              </label>
              <input
                id="edit-profile-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="user@email.com"
                required
                disabled={savingProfile}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="edit-profile-phone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                id="edit-profile-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Enter phone number"
                disabled={savingProfile}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleCancelEditProfile}
                className="btn-secondary"
                disabled={savingProfile}
                style={{ padding: '0.6rem 1.25rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={savingProfile}
                style={{ padding: '0.6rem 1.25rem' }}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

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

      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSave={handleSaveAvatar}
        user={displayUser || user}
      />
    </div>
  );
};

export default ProfilePage;
