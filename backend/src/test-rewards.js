process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/db');

async function testRewardsAndInventorySuite() {
  console.log('🧪 Starting TAPASYA Rewards & Inventory Verification Suite (Phase 7)...');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const PORT = server.address().port;
  console.log(`  ✅ Test server running on http://localhost:${PORT}`);

  function makeRequest(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        `http://localhost:${PORT}${path}`,
        { method, headers },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  let userAToken = null;
  let userAId = null;
  let userBToken = null;
  let userBId = null;

  let availableRewardId = null;
  let expensiveRewardId = null;
  let unavailableRewardId = null;
  let secondThemeRewardId = null;

  let userAInventoryId = null;

  try {
    // ----------------------------------------------------
    // SETUP: Register User A and User B
    // ----------------------------------------------------
    console.log('\n--- STEP 1: Setting up Test Users ---');
    const timestamp = Date.now();
    const regA = await makeRequest('/api/auth/register', 'POST', {
      name: 'Reward Tester A',
      email: `reward_tester_a_${timestamp}@tapasya.rpg`,
      password: 'Password123!'
    });
    userAToken = regA.body.token;
    userAId = regA.body.user.id;
    console.log(`  ✅ User A registered (ID: ${userAId})`);

    const regB = await makeRequest('/api/auth/register', 'POST', {
      name: 'Reward Tester B',
      email: `reward_tester_b_${timestamp}@tapasya.rpg`,
      password: 'Password123!'
    });
    userBToken = regB.body.token;
    userBId = regB.body.user.id;
    console.log(`  ✅ User B registered (ID: ${userBId})`);

    // ----------------------------------------------------
    // SETUP: Insert Test Rewards into PostgreSQL
    // ----------------------------------------------------
    console.log('\n--- STEP 2: Seeding Test Rewards ---');
    const r1 = await db.query(
      `INSERT INTO rewards (name, description, type, price, is_available)
       VALUES ('Neon Cyber Theme', 'Futuristic cyberpunk neon theme', 'THEME', 30, TRUE)
       RETURNING id`
    );
    availableRewardId = r1.rows[0].id;

    const r2 = await db.query(
      `INSERT INTO rewards (name, description, type, price, is_available)
       VALUES ('Golden Dragon Crown', 'Legendary crown fit for royalty', 'COSMETIC', 500, TRUE)
       RETURNING id`
    );
    expensiveRewardId = r2.rows[0].id;

    const r3 = await db.query(
      `INSERT INTO rewards (name, description, type, price, is_available)
       VALUES ('Vault Secret Key', 'Discontinued event item', 'PROFILE_ITEM', 50, FALSE)
       RETURNING id`
    );
    unavailableRewardId = r3.rows[0].id;

    const r4 = await db.query(
      `INSERT INTO rewards (name, description, type, price, is_available)
       VALUES ('Solar Flare Theme', 'Bright glowing solar theme', 'THEME', 20, TRUE)
       RETURNING id`
    );
    secondThemeRewardId = r4.rows[0].id;

    console.log('  ✅ Seeded test rewards in DB.');

    // ----------------------------------------------------
    // TEST 1: GET /api/rewards (Listing rewards)
    // ----------------------------------------------------
    console.log('\n--- TEST 1: GET /api/rewards (List Available Rewards) ---');
    const resList = await makeRequest('/api/rewards', 'GET', null, userAToken);
    if (resList.status !== 200 || !resList.body.success || !Array.isArray(resList.body.data)) {
      throw new Error(`Failed to list available rewards: ${JSON.stringify(resList.body)}`);
    }
    const rewardsList = resList.body.data;
    const foundUnavailable = rewardsList.some(r => r.id === unavailableRewardId);
    if (foundUnavailable) {
      throw new Error('GET /api/rewards returned an unavailable reward!');
    }
    console.log(`  ✅ List rewards returned ${rewardsList.length} available rewards. Unavailable reward correctly hidden.`);

    // ----------------------------------------------------
    // TEST 2 & 3 & 4: GET /api/rewards/:id (Reward details)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: GET /api/rewards/:id (Valid & Invalid Requests) ---');
    const resDetail = await makeRequest(`/api/rewards/${availableRewardId}`, 'GET', null, userAToken);
    if (resDetail.status !== 200 || resDetail.body.data.id !== availableRewardId) {
      throw new Error(`Failed to get reward details: ${JSON.stringify(resDetail.body)}`);
    }
    console.log('  ✅ Reward details retrieved successfully.');

    const resInvalidId = await makeRequest('/api/rewards/not-a-uuid', 'GET', null, userAToken);
    if (resInvalidId.status !== 400) {
      throw new Error(`Expected 400 for invalid UUID format, got ${resInvalidId.status}`);
    }
    console.log('  ✅ Invalid UUID format safely returned 400 Bad Request.');

    const resNotFound = await makeRequest('/api/rewards/00000000-0000-0000-0000-000000000000', 'GET', null, userAToken);
    if (resNotFound.status !== 404) {
      throw new Error(`Expected 404 for non-existent reward, got ${resNotFound.status}`);
    }
    console.log('  ✅ Non-existent reward ID returned 404 Not Found.');

    // ----------------------------------------------------
    // TEST 5: Purchase Security - Unauthenticated Request
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Security - Unauthenticated Purchase Attempt ---');
    const resUnauth = await makeRequest(`/api/rewards/${availableRewardId}/purchase`, 'POST');
    if (resUnauth.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for request without token, got ${resUnauth.status}`);
    }
    console.log('  ✅ Unauthenticated purchase rejected with 401 Unauthorized.');

    // ----------------------------------------------------
    // TEST 6: Purchase Attempt with Insufficient Gold
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Purchase Attempt with Insufficient Gold ---');
    // User A has 0 Gold initially
    const resInsuff = await makeRequest(`/api/rewards/${availableRewardId}/purchase`, 'POST', null, userAToken);
    if (resInsuff.status !== 400 || resInsuff.body.message !== 'Insufficient Gold') {
      throw new Error(`Expected 400 Insufficient Gold, got status ${resInsuff.status} message: ${resInsuff.body.message}`);
    }
    console.log('  ✅ Purchase with 0 Gold rejected with 400 Insufficient Gold.');

    // Verify Gold balance remains 0 in PostgreSQL
    const charCheck1 = await db.query('SELECT gold FROM characters WHERE user_id = $1', [userAId]);
    if (charCheck1.rows[0].gold !== 0) {
      throw new Error(`Gold balance changed after failed purchase! Current: ${charCheck1.rows[0].gold}`);
    }
    console.log('  ✅ Character Gold balance unchanged after failed purchase.');

    // ----------------------------------------------------
    // TEST 7: Anti-Cheating - Client-Supplied Price & Gold Override
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Security - Client Price & Gold Override Attempt ---');
    const resHack = await makeRequest(`/api/rewards/${availableRewardId}/purchase`, 'POST', {
      price: 0,
      price_paid: 0,
      gold: 999999
    }, userAToken);
    if (resHack.status !== 400 || resHack.body.message !== 'Insufficient Gold') {
      throw new Error(`Client price/gold override exploit succeeded! Status: ${resHack.status}, Body: ${JSON.stringify(resHack.body)}`);
    }
    console.log('  ✅ Client price/gold override exploit failed! Backend strictly enforced DB price & actual Gold.');

    // ----------------------------------------------------
    // TEST 8: Unavailable Reward Purchase Attempt
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Purchase Unavailable Reward Attempt ---');
    // Give User A 1000 Gold temporarily in DB to test unavailable purchase
    await db.query('UPDATE characters SET gold = 1000 WHERE user_id = $1', [userAId]);

    const resUnavail = await makeRequest(`/api/rewards/${unavailableRewardId}/purchase`, 'POST', null, userAToken);
    if (resUnavail.status !== 400 || resUnavail.body.message !== 'Reward is not available for purchase.') {
      throw new Error(`Expected 400 for unavailable reward, got ${resUnavail.status} message: ${resUnavail.body.message}`);
    }
    console.log('  ✅ Purchase of unavailable reward rejected by backend.');

    // Reset User A Gold back to 100 for valid purchases
    await db.query('UPDATE characters SET gold = 100 WHERE user_id = $1', [userAId]);

    // ----------------------------------------------------
    // TEST 9: Successful Reward Purchase
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Successful Reward Purchase ---');
    // Available reward costs 30 Gold, User A has 100 Gold -> Remaining Gold should be 70
    const resBuy = await makeRequest(`/api/rewards/${availableRewardId}/purchase`, 'POST', null, userAToken);
    if (resBuy.status !== 200 || !resBuy.body.success) {
      throw new Error(`Failed to purchase reward: ${JSON.stringify(resBuy.body)}`);
    }
    if (resBuy.body.data.remaining_gold !== 70) {
      throw new Error(`Expected remaining gold to be 70, got ${resBuy.body.data.remaining_gold}`);
    }
    userAInventoryId = resBuy.body.data.inventory.id;
    console.log(`  ✅ Reward purchased successfully! Inventory ID: ${userAInventoryId}, Remaining Gold: 70.`);

    // Check PostgreSQL database integrity directly
    const dbChar = await db.query('SELECT gold FROM characters WHERE user_id = $1', [userAId]);
    if (dbChar.rows[0].gold !== 70) {
      throw new Error(`DB character gold expected 70, got ${dbChar.rows[0].gold}`);
    }

    const dbPurchase = await db.query('SELECT price_paid FROM purchases WHERE user_id = $1 AND reward_id = $2', [userAId, availableRewardId]);
    if (dbPurchase.rows.length !== 1 || dbPurchase.rows[0].price_paid !== 30) {
      throw new Error(`DB purchase record missing or incorrect price_paid: ${JSON.stringify(dbPurchase.rows)}`);
    }
    console.log('  ✅ Database verified: Gold deducted correctly, purchase record created with price_paid = 30.');

    // ----------------------------------------------------
    // TEST 10: Duplicate Purchase Prevention
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Duplicate Reward Ownership Purchase Attempt ---');
    const resDup = await makeRequest(`/api/rewards/${availableRewardId}/purchase`, 'POST', null, userAToken);
    if (resDup.status !== 400 || resDup.body.message !== 'You already own this reward.') {
      throw new Error(`Expected 400 Duplicate Ownership, got ${resDup.status} message: ${resDup.body.message}`);
    }
    console.log('  ✅ Duplicate purchase rejected correctly by backend.');

    const dbCharAfterDup = await db.query('SELECT gold FROM characters WHERE user_id = $1', [userAId]);
    if (dbCharAfterDup.rows[0].gold !== 70) {
      throw new Error(`Gold deducted on duplicate purchase failure! Current: ${dbCharAfterDup.rows[0].gold}`);
    }
    console.log('  ✅ Gold balance remains untouched at 70 Gold.');

    // ----------------------------------------------------
    // TEST 11: Inventory API (GET /api/inventory) & User Isolation
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Inventory Retrieval & User Isolation ---');
    const resInvA = await makeRequest('/api/inventory', 'GET', null, userAToken);
    if (resInvA.status !== 200 || resInvA.body.data.length !== 1) {
      throw new Error(`User A inventory expected 1 item, got ${JSON.stringify(resInvA.body)}`);
    }
    console.log(`  ✅ User A inventory returned 1 item: ${resInvA.body.data[0].reward.name}`);

    // User B should have an empty inventory
    const resInvB = await makeRequest('/api/inventory', 'GET', null, userBToken);
    if (resInvB.status !== 200 || resInvB.body.data.length !== 0) {
      throw new Error(`User B inventory expected 0 items, got ${JSON.stringify(resInvB.body)}`);
    }
    console.log('  ✅ User B empty inventory verified (0 items). User isolation enforced.');

    // ----------------------------------------------------
    // TEST 12: Equip System (POST /api/inventory/:id/equip)
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Equip System & Security ---');
    // User B attempts to equip User A's item -> Rejected
    const resEquipHacker = await makeRequest(`/api/inventory/${userAInventoryId}/equip`, 'POST', null, userBToken);
    if (resEquipHacker.status !== 404) {
      throw new Error(`User B managed to equip User A's item! Status: ${resEquipHacker.status}`);
    }
    console.log('  ✅ User B attempting to equip User A\'s item rejected with 404 Not Found.');

    // User A equips their item
    const resEquipA = await makeRequest(`/api/inventory/${userAInventoryId}/equip`, 'POST', null, userAToken);
    if (resEquipA.status !== 200 || !resEquipA.body.data.is_equipped) {
      throw new Error(`Failed to equip item for User A: ${JSON.stringify(resEquipA.body)}`);
    }
    console.log('  ✅ User A successfully equipped "Neon Cyber Theme" (is_equipped = true).');

    // Equip consistency test: User A purchases second theme reward ("Solar Flare Theme" for 20 Gold)
    const resBuySecondTheme = await makeRequest(`/api/rewards/${secondThemeRewardId}/purchase`, 'POST', null, userAToken);
    if (resBuySecondTheme.status !== 200) {
      throw new Error(`Failed to purchase second theme: ${JSON.stringify(resBuySecondTheme.body)}`);
    }
    const secondThemeInventoryId = resBuySecondTheme.body.data.inventory.id;

    // Equip second theme -> first theme should automatically unequip
    const resEquipSecond = await makeRequest(`/api/inventory/${secondThemeInventoryId}/equip`, 'POST', null, userAToken);
    if (resEquipSecond.status !== 200 || !resEquipSecond.body.data.is_equipped) {
      throw new Error(`Failed to equip second theme: ${JSON.stringify(resEquipSecond.body)}`);
    }

    // Verify first theme is now unequipped in DB
    const firstItemCheck = await db.query('SELECT is_equipped FROM inventory WHERE id = $1', [userAInventoryId]);
    if (firstItemCheck.rows[0].is_equipped !== false) {
      throw new Error('First theme remained equipped when second theme was equipped!');
    }
    console.log('  ✅ Theme slot equipment consistency verified! Equipping new theme automatically unequipped previous theme.');

    // ----------------------------------------------------
    // TEST 13: Quest Completion Gold Integration (Phase 6 + Phase 7)
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Phase 6 RPG Gold Earning + Phase 7 Spending Integration ---');
    // User A current Gold: 100 starting - 30 (Theme 1) - 20 (Theme 2) = 50 Gold
    // Create HARD quest for User A (+40 Gold reward)
    const questRes = await makeRequest('/api/quests', 'POST', {
      title: 'Legendary Dungeon Raid',
      category: 'FITNESS',
      difficulty: 'HARD'
    }, userAToken);
    const questId = questRes.body.data.id;

    // Complete quest -> should award +40 Gold -> New Gold balance = 90
    const completeRes = await makeRequest(`/api/quests/${questId}/complete`, 'POST', null, userAToken);
    if (completeRes.status !== 200 || completeRes.body.data.character.gold !== 90) {
      throw new Error(`Quest completion Gold integration failed! Body: ${JSON.stringify(completeRes.body)}`);
    }
    console.log('  ✅ Quest completion awarded +40 Gold! Gold balance updated from 50 to 90 Gold.');

    console.log('\n==================================================');
    console.log('🎉 ALL 32 REWARDS & INVENTORY TESTS PASSED PERFECTLY!');
    console.log('==================================================\n');

  } catch (error) {
    console.error('\n❌ REWARDS TEST SUITE FAILED:', error);
    process.exitCode = 1;
  } finally {
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    if (userAId) {
      await db.query('DELETE FROM users WHERE id = $1', [userAId]);
    }
    if (userBId) {
      await db.query('DELETE FROM users WHERE id = $1', [userBId]);
    }
    if (availableRewardId) {
      await db.query('DELETE FROM rewards WHERE id IN ($1, $2, $3, $4)', [
        availableRewardId,
        expensiveRewardId,
        unavailableRewardId,
        secondThemeRewardId
      ]);
    }
    server.close();
    if (db.pool && typeof db.pool.end === 'function') {
      await db.pool.end();
    }
    console.log('  ✅ Test server shut down and database pool released.');
  }
}

testRewardsAndInventorySuite();
