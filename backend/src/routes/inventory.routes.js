const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', inventoryController.getInventory);
router.post('/:id/equip', inventoryController.equipItem);

module.exports = router;
