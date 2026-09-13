const express = require('express');
const router = express.Router();
const questController = require('../controllers/quest.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protect all Quest API endpoints with Authentication Middleware
router.use(authenticateToken);

router.get('/', questController.getQuests);
router.post('/', questController.createQuest);
router.get('/:id', questController.getQuestById);
router.put('/:id', questController.updateQuest);
router.delete('/:id', questController.deleteQuest);
router.post('/:id/complete', questController.completeQuest);

// Timer API Endpoints
router.get('/:id/timer', questController.getTimer);
router.post('/:id/timer/start', questController.startTimer);
router.post('/:id/timer/pause', questController.pauseTimer);
router.post('/:id/timer/resume', questController.resumeTimer);
router.post('/:id/timer/reset', questController.resetTimer);

module.exports = router;
