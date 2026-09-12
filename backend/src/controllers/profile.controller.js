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
    let avatar_type = req.body?.avatar_type;
    let avatar_id = req.body?.avatar_id;
    let custom_url = req.body?.custom_url;

    if (req.file) {
      avatar_type = 'custom';
      custom_url = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedUser = await profileService.updateUserAvatar(userId, {
      avatar_type,
      avatar_id,
      custom_url
    });

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
