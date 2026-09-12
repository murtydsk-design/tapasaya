const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', rewardController.getRewards);
router.get('/:id', rewardController.getRewardById);
router.post('/:id/purchase', rewardController.purchaseReward);

module.exports = router;
