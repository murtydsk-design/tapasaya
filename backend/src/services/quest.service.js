const db = require('../config/db');
const { DIFFICULTY_REWARDS, CATEGORY_ATTRIBUTE_MAP } = require('../utils/rpg.constants');
const rpgService = require('./rpg.service');

/**
 * Helper to format quest database row with individual streak data.
 */
function formatQuestRow(row, currentDate = null) {
  const isDaily = row.type === 'DAILY';
  const isCompletedToday = Boolean(row.is_completed_today);

  if (!isDaily) {
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty,
      type: row.type,
      quest_date: row.quest_date ? row.quest_date.toISOString().substring(0, 10) : null,
      start_date: row.start_date ? row.start_date.toISOString().substring(0, 10) : null,
      end_date: row.end_date ? row.end_date.toISOString().substring(0, 10) : null,
      xp_reward: row.xp_reward,
      gold_reward: row.gold_reward,
      status: row.status,
      created_at: row.created_at,
      completed_at: row.completed_at,
      updated_at: row.updated_at,
      is_completed_today: isCompletedToday,
      completedToday: isCompletedToday,
      streak: null
    };
  }

  const effStreak = rpgService.getEffectiveIndividualStreak(
    row.dqs_last_completed_date,
    row.dqs_current_streak,
    row.dqs_best_streak,
    currentDate
  );

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    type: row.type,
    quest_date: row.quest_date ? row.quest_date.toISOString().substring(0, 10) : null,
    start_date: row.start_date ? row.start_date.toISOString().substring(0, 10) : null,
    end_date: row.end_date ? row.end_date.toISOString().substring(0, 10) : null,
    xp_reward: row.xp_reward,
    gold_reward: row.gold_reward,
    status: row.status,
    created_at: row.created_at,
    completed_at: row.completed_at,
    updated_at: row.updated_at,
    is_completed_today: isCompletedToday,
    completedToday: isCompletedToday,
    current_streak: effStreak.current,
    best_streak: effStreak.best,
    last_completed_date: effStreak.lastCompletedDate,
    streak: {
      current: effStreak.current,
      best: effStreak.best,
      lastCompletedDate: effStreak.lastCompletedDate
    }
  };
}

/**
 * Creates a new quest for the authenticated user.
 * Backend strictly computes XP and Gold rewards based on difficulty.
 */
async function createQuest(userId, { title, description, category, difficulty, type = 'ONE_DAY', quest_date = null, start_date = null, end_date = null }) {
  const rewards = DIFFICULTY_REWARDS[difficulty];
  if (!rewards) {
    const error = new Error('Invalid quest difficulty.');
    error.statusCode = 400;
    throw error;
  }

  const questType = type ? type.toUpperCase() : 'ONE_DAY';
  let finalQuestDate = null;
  let finalStartDate = null;
  let finalEndDate = null;

  if (questType === 'ONE_DAY') {
    finalQuestDate = quest_date || new Date().toISOString().substring(0, 10);
  } else if (questType === 'DAILY') {
    finalStartDate = start_date || new Date().toISOString().substring(0, 10);
    finalEndDate = end_date || null;
  }

  const result = await db.query(
    `INSERT INTO quests (user_id, title, description, category, difficulty, type, quest_date, start_date, end_date, xp_reward, gold_reward, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE')
     RETURNING id, user_id, title, description, category, difficulty, type, quest_date, start_date, end_date, xp_reward, gold_reward, status, created_at, updated_at;`,
    [userId, title, description, category, difficulty, questType, finalQuestDate, finalStartDate, finalEndDate, rewards.xp_reward, rewards.gold_reward]
  );

  const newQuest = result.rows[0];

  if (questType === 'DAILY') {
    await db.query(
      `INSERT INTO daily_quest_streaks (quest_id, user_id, current_streak, best_streak, last_completed_date)
       VALUES ($1, $2, 0, 0, NULL)
       ON CONFLICT (quest_id) DO NOTHING;`,
      [newQuest.id, userId]
    );
  }

  return formatQuestRow({
    ...newQuest,
    dqs_current_streak: 0,
    dqs_best_streak: 0,
    dqs_last_completed_date: null,
    is_completed_today: false
  });
}

/**
 * Retrieves all quests belonging to the authenticated user with today's completion status & individual streaks.
 */
