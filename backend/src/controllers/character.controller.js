const db = require('../config/db');
const rpgService = require('../services/rpg.service');

/**
 * Retrieves the authenticated user's RPG character state: GET /api/character
 */
exports.getCharacter = async (req, res, next) => {
  try {
    // Sync category completion counts to guarantee accuracy
    const character = await rpgService.syncCharacterAttributes(db, req.user.id);

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: character
    });
  } catch (err) {
    next(err);
  }
};
