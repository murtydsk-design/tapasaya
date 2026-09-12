const rewardService = require('../services/reward.service');
const { validateRewardId } = require('../validators/reward.validator');

exports.getRewards = async (req, res, next) => {
  try {
    const rewards = await rewardService.getAvailableRewards();
    return res.status(200).json({
      success: true,
      message: 'Available rewards retrieved successfully.',
      data: rewards
    });
  } catch (error) {
    next(error);
  }
};

exports.getRewardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validation = validateRewardId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const reward = await rewardService.getRewardById(id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reward details retrieved successfully.',
      data: reward
    });
  } catch (error) {
    next(error);
  }
};

exports.purchaseReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validation = validateRewardId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const userId = req.user.id;
    const result = await rewardService.purchaseReward(userId, id);

    return res.status(200).json({
      success: true,
      message: 'Reward purchased successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
