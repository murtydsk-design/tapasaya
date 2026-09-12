const profileService = require('../services/profile.service');

/**
 * Handles retrieving authenticated user profile: GET /api/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const profileData = await profileService.getUserProfile(userId, page, limit);

    return res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (err) {
    next(err);
  }
};
