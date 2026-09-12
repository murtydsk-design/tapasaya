const { CATEGORY_ATTRIBUTE_MAP } = require('../utils/rpg.constants');

/**
 * Calculates user level from accumulated total XP using the non-linear formula:
 * XP Required = 100 * Level^2
 * Level = floor(sqrt(totalXP / 100)) + 1
 */
function calculateLevelFromXP(totalXP = 0) {
  const xp = Math.max(0, parseInt(totalXP, 10) || 0);
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculates XP thresholds for current level and next level.
 * Level L requires 100 * (L - 1)^2 total XP to unlock Level L.
 * Level L + 1 requires 100 * L^2 total XP to unlock Level L + 1.
 */
function calculateLevelThresholds(level = 1) {
  const currentLvl = Math.max(1, parseInt(level, 10) || 1);
  const currentLevelXP = 100 * Math.pow(currentLvl - 1, 2);
  const nextLevelXP = 100 * Math.pow(currentLvl, 2);
  const xpForNextLevel = nextLevelXP - currentLevelXP;

  return {
    currentLevel: currentLvl,
    currentLevelXP,
    nextLevelXP,
    xpForNextLevel
  };
}

/**
 * Calculates progress bar metrics (current XP in level, XP needed for next level, percentage).
 */
function calculateProgressDetails(totalXP = 0) {
  const xp = Math.max(0, parseInt(totalXP, 10) || 0);
  const level = calculateLevelFromXP(xp);
  const thresholds = calculateLevelThresholds(level);

  const xpInCurrentLevel = xp - thresholds.currentLevelXP;
  const progressPercent = Math.min(
    100,
    Math.floor((xpInCurrentLevel / thresholds.xpForNextLevel) * 100)
  );

  return {
    level,
    total_xp: xp,
    xp_required_for_next_level: thresholds.nextLevelXP,
    xp_in_current_level: xpInCurrentLevel,
    xp_for_next_level: thresholds.xpForNextLevel,
    progress_percent: progressPercent
  };
}

/**
 * Helper to parse YYYY-MM-DD components safely without timezone shifts.
 */
function parseDateComponents(dateStrOrObj) {
  if (!dateStrOrObj) return null;
  let str = '';
  if (dateStrOrObj instanceof Date) {
    const y = dateStrOrObj.getFullYear();
    const m = String(dateStrOrObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateStrOrObj.getDate()).padStart(2, '0');
    str = `${y}-${m}-${d}`;
  } else if (typeof dateStrOrObj === 'string') {
    str = dateStrOrObj.substring(0, 10);
  } else {
    str = String(dateStrOrObj).substring(0, 10);
  }
  const parts = str.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
  return { year: parts[0], month: parts[1], day: parts[2], str };
}

/**
 * Calculates calendar day difference (date2 - date1) safely using UTC dates.
 */
function getCalendarDayDiff(date1, date2) {
  const c1 = parseDateComponents(date1);
  const c2 = parseDateComponents(date2);
  if (!c1 || !c2) return null;
  const utc1 = Date.UTC(c1.year, c1.month - 1, c1.day);
  const utc2 = Date.UTC(c2.year, c2.month - 1, c2.day);
  return Math.round((utc2 - utc1) / (1000 * 3600 * 24));
}

/**
 * Calculates user global streak updates according to RULES.md calendar date rules:
 * - Same day activity: current streak remains unchanged.
 * - Consecutive day activity: current streak + 1, update best streak if exceeded.
 * - Missed day(s): reset current streak to 1, preserve best streak.
 */
function calculateStreakUpdate(lastActivityDate, currentStreak = 0, bestStreak = 0, todayDateString = null) {
  const todayParsed = parseDateComponents(todayDateString || new Date().toISOString().split('T')[0]);
  const todayStr = todayParsed ? todayParsed.str : new Date().toISOString().split('T')[0];
  const curStreak = Math.max(0, parseInt(currentStreak, 10) || 0);
  const bstStreak = Math.max(0, parseInt(bestStreak, 10) || 0);

  if (!lastActivityDate) {
    const newStreak = 1;
    return {
      current_streak: newStreak,
      best_streak: Math.max(bstStreak, newStreak),
      last_activity_date: todayStr,
      is_new_day: true
    };
  }

  const dayDiff = getCalendarDayDiff(lastActivityDate, todayStr);

  if (dayDiff === 0) {
    return {
      current_streak: curStreak,
      best_streak: bstStreak,
      last_activity_date: todayStr,
      is_new_day: false
    };
  } else if (dayDiff === 1) {
    const newStreak = curStreak + 1;
    return {
      current_streak: newStreak,
      best_streak: Math.max(bstStreak, newStreak),
      last_activity_date: todayStr,
      is_new_day: true
    };
  } else {
    const newStreak = 1;
    return {
      current_streak: newStreak,
      best_streak: Math.max(bstStreak, newStreak),
      last_activity_date: todayStr,
      is_new_day: true
    };
  }
}

/**
 * Column name mapping for RPG character attribute increment.
 */
function getCharacterAttributeColumn(category) {
  const attrName = CATEGORY_ATTRIBUTE_MAP[category];
  if (!attrName) return null;
  return attrName.toLowerCase();
}

/**
 * Calculates individual Daily Quest streak updates:
 * - First completion ever: current = 1, best = 1.
 * - Same day completion: return current, best.
 * - Consecutive calendar day: current + 1, best = max(best, current + 1).
 * - Missed day(s): reset current = 1, best = max(best, 1).
 */
function calculateIndividualStreakUpdate(lastCompletedDate, currentStreak = 0, bestStreak = 0, completionDate = null) {
  const todayParsed = parseDateComponents(completionDate || new Date().toISOString().split('T')[0]);
  const todayStr = todayParsed ? todayParsed.str : new Date().toISOString().split('T')[0];
  const curStreak = Math.max(0, parseInt(currentStreak, 10) || 0);
  const bstStreak = Math.max(0, parseInt(bestStreak, 10) || 0);

  if (!lastCompletedDate) {
    const newStreak = 1;
    return {
      current_streak: newStreak,
      best_streak: Math.max(bstStreak, newStreak),
      last_completed_date: todayStr
    };
  }

  const dayDiff = getCalendarDayDiff(lastCompletedDate, todayStr);

  if (dayDiff === 0) {
    return {
      current_streak: curStreak,
      best_streak: bstStreak,
      last_completed_date: todayStr,
      is_same_day: true
    };
  } else if (dayDiff === 1) {
    const newStreak = curStreak + 1;
    return {
      current_streak: newStreak,
      best_streak: Math.max(bstStreak, newStreak),
      last_completed_date: todayStr
    };
  } else {
    const newStreak = 1;
    return {
      current_streak: newStreak,
      best_streak: Math.max(bstStreak, newStreak),
      last_completed_date: todayStr
    };
  }
}

/**
 * Calculates effective individual streak metrics for fetching/reading a Daily Quest:
 * If last completion date was today or yesterday, streak is active.
 * If last completion date was before yesterday, current streak is 0 (streak reset due to missed day),
 * while preserving historical best streak.
 */
function getEffectiveIndividualStreak(lastCompletedDate, currentStreak = 0, bestStreak = 0, currentDate = null) {
  if (!lastCompletedDate) {
    return {
      current: 0,
      best: Math.max(0, parseInt(bestStreak, 10) || 0),
      lastCompletedDate: null
    };
  }

  const todayParsed = parseDateComponents(currentDate || new Date().toISOString().split('T')[0]);
  const todayStr = todayParsed ? todayParsed.str : new Date().toISOString().split('T')[0];
  const lastParsed = parseDateComponents(lastCompletedDate);
  const lastDateStr = lastParsed ? lastParsed.str : String(lastCompletedDate).substring(0, 10);

  const dayDiff = getCalendarDayDiff(lastDateStr, todayStr);

  const bst = Math.max(0, parseInt(bestStreak, 10) || 0);
  const cur = Math.max(0, parseInt(currentStreak, 10) || 0);

  if (dayDiff !== null && dayDiff <= 1 && dayDiff >= 0) {
    return {
      current: cur,
      best: Math.max(bst, cur),
      lastCompletedDate: lastDateStr
    };
  } else {
    return {
      current: 0,
      best: bst,
      lastCompletedDate: lastDateStr
    };
  }
}

/**
 * Synchronizes character attribute numbers to equal the EXACT count of valid quest completion records
 * for each category (FITNESS -> strength, CODING -> intellect, STUDY -> knowledge, MEDITATION -> focus, PRODUCTIVITY -> discipline).
 */
async function syncCharacterAttributes(dbOrClient, userId) {
  const countRes = await dbOrClient.query(
    `SELECT 
       COUNT(CASE WHEN q.category = 'FITNESS' THEN 1 END)::int AS strength,
       COUNT(CASE WHEN q.category = 'CODING' THEN 1 END)::int AS intellect,
       COUNT(CASE WHEN q.category = 'STUDY' THEN 1 END)::int AS knowledge,
       COUNT(CASE WHEN q.category = 'MEDITATION' THEN 1 END)::int AS focus,
       COUNT(CASE WHEN q.category = 'PRODUCTIVITY' THEN 1 END)::int AS discipline
     FROM quest_completions qc
     JOIN quests q ON q.id = qc.quest_id
     WHERE qc.user_id = $1`,
    [userId]
  );

  const counts = countRes.rows[0] || { strength: 0, intellect: 0, knowledge: 0, focus: 0, discipline: 0 };

  const updateRes = await dbOrClient.query(
    `UPDATE characters
     SET strength = $1, intellect = $2, knowledge = $3, focus = $4, discipline = $5, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $6
     RETURNING id, user_id, level, total_xp, gold, strength, intellect, focus, knowledge, discipline;`,
    [counts.strength, counts.intellect, counts.knowledge, counts.focus, counts.discipline, userId]
  );

  return updateRes.rows[0] || counts;
}

module.exports = {
  calculateLevelFromXP,
  calculateLevelThresholds,
  calculateProgressDetails,
  calculateStreakUpdate,
  calculateIndividualStreakUpdate,
  getEffectiveIndividualStreak,
  getCharacterAttributeColumn,
  syncCharacterAttributes,
  parseDateComponents,
  getCalendarDayDiff
};
