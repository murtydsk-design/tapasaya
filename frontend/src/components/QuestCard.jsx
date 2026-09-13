import React, { useState, useEffect } from 'react';
import { useRpg } from '../hooks/useRpg';
import questApi from '../services/questApi';

const CATEGORY_META = {
  FITNESS: { attribute: 'Strength', colorClass: 'badge-fitness', label: 'Fitness' },
  CODING: { attribute: 'Intellect', colorClass: 'badge-coding', label: 'Coding' },
  STUDY: { attribute: 'Knowledge', colorClass: 'badge-study', label: 'Study' },
  MEDITATION: { attribute: 'Focus', colorClass: 'badge-meditation', label: 'Meditation' },
  PRODUCTIVITY: { attribute: 'Discipline', colorClass: 'badge-productivity', label: 'Productivity' }
};

export const QuestCard = ({ quest, onEdit, onDelete }) => {
  const { completeQuestAndCheckLevelUp, showToast, refreshRpgData } = useRpg();
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timerBusy, setTimerBusy] = useState(false);

  const meta = CATEGORY_META[quest.category] || { attribute: 'Attribute', colorClass: '', label: quest.category };
  const isDaily = quest.type === 'DAILY';
  const isCompletedToday = Boolean(quest.is_completed_today || quest.completedToday);
  const isPermanentlyCompleted = !isDaily && quest.status === 'COMPLETED';

  const todayStr = new Date().toISOString().substring(0, 10);
  const startDateStr = quest.start_date ? quest.start_date.substring(0, 10) : null;
  const endDateStr = quest.end_date ? quest.end_date.substring(0, 10) : null;

  const isBeforeStartDate = isDaily && startDateStr && todayStr < startDateStr;
  const isAfterEndDate = isDaily && endDateStr && todayStr > endDateStr;
  const isOutsideActiveRange = isBeforeStartDate || isAfterEndDate;

  const isDisabledFromCompleting = isDaily
    ? (isCompletedToday || isOutsideActiveRange)
    : isPermanentlyCompleted;

  const hasTimer = quest.timer_option && quest.timer_option !== 'NONE';
  const timerStatus = quest.timer_status || 'STOPPED';
  const remainingSeconds = quest.timer_remaining_seconds;

  const [displayRemaining, setDisplayRemaining] = useState(remainingSeconds);

  useEffect(() => {
    setDisplayRemaining(remainingSeconds);
  }, [remainingSeconds, quest.updated_at, timerStatus]);

  useEffect(() => {
    if (timerStatus !== 'RUNNING' || displayRemaining === null || displayRemaining === undefined || displayRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setDisplayRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStatus, quest.timer_started_at]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'One-Day';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTimerLabel = (option) => {
    if (option === '1_HOUR') return '1 Hour';
    if (option === '2_HOURS') return '2 Hours';
    if (option === 'FULL_DAY') return 'Full Day';
    return option;
  };

  const formatTimeDisplay = (totalSecs) => {
    if (totalSecs === null || totalSecs === undefined) return '';
    if (totalSecs <= 0) return "Time's up";
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`;
  };

  const handleStartTimer = async () => {
    if (timerBusy) return;
    setTimerBusy(true);
    try {
      await questApi.startTimer(quest.id);
      await refreshRpgData();
    } catch (err) {
      showToast(err.message || 'Failed to start timer.', 'error');
    } finally {
      setTimerBusy(false);
    }
  };

  const handlePauseTimer = async () => {
    if (timerBusy) return;
    setTimerBusy(true);
    try {
      await questApi.pauseTimer(quest.id);
      await refreshRpgData();
    } catch (err) {
      showToast(err.message || 'Failed to pause timer.', 'error');
    } finally {
      setTimerBusy(false);
    }
  };

  const handleResumeTimer = async () => {
    if (timerBusy) return;
    setTimerBusy(true);
    try {
      await questApi.resumeTimer(quest.id);
      await refreshRpgData();
    } catch (err) {
      showToast(err.message || 'Failed to resume timer.', 'error');
    } finally {
      setTimerBusy(false);
    }
  };

  const handleResetTimer = async () => {
    if (timerBusy) return;
    setTimerBusy(true);
    try {
      await questApi.resetTimer(quest.id);
      await refreshRpgData();
    } catch (err) {
      showToast(err.message || 'Failed to reset timer.', 'error');
    } finally {
      setTimerBusy(false);
    }
  };

  const handleComplete = async () => {
    if (isDisabledFromCompleting || completing) return;
    setCompleting(true);
    try {
      const res = await completeQuestAndCheckLevelUp(quest.id);
      if (!res.success) {
        showToast(res.message || 'Failed to complete quest.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error completing quest.', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (window.confirm(`Delete "${quest.title}"?`)) {
      setDeleting(true);
      try {
        await onDelete(quest.id);
      } finally {
        setDeleting(false);
      }
    }
  };

  const currentStreak = quest.streak?.current ?? quest.current_streak ?? 0;
  const bestStreak = quest.streak?.best ?? quest.best_streak ?? 0;

  return (
    <div className="glass-panel" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.85rem',
      opacity: isDisabledFromCompleting ? 0.75 : 1,
      borderColor: isCompletedToday || isPermanentlyCompleted ? 'var(--emerald)' : 'var(--border-color)'
    }}>
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.35rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'var(--badge-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              {isDaily ? 'Daily' : formatDate(quest.quest_date)}
            </span>
            <span className={`badge ${meta.colorClass}`}>
              {meta.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className={`badge badge-${quest.difficulty.toLowerCase()}`}>
              {quest.difficulty.charAt(0) + quest.difficulty.slice(1).toLowerCase()}
            </span>
            {isBeforeStartDate && (
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--gold)' }}>
                Starts {startDateStr}
              </span>
            )}
            {isAfterEndDate && (
              <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.12)', color: 'var(--rose)' }}>
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.25rem', fontWeight: 600 }}>
          {quest.title}
        </h3>
        {quest.description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {quest.description}
          </p>
        )}
      </div>

      {/* Daily Streak Indicator */}
      {isDaily && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 0.75rem',
          background: 'var(--badge-bg)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.85rem' }}>
            {currentStreak} day streak
          </span>
          {bestStreak > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Best: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
            </span>
          )}
        </div>
      )}

      {/* Quest Timer Section */}
      {hasTimer && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          padding: '0.65rem 0.75rem',
          background: 'var(--badge-bg)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Timer ({formatTimerLabel(quest.timer_option)})
            </span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: (displayRemaining === 0 || quest.is_expired) ? 'var(--rose)' : timerStatus === 'RUNNING' ? 'var(--cyan)' : 'var(--text-main)'
            }}>
              {timerStatus === 'STOPPED'
                ? formatTimerLabel(quest.timer_option)
                : formatTimeDisplay(displayRemaining)}
            </span>
          </div>

          {/* Timer Controls */}
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            {timerStatus === 'STOPPED' && (
              <button
                onClick={handleStartTimer}
                disabled={timerBusy || isDisabledFromCompleting}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                Start Timer
              </button>
            )}
            {timerStatus === 'RUNNING' && displayRemaining > 0 && (
              <>
                <button
                  onClick={handlePauseTimer}
                  disabled={timerBusy}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Pause
                </button>
                <button
                  onClick={handleResetTimer}
                  disabled={timerBusy}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Reset
                </button>
              </>
            )}
            {timerStatus === 'PAUSED' && displayRemaining > 0 && (
              <>
                <button
                  onClick={handleResumeTimer}
                  disabled={timerBusy}
                  className="btn-primary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Resume
                </button>
                <button
                  onClick={handleResetTimer}
                  disabled={timerBusy}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Reset
                </button>
              </>
            )}
            {(displayRemaining === 0 || quest.is_expired) && (
              <button
                onClick={handleResetTimer}
                disabled={timerBusy}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rewards Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.75rem',
        background: 'var(--badge-bg)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--cyan)' }}>+{quest.xp_reward} XP</span>
          <span style={{ color: 'var(--gold)' }}>+{quest.gold_reward} Gold</span>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          +{meta.attribute}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {!isDisabledFromCompleting && (
            <button
              onClick={() => onEdit(quest)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {!isDisabledFromCompleting ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            {completing ? 'Completing...' : (isDaily ? 'Complete Today' : 'Complete Quest')}
          </button>
        ) : (
          <span style={{ fontSize: '0.85rem', color: isCompletedToday ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
            {isCompletedToday ? 'Completed today' : isBeforeStartDate ? 'Not active yet' : isAfterEndDate ? 'Expired' : 'Completed'}
          </span>
        )}
      </div>
    </div>
  );
};

export default QuestCard;
