const db = require('../config/db');
const rpgService = require('../services/rpg.service');

/**
 * Retrieves the authenticated user's complete RPG progress summary: GET /api/progress
 */
exports.getProgress = async (req, res, next) => {
  try {
    // Sync category completion counts to guarantee accuracy
    const char = await rpgService.syncCharacterAttributes(db, req.user.id);

    if (!char) {
      return res.status(404).json({
        success: false,
        message: 'Character record not found.'
      });
    }

    const streakRes = await db.query(
      `SELECT current_streak, best_streak, last_activity_date
       FROM streaks
       WHERE user_id = $1;`,
      [req.user.id]
    );

    const streak = streakRes.rows[0] || {
      current_streak: 0,
      best_streak: 0,
      last_activity_date: null
    };

    // Calculate dynamic XP progress details for frontend XP bar
    const xpDetails = rpgService.calculateProgressDetails(char.total_xp);

    return res.status(200).json({
      success: true,
      data: {
        level: xpDetails.level,
        total_xp: xpDetails.total_xp,
        gold: char.gold,
        xp_required_for_next_level: xpDetails.xp_required_for_next_level,
        xp_in_current_level: xpDetails.xp_in_current_level,
        xp_for_next_level: xpDetails.xp_for_next_level,
        progress_percent: xpDetails.progress_percent,
        attributes: {
          strength: char.strength,
          intellect: char.intellect,
          focus: char.focus,
          knowledge: char.knowledge,
          discipline: char.discipline
        },
        streak: {
          current_streak: streak.current_streak,
          best_streak: streak.best_streak,
          last_activity_date: streak.last_activity_date
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