async function getUserQuests(userId) {
  const result = await db.query(
    `SELECT q.id, q.user_id, q.title, q.description, q.category, q.difficulty, q.type, q.quest_date, q.start_date, q.end_date, q.xp_reward, q.gold_reward, q.status, q.created_at, q.completed_at, q.updated_at,
            dqs.current_streak AS dqs_current_streak,
            dqs.best_streak AS dqs_best_streak,
            dqs.last_completed_date AS dqs_last_completed_date,
            CASE 
              WHEN q.type = 'DAILY' THEN EXISTS (
                SELECT 1 FROM quest_completions qc 
                WHERE qc.quest_id = q.id AND qc.completed_date = CURRENT_DATE
              )
              ELSE (q.status = 'COMPLETED')
            END AS is_completed_today
     FROM quests q
     LEFT JOIN daily_quest_streaks dqs ON dqs.quest_id = q.id
     WHERE q.user_id = $1
     ORDER BY q.created_at DESC;`,
    [userId]
  );

  return result.rows.map(row => formatQuestRow(row));
}

/**
 * Retrieves a single quest with user ownership verification, completion status, and streak.
 */
async function getQuestById(userId, questId) {
  const result = await db.query(
    `SELECT q.id, q.user_id, q.title, q.description, q.category, q.difficulty, q.type, q.quest_date, q.start_date, q.end_date, q.xp_reward, q.gold_reward, q.status, q.created_at, q.completed_at, q.updated_at,
            dqs.current_streak AS dqs_current_streak,
            dqs.best_streak AS dqs_best_streak,
            dqs.last_completed_date AS dqs_last_completed_date,
            CASE 
              WHEN q.type = 'DAILY' THEN EXISTS (
                SELECT 1 FROM quest_completions qc 
                WHERE qc.quest_id = q.id AND qc.completed_date = CURRENT_DATE
              )
              ELSE (q.status = 'COMPLETED')
            END AS is_completed_today
     FROM quests q
     LEFT JOIN daily_quest_streaks dqs ON dqs.quest_id = q.id
     WHERE q.id = $1 AND q.user_id = $2;`,
    [questId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Quest not found.');
    error.statusCode = 404;
    throw error;
  }

  return formatQuestRow(result.rows[0]);
}

/**
 * Updates an active quest belonging to the authenticated user.
 * Recalculates rewards if difficulty changes.
 */
async function updateQuest(userId, questId, data) {
  const existingQuest = await getQuestById(userId, questId);

  if (existingQuest.status === 'COMPLETED' && existingQuest.type === 'ONE_DAY') {
    const error = new Error('Completed quests cannot be modified.');
    error.statusCode = 400;
    throw error;
  }

  const title = data.title !== undefined ? data.title : existingQuest.title;
  const description = data.description !== undefined ? data.description : existingQuest.description;
  const category = data.category !== undefined ? data.category : existingQuest.category;
  const difficulty = data.difficulty !== undefined ? data.difficulty : existingQuest.difficulty;
  const type = data.type !== undefined ? data.type : existingQuest.type;
  
  let quest_date = existingQuest.quest_date;
  if (data.quest_date !== undefined || data.date !== undefined) {
    const rawDate = data.quest_date !== undefined ? data.quest_date : data.date;
    quest_date = type === 'ONE_DAY' ? (rawDate || new Date().toISOString().substring(0, 10)) : null;
  }

  let start_date = existingQuest.start_date;
  if (data.start_date !== undefined) {
    start_date = type === 'DAILY' ? data.start_date : null;
  }

  let end_date = existingQuest.end_date;
  if (data.end_date !== undefined) {
    end_date = type === 'DAILY' ? data.end_date : null;
  }

  const rewards = DIFFICULTY_REWARDS[difficulty];
  const xp_reward = rewards.xp_reward;
  const gold_reward = rewards.gold_reward;

  const result = await db.query(
    `UPDATE quests
     SET title = $1, description = $2, category = $3, difficulty = $4, type = $5, quest_date = $6, start_date = $7, end_date = $8, xp_reward = $9, gold_reward = $10, updated_at = CURRENT_TIMESTAMP
     WHERE id = $11 AND user_id = $12
     RETURNING id, user_id, title, description, category, difficulty, type, quest_date, start_date, end_date, xp_reward, gold_reward, status, created_at, completed_at, updated_at;`,
    [title, description, category, difficulty, type, quest_date, start_date, end_date, xp_reward, gold_reward, questId, userId]
  );

  const updatedQuestRow = result.rows[0];

  if (type === 'DAILY') {
    await db.query(
      `INSERT INTO daily_quest_streaks (quest_id, user_id, current_streak, best_streak, last_completed_date)
       VALUES ($1, $2, 0, 0, NULL)
       ON CONFLICT (quest_id) DO NOTHING;`,
      [questId, userId]
    );
  }

  return getQuestById(userId, questId);
}

/**
 * Deletes a quest belonging to the authenticated user.
 */
async function deleteQuest(userId, questId) {
  await getQuestById(userId, questId);

  const result = await db.query(
    `DELETE FROM quests WHERE id = $1 AND user_id = $2 RETURNING id;`,
    [questId, userId]
  );

  // Sync category completion counts after quest deletion
  await rpgService.syncCharacterAttributes(db, userId);

  return { id: result.rows[0].id };
}

/**
 * Completes an active or daily quest executing an atomic database transaction with row-level locking.
 * Handles individual Daily Quest streaks (1 completion per calendar date) vs One-Day Quest completion.
 */
async function completeQuest(userId, questId, testDateString = null) {
  const client = await db.getClient();
  const completionDate = testDateString || new Date().toISOString().substring(0, 10);

  try {
    await client.query('BEGIN');

    // 1. Lock Quest FOR UPDATE
    const questRes = await client.query(
      `SELECT id, user_id, title, category, difficulty, type, quest_date, start_date, end_date, xp_reward, gold_reward, status
       FROM quests
       WHERE id = $1 AND user_id = $2
       FOR UPDATE;`,
      [questId, userId]
    );

    if (questRes.rows.length === 0) {
      const error = new Error('Quest not found.');
      error.statusCode = 404;
      throw error;
    }

    const quest = questRes.rows[0];

    // Format dates for bound checks if set
    const startDateStr = quest.start_date
      ? (typeof quest.start_date === 'string' ? quest.start_date.substring(0, 10) : new Date(quest.start_date).toISOString().substring(0, 10))
      : null;
    const endDateStr = quest.end_date
      ? (typeof quest.end_date === 'string' ? quest.end_date.substring(0, 10) : new Date(quest.end_date).toISOString().substring(0, 10))
      : null;

    if (quest.type === 'DAILY') {
      if (startDateStr && completionDate < startDateStr) {
        const error = new Error(`Quest is not active yet (starts on ${startDateStr}).`);
        error.statusCode = 400;
        throw error;
      }

      if (endDateStr && completionDate > endDateStr) {
        const error = new Error(`Quest has expired (ended on ${endDateStr}).`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Check completion status depending on quest type
    if (quest.type === 'ONE_DAY') {
      if (quest.status === 'COMPLETED') {
        const error = new Error('This quest has already been completed.');
        error.statusCode = 400;
        throw error;
      }
    } else if (quest.type === 'DAILY') {
      // Check if daily quest has already been completed on completionDate
      const existingComp = await client.query(
        `SELECT id FROM quest_completions 
         WHERE quest_id = $1 AND completed_date = $2::DATE;`,
        [questId, completionDate]
      );

      if (existingComp.rows.length > 0) {
        const error = new Error('You have already completed this daily quest today.');
        error.statusCode = 400;
        throw error;
      }
    }

    // 2. Lock Character FOR UPDATE
    const charRes = await client.query(
      `SELECT id, level, total_xp, gold, strength, intellect, focus, knowledge, discipline
       FROM characters
       WHERE user_id = $1
       FOR UPDATE;`,
      [userId]
    );

    if (charRes.rows.length === 0) {
      const error = new Error('Character record not found.');
      error.statusCode = 404;
      throw error;
    }

    const char = charRes.rows[0];

    // 3. Lock Global User Streak FOR UPDATE
    const streakRes = await client.query(
      `SELECT id, current_streak, best_streak, last_activity_date
       FROM streaks
       WHERE user_id = $1
       FOR UPDATE;`,
      [userId]
    );

    const streak = streakRes.rows[0] || { current_streak: 0, best_streak: 0, last_activity_date: null };

    // 4. Lock Individual Daily Quest Streak FOR UPDATE (if DAILY)
    let dqs = { current_streak: 0, best_streak: 0, last_completed_date: null };
    if (quest.type === 'DAILY') {
      const dqsRes = await client.query(
        `SELECT id, current_streak, best_streak, last_completed_date
         FROM daily_quest_streaks
         WHERE quest_id = $1
         FOR UPDATE;`,
        [questId]
      );
      if (dqsRes.rows.length > 0) {
        dqs = dqsRes.rows[0];
      }
    }

    // 5. Map Category -> Attribute according to RULES.md
    const mappedAttribute = CATEGORY_ATTRIBUTE_MAP[quest.category];
    const attributeCol = rpgService.getCharacterAttributeColumn(quest.category);
    if (!mappedAttribute || !attributeCol) {
      const error = new Error('Invalid quest category attribute mapping.');
      error.statusCode = 500;
      throw error;
    }

    // 6. Create quest_completions record with completed_date
    const completionRes = await client.query(
      `INSERT INTO quest_completions (quest_id, user_id, xp_earned, gold_earned, attribute, completed_date, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6::DATE, CURRENT_TIMESTAMP)
       RETURNING id, quest_id, user_id, xp_earned, gold_earned, attribute, completed_date, completed_at;`,
      [quest.id, userId, quest.xp_reward, quest.gold_reward, mappedAttribute, completionDate]
    );

    // 7. Update Quest status & completion timestamp
    let updatedQuestRes;
    if (quest.type === 'ONE_DAY') {
      updatedQuestRes = await client.query(
        `UPDATE quests
         SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING id, title, category, difficulty, type, quest_date, start_date, end_date, xp_reward, gold_reward, status, completed_at, updated_at;`,
        [quest.id, userId]
      );
    } else {
      updatedQuestRes = await client.query(
        `UPDATE quests
         SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING id, title, category, difficulty, type, quest_date, start_date, end_date, xp_reward, gold_reward, status, completed_at, updated_at;`,
        [quest.id, userId]
      );
    }

    // 8. Calculate Character Updates (XP, Level, Gold) and Sync Category Completion Counts
    const newTotalXP = char.total_xp + quest.xp_reward;
    const newGold = char.gold + quest.gold_reward;
    const newLevel = rpgService.calculateLevelFromXP(newTotalXP);

    await client.query(
      `UPDATE characters
       SET total_xp = $1, level = $2, gold = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4;`,
      [newTotalXP, newLevel, newGold, userId]
    );

    const updatedCharRow = await rpgService.syncCharacterAttributes(client, userId);

    // 9. Update Global User Streak
    const streakUpdate = rpgService.calculateStreakUpdate(
      streak.last_activity_date,
      streak.current_streak,
      streak.best_streak,
      completionDate
    );

    const updatedStreakRes = await client.query(
      `INSERT INTO streaks (user_id, current_streak, best_streak, last_activity_date, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE
       SET current_streak = EXCLUDED.current_streak,
           best_streak = EXCLUDED.best_streak,
           last_activity_date = EXCLUDED.last_activity_date,
           updated_at = CURRENT_TIMESTAMP
       RETURNING id, current_streak, best_streak, last_activity_date;`,
      [userId, streakUpdate.current_streak, streakUpdate.best_streak, streakUpdate.last_activity_date]
    );

    // 10. Update Individual Daily Quest Streak (if DAILY)
    let updatedDqsRow = null;
    if (quest.type === 'DAILY') {
      const indStreakUpdate = rpgService.calculateIndividualStreakUpdate(
        dqs.last_completed_date,
        dqs.current_streak,
        dqs.best_streak,
        completionDate
      );

      const dqsUpsertRes = await client.query(
        `INSERT INTO daily_quest_streaks (quest_id, user_id, current_streak, best_streak, last_completed_date, updated_at)
         VALUES ($1, $2, $3, $4, $5::DATE, CURRENT_TIMESTAMP)
         ON CONFLICT (quest_id) DO UPDATE
         SET current_streak = EXCLUDED.current_streak,
             best_streak = EXCLUDED.best_streak,
             last_completed_date = EXCLUDED.last_completed_date,
             updated_at = CURRENT_TIMESTAMP
         RETURNING id, quest_id, current_streak, best_streak, last_completed_date;`,
        [quest.id, userId, indStreakUpdate.current_streak, indStreakUpdate.best_streak, indStreakUpdate.last_completed_date]
      );
      updatedDqsRow = dqsUpsertRes.rows[0];
    }

    await client.query('COMMIT');

    const formattedQuest = formatQuestRow({
      ...updatedQuestRes.rows[0],
      dqs_current_streak: updatedDqsRow ? updatedDqsRow.current_streak : 0,
      dqs_best_streak: updatedDqsRow ? updatedDqsRow.best_streak : 0,
      dqs_last_completed_date: updatedDqsRow ? updatedDqsRow.last_completed_date : null,
      is_completed_today: true
    }, completionDate);

    return {
      quest: formattedQuest,
      completion: completionRes.rows[0],
      character: updatedCharRow,
      streak: updatedStreakRes.rows[0]
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createQuest,
  getUserQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
  completeQuest
};
