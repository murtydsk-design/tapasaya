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

module.exports = router;
