const db = require('../db');
const rpgService = require('./rpg.service');

/**
 * Retrieves authenticated user profile payload including user info,
 * RPG progress & attributes, quest summary stats, individual daily streaks,
 * highest best streak, and recent quest completion history.
 */
async function getUserProfile(userId, page = 1, limit = 10) {
  // 1. Fetch User & Character details
  const userCharRes = await db.query(
    `SELECT 
       u.id AS user_id, u.name, u.email, u.created_at AS user_created_at,
       c.level, c.total_xp, c.gold, c.strength, c.intellect, c.focus, c.knowledge, c.discipline
     FROM users u
     LEFT JOIN characters c ON c.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  if (userCharRes.rows.length === 0) {
    const error = new Error('User profile not found.');
    error.statusCode = 404;
    throw error;
  }

  const row = userCharRes.rows[0];
  const progressDetails = rpgService.calculateProgressDetails(row.total_xp || 0);

  // 2. Fetch Quest Summary Statistics
  const questStatsRes = await db.query(
    `SELECT 
       COUNT(*)::int AS total,
       COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::int AS active,
       COUNT(CASE WHEN type = 'DAILY' THEN 1 END)::int AS daily,
       COUNT(CASE WHEN type = 'ONE_DAY' THEN 1 END)::int AS one_day
     FROM quests
     WHERE user_id = $1`,
    [userId]
  );

  const completionCountRes = await db.query(
    `SELECT COUNT(*)::int AS completed FROM quest_completions WHERE user_id = $1`,
    [userId]
  );

  const questStatsRow = questStatsRes.rows[0] || {};
  const totalCompleted = completionCountRes.rows[0]?.completed || 0;

  const questStats = {
    total: questStatsRow.total || 0,
    completed: totalCompleted,
    active: questStatsRow.active || 0,
    daily: questStatsRow.daily || 0,
    oneDay: questStatsRow.one_day || 0
  };

  // 3. Fetch Daily Quests with Streaks
  const dailyStreaksRes = await db.query(
    `SELECT 
       q.id AS quest_id,
       q.title,
       q.category,
       dqs.current_streak,
       dqs.best_streak,
       dqs.last_completed_date
     FROM quests q
     LEFT JOIN daily_quest_streaks dqs ON dqs.quest_id = q.id
     WHERE q.user_id = $1 AND q.type = 'DAILY'
     ORDER BY q.created_at DESC`,
    [userId]
  );

  let bestStreakDays = 0;
  let bestStreakQuestTitle = null;

  const dailyStreaks = dailyStreaksRes.rows.map(item => {
    const streakInfo = rpgService.getEffectiveIndividualStreak(
      item.last_completed_date,
      item.current_streak,
      item.best_streak
    );

    if (streakInfo.best > bestStreakDays) {
      bestStreakDays = streakInfo.best;
      bestStreakQuestTitle = item.title;
    } else if (streakInfo.best === bestStreakDays && bestStreakDays > 0 && !bestStreakQuestTitle) {
      bestStreakQuestTitle = item.title;
    }

    return {
      id: item.quest_id,
      title: item.title,
      category: item.category,
      current: streakInfo.current,
      best: streakInfo.best,
      lastCompletedDate: streakInfo.lastCompletedDate
    };
  });

  const bestStreak = {
    days: bestStreakDays,
    questTitle: bestStreakQuestTitle
  };

  // 4. Fetch Recent Quest Completions with Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const recentCompletionsRes = await db.query(
    `SELECT 
       qc.id,
       qc.quest_id,
       q.title,
       q.category,
       q.type,
       qc.completed_at,
       qc.xp_earned,
       qc.gold_earned,
       qc.attribute
     FROM quest_completions qc
     JOIN quests q ON q.id = qc.quest_id
     WHERE qc.user_id = $1
     ORDER BY qc.completed_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limitNum, offset]
  );

  const recentCompletions = recentCompletionsRes.rows.map(c => ({
    id: c.id,
    questId: c.quest_id,
    title: c.title,
    category: c.category,
    type: c.type,
    completedAt: c.completed_at,
    xpEarned: c.xp_earned,
    goldEarned: c.gold_earned,
    attribute: c.attribute
  }));

  const totalPages = Math.ceil(totalCompleted / limitNum) || 1;

  // Sync character category completion counts
  const syncedChar = await rpgService.syncCharacterAttributes(db, userId);

  return {
    user: {
      name: row.name,
      email: row.email,
      createdAt: row.user_created_at
    },
    progress: {
      level: progressDetails.level,
      totalXp: progressDetails.total_xp,
      gold: row.gold || 0,
      xpRequiredForNextLevel: progressDetails.xp_required_for_next_level,
      xpInCurrentLevel: progressDetails.xp_in_current_level,
      xpForNextLevel: progressDetails.xp_for_next_level,
      progressPercent: progressDetails.progress_percent,
      attributes: {
        strength: syncedChar ? (syncedChar.strength ?? 0) : 0,
        intellect: syncedChar ? (syncedChar.intellect ?? 0) : 0,
        focus: syncedChar ? (syncedChar.focus ?? 0) : 0,
        knowledge: syncedChar ? (syncedChar.knowledge ?? 0) : 0,
        discipline: syncedChar ? (syncedChar.discipline ?? 0) : 0
      }
    },
    questStats,
    bestStreak,
    dailyStreaks,
    recentCompletions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalCompletions: totalCompleted,
      totalPages
    }
  };
}

module.exports = {
  getUserProfile
};
