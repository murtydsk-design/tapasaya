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

/**
 * Handles updating authenticated user profile avatar: PATCH /api/profile/avatar
 */
exports.updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { avatar_type, avatar_id } = req.body;

    const updatedUser = await profileService.updateUserAvatar(userId, { avatar_type, avatar_id });

    return res.status(200).json({
      success: true,
      message: 'Profile avatar updated successfully.',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};
