const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const questRoutes = require('./quest.routes');
const characterRoutes = require('./character.routes');
const progressRoutes = require('./progress.routes');
const rewardRoutes = require('./reward.routes');
const inventoryRoutes = require('./inventory.routes');
const profileRoutes = require('./profile.routes');

// Mount Feature Sub-routers
router.use('/auth', authRoutes);
router.use('/quests', questRoutes);
router.use('/character', characterRoutes);
router.use('/progress', progressRoutes);
router.use('/rewards', rewardRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
