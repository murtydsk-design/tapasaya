const express = require('express');
const router = express.Router();
const characterController = require('../controllers/character.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.get('/', characterController.getCharacter);

module.exports = router;
