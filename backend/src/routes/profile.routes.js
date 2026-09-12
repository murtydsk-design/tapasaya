const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', profileController.getProfile);
router.patch('/avatar', profileController.updateAvatar);

module.exports = router;
