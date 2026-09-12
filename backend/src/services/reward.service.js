const db = require('../config/db');

/**
 * Get all rewards that are marked as available.
 */
async function getAvailableRewards() {
  const result = await db.query(
    `SELECT id, name, description, type, price, is_available, created_at, updated_at
     FROM rewards
     WHERE is_available = TRUE
     ORDER BY price ASC, name ASC`
  );
  return result.rows;
}

/**
 * Get details of a single reward by ID.
 */
async function getRewardById(rewardId) {
  const result = await db.query(
    `SELECT id, name, description, type, price, is_available, created_at, updated_at
     FROM rewards
     WHERE id = $1`,
    [rewardId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Purchase a reward for an authenticated user.
 * Executes within an atomic PostgreSQL transaction with FOR UPDATE row-locking.
 */
async function purchaseReward(userId, rewardId) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Lock and retrieve user's character for Gold balance authority
    const charResult = await client.query(
      `SELECT id, user_id, gold FROM characters WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    if (charResult.rows.length === 0) {
      const error = new Error('Character not found for user.');
      error.statusCode = 404;
      throw error;
    }

    const character = charResult.rows[0];

    // 2. Retrieve reward from PostgreSQL (authority for price & availability)
    const rewardResult = await client.query(
      `SELECT id, name, description, type, price, is_available FROM rewards WHERE id = $1`,
      [rewardId]
    );

    if (rewardResult.rows.length === 0) {
      const error = new Error('Reward not found.');
      error.statusCode = 404;
      throw error;
    }

    const reward = rewardResult.rows[0];

    // 3. Verify reward availability
    if (!reward.is_available) {
      const error = new Error('Reward is not available for purchase.');
      error.statusCode = 400;
      throw error;
    }

    // 4. Verify user has sufficient Gold
    if (character.gold < reward.price) {
      const error = new Error('Insufficient Gold');
      error.statusCode = 400;
      throw error;
    }

    // 5. Verify user does not already own the reward
    const existingInventory = await client.query(
      `SELECT id FROM inventory WHERE user_id = $1 AND reward_id = $2`,
      [userId, rewardId]
    );

    if (existingInventory.rows.length > 0) {
      const error = new Error('You already own this reward.');
      error.statusCode = 400;
      throw error;
    }

    // 6. Deduct exact database reward price from user's character Gold
    const updatedCharResult = await client.query(
      `UPDATE characters 
       SET gold = gold - $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING gold`,
      [reward.price, character.id]
    );
    const newGold = updatedCharResult.rows[0].gold;

    // 7. Create inventory record
    const inventoryResult = await client.query(
      `INSERT INTO inventory (user_id, reward_id, is_equipped, acquired_at)
       VALUES ($1, $2, FALSE, NOW())
       RETURNING id, user_id, reward_id, is_equipped, acquired_at`,
      [userId, rewardId]
    );
    const inventoryItem = inventoryResult.rows[0];

    // 8. Create purchase record using authoritative database price
    const purchaseResult = await client.query(
      `INSERT INTO purchases (user_id, reward_id, price_paid, purchased_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, user_id, reward_id, price_paid, purchased_at`,
      [userId, rewardId, reward.price]
    );
    const purchaseRecord = purchaseResult.rows[0];

    await client.query('COMMIT');

    return {
      inventory: inventoryItem,
      purchase: purchaseRecord,
      reward: {
        id: reward.id,
        name: reward.name,
        type: reward.type,
        price: reward.price
      },
      remaining_gold: newGold
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getAvailableRewards,
  getRewardById,
  purchaseReward
};
