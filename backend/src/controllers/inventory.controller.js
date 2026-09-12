const inventoryService = require('../services/inventory.service');
const { validateInventoryId } = require('../validators/reward.validator');

exports.getInventory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const inventory = await inventoryService.getUserInventory(userId);
    return res.status(200).json({
      success: true,
      message: 'Inventory retrieved successfully.',
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

exports.equipItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validation = validateInventoryId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const userId = req.user.id;
    const updatedItem = await inventoryService.equipItem(userId, id);

    return res.status(200).json({
      success: true,
      message: 'Item equipment status updated successfully.',
      data: updatedItem
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
