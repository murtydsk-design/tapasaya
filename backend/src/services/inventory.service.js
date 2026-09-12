const db = require('../config/db');

/**
 * Retrieve owned inventory items for a specific authenticated user.
 */
async function getUserInventory(userId) {
  const result = await db.query(
    `SELECT 
       i.id AS inventory_id,
       i.user_id,
       i.reward_id,
       i.is_equipped,
       i.acquired_at,
       r.name AS reward_name,
       r.description AS reward_description,
       r.type AS reward_type,
       r.price AS reward_price
     FROM inventory i
     JOIN rewards r ON i.reward_id = r.id
     WHERE i.user_id = $1
     ORDER BY i.acquired_at DESC`,
    [userId]
  );

  return result.rows.map(row => ({
    id: row.inventory_id,
    user_id: row.user_id,
    reward_id: row.reward_id,
    is_equipped: row.is_equipped,
    acquired_at: row.acquired_at,
    reward: {
      id: row.reward_id,
      name: row.reward_name,
      description: row.reward_description,
      type: row.reward_type,
      price: row.reward_price
    }
  }));
}

/**
 * Equip an owned inventory item for an authenticated user.
 * Toggles equipment state while maintaining slot consistency per reward type.
 */
async function equipItem(userId, inventoryId) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Fetch target inventory record and ensure user ownership
    const itemResult = await client.query(
      `SELECT i.id, i.user_id, i.reward_id, i.is_equipped, r.type AS reward_type, r.name AS reward_name
       FROM inventory i
       JOIN rewards r ON i.reward_id = r.id
       WHERE i.id = $1 AND i.user_id = $2`,
      [inventoryId, userId]
    );

    if (itemResult.rows.length === 0) {
      const error = new Error('Inventory item not found or not owned by user.');
      error.statusCode = 404;
      throw error;
    }

    const item = itemResult.rows[0];

    const newEquipStatus = !item.is_equipped;

    if (newEquipStatus) {
      // Unequip all other items of the same reward type for this user to maintain consistency
      await client.query(
        `UPDATE inventory
         SET is_equipped = FALSE
         WHERE user_id = $1 AND reward_id IN (
           SELECT id FROM rewards WHERE type = $2
         )`,
        [userId, item.reward_type]
      );
    }

    // Set target item equip status
    const updateResult = await client.query(
      `UPDATE inventory
       SET is_equipped = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, reward_id, is_equipped, acquired_at`,
      [newEquipStatus, inventoryId, userId]
    );

    await client.query('COMMIT');

    const updatedItem = updateResult.rows[0];
    return {
      ...updatedItem,
      reward: {
        id: item.reward_id,
        name: item.reward_name,
        type: item.reward_type
      }
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getUserInventory,
  equipItem
};
