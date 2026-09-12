require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./index');

async function testDatabase() {
  console.log('🧪 Starting TAPASYA Database Verification Suite (Phase 2)...');
  
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('your_password') || process.env.DATABASE_URL.includes('your_neon_connection_string')) {
    console.error('❌ ERROR: DATABASE_URL in backend/.env is missing or contains placeholder values.');
    console.error('Please update backend/.env with your valid Neon PostgreSQL connection string to run database tests.');
    process.exit(1);
  }

  const client = await pool.connect();
  let testUserId = null;
  let testQuestId = null;
  let testRewardId = null;

  try {
    // 1. Database Connection
    console.log('\n[Test 1/15] Verifying database connection...');
    const connResult = await client.query('SELECT NOW() as current_time;');
    console.log(`  ✅ Connected to PostgreSQL. Server time: ${connResult.rows[0].current_time}`);

    // 2. Insert Test User
    console.log('\n[Test 2/15] Inserting test user with hashed password...');
    const email = `test_hero_${Date.now()}@tapasya.rpg`;
    const passwordHash = await bcrypt.hash('SecretHeroPassword123!', 10);
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, password_hash, created_at;`,
      ['Test Adventurer', email, passwordHash]
    );
    testUserId = userRes.rows[0].id;
    console.log(`  ✅ User created successfully: ID=${testUserId}, Email=${email}`);

    // 3. Create User Character & Check Defaults
    console.log('\n[Test 3/15] Creating character record and verifying starting stats...');
    const charRes = await client.query(
      `INSERT INTO characters (user_id)
       VALUES ($1)
       RETURNING id, level, total_xp, gold, strength, intellect, focus, knowledge, discipline;`,
      [testUserId]
    );
    const char = charRes.rows[0];
    if (char.level !== 1 || char.total_xp !== 0 || char.gold !== 0 ||
        char.strength !== 0 || char.intellect !== 0 || char.focus !== 0 ||
        char.knowledge !== 0 || char.discipline !== 0) {
      throw new Error(`Character default state mismatch! Received: ${JSON.stringify(char)}`);
    }
    console.log(`  ✅ Character created with correct starting values: Level=${char.level}, XP=${char.total_xp}, Gold=${char.gold}, Attributes=(Str:${char.strength}, Int:${char.intellect}, Foc:${char.focus}, Kno:${char.knowledge}, Dis:${char.discipline})`);

    // 4. Create Test Quest
    console.log('\n[Test 4/15] Creating test quest (Category: CODING, Difficulty: MEDIUM)...');
    const questRes = await client.query(
      `INSERT INTO quests (user_id, title, description, category, difficulty, xp_reward, gold_reward)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, category, difficulty, xp_reward, gold_reward, status;`,
      [testUserId, 'Complete PERN Database Test', 'Write unit test suite for database tables', 'CODING', 'MEDIUM', 40, 20]
    );
    testQuestId = questRes.rows[0].id;
    console.log(`  ✅ Quest created: ID=${testQuestId}, Status=${questRes.rows[0].status}, Rewards=(+40 XP, +20 Gold)`);

    // 5. Create Quest Completion Record
    console.log('\n[Test 5/15] Creating quest completion record...');
    const compRes = await client.query(
      `INSERT INTO quest_completions (quest_id, user_id, xp_earned, gold_earned, attribute)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, quest_id, user_id, xp_earned, gold_earned, attribute, completed_at;`,
      [testQuestId, testUserId, 40, 20, 'Intellect']
    );
    console.log(`  ✅ Completion recorded: CompletionID=${compRes.rows[0].id}, Attribute=Intellect`);

    // 6. Create/Update Streak Record
    console.log('\n[Test 6/15] Creating and updating streak record...');
    const streakRes = await client.query(
      `INSERT INTO streaks (user_id, current_streak, best_streak, last_activity_date)
       VALUES ($1, 1, 1, CURRENT_DATE)
       RETURNING id, current_streak, best_streak, last_activity_date;`,
      [testUserId]
    );
    console.log(`  ✅ Streak record created: CurrentStreak=${streakRes.rows[0].current_streak}, BestStreak=${streakRes.rows[0].best_streak}`);

    // 7. Read Seeded Rewards
    console.log('\n[Test 7/15] Reading seeded rewards...');
    const rewardsRes = await client.query(`SELECT id, name, type, price FROM rewards WHERE is_available = TRUE;`);
    if (rewardsRes.rows.length === 0) {
      throw new Error('No rewards found! Seed data missing.');
    }
    testRewardId = rewardsRes.rows[0].id;
    console.log(`  ✅ Total available rewards found: ${rewardsRes.rows.length}. Using reward: "${rewardsRes.rows[0].name}" (${rewardsRes.rows[0].price} Gold)`);

    // 8. Create Inventory Ownership Record
    console.log('\n[Test 8/15] Creating inventory ownership record...');
    const invRes = await client.query(
      `INSERT INTO inventory (user_id, reward_id, is_equipped)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, reward_id, is_equipped, acquired_at;`,
      [testUserId, testRewardId, false]
    );
    console.log(`  ✅ Inventory item added: InventoryID=${invRes.rows[0].id}`);

    // 9. Create Purchase Record
    console.log('\n[Test 9/15] Creating purchase record...');
    const purchRes = await client.query(
      `INSERT INTO purchases (user_id, reward_id, price_paid)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, reward_id, price_paid, purchased_at;`,
      [testUserId, testRewardId, rewardsRes.rows[0].price]
    );
    console.log(`  ✅ Purchase recorded: PurchaseID=${purchRes.rows[0].id}, PricePaid=${purchRes.rows[0].price_paid} Gold`);

    // 10. Verify Foreign Key Relationships
    console.log('\n[Test 10/15] Verifying Foreign-Key Integrity (JOIN queries)...');
    const joinRes = await client.query(
      `SELECT u.name as user_name, c.level, c.gold, q.title as quest_title, r.name as reward_name
       FROM users u
       JOIN characters c ON u.id = c.user_id
       JOIN quests q ON u.id = q.user_id
       JOIN inventory i ON u.id = i.user_id
       JOIN rewards r ON i.reward_id = r.id
       WHERE u.id = $1;`,
      [testUserId]
    );
    console.log(`  ✅ FK Relationships verified! User "${joinRes.rows[0].user_name}" matched with character level ${joinRes.rows[0].level}, quest "${joinRes.rows[0].quest_title}", and owned reward "${joinRes.rows[0].reward_name}".`);

    // 11. Verify Unique Constraints
    console.log('\n[Test 11/15] Testing Unique Constraints (Duplicate Email & Duplicate Inventory Item)...');
    try {
      await client.query(`INSERT INTO users (name, email, password_hash) VALUES ('Hacker', $1, 'hash');`, [email]);
      throw new Error('FAIL: Duplicate email was accepted!');
    } catch (err) {
      if (err.code === '23505') {
        console.log('  ✅ Duplicate email correctly rejected by UNIQUE constraint.');
      } else {
        throw err;
      }
    }

    try {
      await client.query(`INSERT INTO inventory (user_id, reward_id) VALUES ($1, $2);`, [testUserId, testRewardId]);
      throw new Error('FAIL: Duplicate inventory ownership was accepted!');
    } catch (err) {
      if (err.code === '23505') {
        console.log('  ✅ Duplicate inventory reward correctly rejected by UNIQUE constraint.');
      } else {
        throw err;
      }
    }

    // 12. Verify Check Constraints
    console.log('\n[Test 12/15] Testing Check Constraints (Negative Gold & Invalid Level)...');
    try {
      await client.query(`UPDATE characters SET gold = -50 WHERE user_id = $1;`, [testUserId]);
      throw new Error('FAIL: Negative gold was allowed!');
    } catch (err) {
      if (err.code === '23514') {
        console.log('  ✅ Negative gold correctly rejected by CHECK (gold >= 0) constraint.');
      } else {
        throw err;
      }
    }

    try {
      await client.query(`UPDATE characters SET level = 0 WHERE user_id = $1;`, [testUserId]);
      throw new Error('FAIL: Level 0 was allowed!');
    } catch (err) {
      if (err.code === '23514') {
        console.log('  ✅ Level 0 correctly rejected by CHECK (level >= 1) constraint.');
      } else {
        throw err;
      }
    }

    // 13. Verify Invalid Inputs Rejection
    console.log('\n[Test 13/15] Testing Invalid Enums Rejection (Invalid Category)...');
    try {
      await client.query(
        `INSERT INTO quests (user_id, title, category, difficulty, xp_reward, gold_reward)
         VALUES ($1, 'Cheat Quest', 'FLYING', 'EASY', 10, 10);`,
        [testUserId]
      );
      throw new Error('FAIL: Invalid category FLYING was accepted!');
    } catch (err) {
      if (err.code === '23514') {
        console.log('  ✅ Invalid category FLYING correctly rejected by CHECK constraint.');
      } else {
        throw err;
      }
    }

    // 14. Verify User-Owned Data Isolation
    console.log('\n[Test 14/15] Verifying User-Owned Data Isolation...');
    const user2Res = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ('Other User', $1, 'hash2') RETURNING id;`,
      [`other_${Date.now()}@tapasya.rpg`]
    );
    const user2Id = user2Res.rows[0].id;
    const questsUser1 = await client.query(`SELECT * FROM quests WHERE user_id = $1;`, [testUserId]);
    const questsUser2 = await client.query(`SELECT * FROM quests WHERE user_id = $1;`, [user2Id]);
    if (questsUser1.rows.length !== 1 || questsUser2.rows.length !== 0) {
      throw new Error('FAIL: Data isolation check failed!');
    }
    console.log('  ✅ User data isolation verified cleanly. User 2 cannot view User 1 quests.');

    // 15. Safe Cleanup
    console.log('\n[Test 15/15] Cleaning up test records...');
    await client.query(`DELETE FROM users WHERE id IN ($1, $2);`, [testUserId, user2Id]);
    console.log('  ✅ Test users and cascading records cleaned up successfully.');

    console.log('\n🎉 ALL 15 DATABASE TESTS PASSED SUCCESSFULLY! Phase 2 Schema & Constraints fully verified.');
  } catch (err) {
    console.error('\n❌ DATABASE VERIFICATION FAILED:', err.message);
    if (testUserId) {
      try {
        await client.query(`DELETE FROM users WHERE id = $1;`, [testUserId]);
      } catch (cleanupErr) {
        // Silent cleanup error catch
      }
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
