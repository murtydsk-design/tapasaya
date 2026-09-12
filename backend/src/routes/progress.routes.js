const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.get('/', progressController.getProgress);

module.exports = router;
