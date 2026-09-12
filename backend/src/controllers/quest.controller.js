const questValidator = require('../validators/quest.validator');
const questService = require('../services/quest.service');

/**
 * Creates a new quest: POST /api/quests
 */
exports.createQuest = async (req, res, next) => {
  try {
    const validation = questValidator.validateCreateQuest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const quest = await questService.createQuest(req.user.id, validation.normalizedData);

    return res.status(201).json({
      success: true,
      message: 'Quest created successfully.',
      data: quest
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves all quests belonging to the authenticated user: GET /api/quests
 */
exports.getQuests = async (req, res, next) => {
  try {
    const quests = await questService.getUserQuests(req.user.id);
    return res.status(200).json({
      success: true,
      data: quests
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves a single quest by ID: GET /api/quests/:id
 */
exports.getQuestById = async (req, res, next) => {
  try {
    const idValidation = questValidator.validateQuestId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.message
      });
    }

    const quest = await questService.getQuestById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: quest
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates an active quest: PUT /api/quests/:id
 */
exports.updateQuest = async (req, res, next) => {
  try {
    const idValidation = questValidator.validateQuestId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.message
      });
    }

    const validation = questValidator.validateUpdateQuest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const updatedQuest = await questService.updateQuest(req.user.id, req.params.id, validation.normalizedData);

    return res.status(200).json({
      success: true,
      message: 'Quest updated successfully.',
      data: updatedQuest
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a quest: DELETE /api/quests/:id
 */
exports.deleteQuest = async (req, res, next) => {
  try {
    const idValidation = questValidator.validateQuestId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.message
      });
    }

    await questService.deleteQuest(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Quest deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Completes an active quest: POST /api/quests/:id/complete
 */
exports.completeQuest = async (req, res, next) => {
  try {
    const idValidation = questValidator.validateQuestId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.message
      });
    }

    const result = await questService.completeQuest(req.user.id, req.params.id);

    const isDaily = result.quest.type === 'DAILY';
    const streakObj = result.quest.streak;

    return res.status(200).json({
      success: true,
      message: isDaily ? 'Quest completed for today!' : 'Quest completed successfully!',
      xpEarned: result.completion.xp_earned,
      goldEarned: result.completion.gold_earned,
      currentStreak: isDaily && streakObj ? streakObj.current : undefined,
      bestStreak: isDaily && streakObj ? streakObj.best : undefined,
      completedToday: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};
