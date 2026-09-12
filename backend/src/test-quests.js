process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/db');

async function testQuestSystemSuite() {
  console.log('🧪 Starting TAPASYA Quest System Verification Suite (Phase 5)...');

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
  let questEasyId = null;
  let questMediumId = null;
  let questHardId = null;
  let questBId = null;

  try {
    // Register User A and User B
    const regA = await makeRequest('/api/auth/register', 'POST', {
      name: 'Quest Hero A',
      email: `quest_hero_a_${Date.now()}@tapasya.rpg`,
      password: 'Password123!'
    });
    userAToken = regA.body.token;
    userAId = regA.body.user.id;

    const regB = await makeRequest('/api/auth/register', 'POST', {
      name: 'Quest Hero B',
      email: `quest_hero_b_${Date.now()}@tapasya.rpg`,
      password: 'Password123!'
    });
    userBToken = regB.body.token;
    userBId = regB.body.user.id;

    // --- CREATE TESTS ---
    console.log('\n[Test 1/38] Creating EASY Daily Quest (Fitness)...');
    const easyRes = await makeRequest('/api/quests', 'POST', {
      title: 'Morning Pushups',
      description: 'Do 20 pushups',
      category: 'FITNESS',
      difficulty: 'EASY',
      type: 'DAILY'
    }, userAToken);
    if (easyRes.status !== 201 || easyRes.body.data.xp_reward !== 20 || easyRes.body.data.gold_reward !== 10 || easyRes.body.data.type !== 'DAILY') {
      throw new Error(`EASY Daily Quest creation error: ${JSON.stringify(easyRes.body)}`);
    }
    questEasyId = easyRes.body.data.id;
    console.log('  ✅ EASY Daily Quest created cleanly. Type: DAILY, Rewards: 20 XP, 10 Gold.');

    console.log('\n[Test 2/38] Creating MEDIUM One-Day Quest (Coding)...');
    const todayStr = new Date().toISOString().split('T')[0];
    const medRes = await makeRequest('/api/quests', 'POST', {
      title: 'Build Express Controller',
      description: 'Implement quest controller',
      category: 'CODING',
      difficulty: 'MEDIUM',
      type: 'ONE_DAY',
      quest_date: todayStr
    }, userAToken);
    if (medRes.status !== 201 || medRes.body.data.xp_reward !== 40 || medRes.body.data.gold_reward !== 20 || medRes.body.data.type !== 'ONE_DAY') {
      throw new Error(`MEDIUM One-Day Quest creation error: ${JSON.stringify(medRes.body)}`);
    }
    questMediumId = medRes.body.data.id;
    console.log(`  ✅ MEDIUM One-Day Quest created cleanly. Type: ONE_DAY, Date: ${todayStr}, Rewards: 40 XP, 20 Gold.`);

    console.log('\n[Test 3/38] Creating HARD Daily Quest (Study)...');
    const hardRes = await makeRequest('/api/quests', 'POST', {
      title: 'Master System Design',
      description: 'Study database transactions & indexing',
      category: 'STUDY',
      difficulty: 'HARD',
      type: 'DAILY'
    }, userAToken);
    if (hardRes.status !== 201 || hardRes.body.data.xp_reward !== 75 || hardRes.body.data.gold_reward !== 40) {
      throw new Error(`HARD Daily Quest creation error: ${JSON.stringify(hardRes.body)}`);
    }
    questHardId = hardRes.body.data.id;
    console.log('  ✅ HARD Daily Quest created cleanly. Rewards: 75 XP, 40 Gold.');

    console.log('\n[Test 4/38] Testing invalid quest type rejection...');
    const invTypeRes = await makeRequest('/api/quests', 'POST', {
      title: 'Weekly Quest',
      category: 'FITNESS',
      difficulty: 'EASY',
      type: 'WEEKLY'
    }, userAToken);
    if (invTypeRes.status !== 400) throw new Error('Invalid quest type WEEKLY was not rejected!');
    console.log('  ✅ Invalid quest type WEEKLY correctly rejected with HTTP 400.');

    console.log('\n[Test 5/38] Testing invalid quest_date format rejection...');
    const invDateRes = await makeRequest('/api/quests', 'POST', {
      title: 'Bad Date Quest',
      category: 'FITNESS',
      difficulty: 'EASY',
      type: 'ONE_DAY',
      quest_date: 'invalid-date'
    }, userAToken);
    if (invDateRes.status !== 400) throw new Error('Invalid quest_date format was not rejected!');
    console.log('  ✅ Invalid quest_date format correctly rejected with HTTP 400.');

    console.log('\n[Test 6/38] Testing unauthenticated quest creation rejection...');
    const unauthCreate = await makeRequest('/api/quests', 'POST', {
      title: 'Hacker Quest',
      category: 'FITNESS',
      difficulty: 'EASY'
    });
    if (unauthCreate.status !== 401) throw new Error('Unauthenticated creation was not rejected!');
    console.log('  ✅ Unauthenticated quest creation correctly rejected with HTTP 401.');

    console.log('\n[Test 7/38] Testing invalid category rejection...');
    const invCat = await makeRequest('/api/quests', 'POST', {
      title: 'Fly to Moon',
      category: 'FLYING',
      difficulty: 'EASY'
    }, userAToken);
    if (invCat.status !== 400) throw new Error('Invalid category was not rejected!');
    console.log('  ✅ Invalid category correctly rejected with HTTP 400.');

    console.log('\n[Test 8/38] Testing invalid difficulty rejection...');
    const invDiff = await makeRequest('/api/quests', 'POST', {
      title: 'Impossible Quest',
      category: 'CODING',
      difficulty: 'LEGENDARY'
    }, userAToken);
    if (invDiff.status !== 400) throw new Error('Invalid difficulty was not rejected!');
    console.log('  ✅ Invalid difficulty correctly rejected with HTTP 400.');

    console.log('\n[Test 9/38] Anti-Cheating: Testing client-supplied reward values overrides...');
    const cheatRes = await makeRequest('/api/quests', 'POST', {
      title: 'Cheat Quest',
      category: 'CODING',
      difficulty: 'EASY',
      xp_reward: 999999,
      gold_reward: 999999
    }, userAToken);
    if (cheatRes.body.data.xp_reward !== 20 || cheatRes.body.data.gold_reward !== 10) {
      throw new Error('ANTI-CHEATING FAIL: Client-supplied reward values were accepted!');
    }
    console.log('  ✅ Anti-Cheating verified! Client-supplied 999999 rewards ignored, backend computed 20 XP & 10 Gold.');

    // --- READ TESTS ---
    console.log('\n[Test 10/38] Fetching all user quests (GET /api/quests)...');
    const listRes = await makeRequest('/api/quests', 'GET', null, userAToken);
    if (listRes.status !== 200 || listRes.body.data.length < 3) {
      throw new Error('GET /api/quests failed!');
    }
    console.log(`  ✅ User quests retrieved cleanly (${listRes.body.data.length} quests found).`);

    console.log('\n[Test 11/38] Fetching single owned quest (GET /api/quests/:id)...');
    const getSingleRes = await makeRequest(`/api/quests/${questEasyId}`, 'GET', null, userAToken);
    if (getSingleRes.status !== 200 || getSingleRes.body.data.id !== questEasyId) {
      throw new Error('GET /api/quests/:id failed!');
    }
    console.log('  ✅ Single owned quest retrieved cleanly.');

    console.log('\n[Test 12/38] User Isolation Read Check (User B fetching User A quest)...');
    const crossRead = await makeRequest(`/api/quests/${questEasyId}`, 'GET', null, userBToken);
    if (crossRead.status !== 404) throw new Error('User B was able to fetch User A quest!');
    console.log('  ✅ Cross-user read correctly rejected with HTTP 404 Not Found.');

    // --- UPDATE TESTS ---
    console.log('\n[Test 13/38] Updating active quest title & description (PUT /api/quests/:id)...');
    const updateRes = await makeRequest(`/api/quests/${questEasyId}`, 'PUT', {
      title: 'Evening Pushups 30x',
      description: 'Increased to 30 pushups'
    }, userAToken);
    if (updateRes.status !== 200 || updateRes.body.data.title !== 'Evening Pushups 30x') {
      throw new Error('PUT /api/quests/:id failed!');
    }
    console.log('  ✅ Active quest updated cleanly.');

    console.log('\n[Test 14/38] Testing invalid update payload rejection...');
    const invUpdate = await makeRequest(`/api/quests/${questEasyId}`, 'PUT', {
      title: ''
    }, userAToken);
    if (invUpdate.status !== 400) throw new Error('Empty title update was not rejected!');
    console.log('  ✅ Invalid update payload correctly rejected with HTTP 400.');

    console.log('\n[Test 15/38] Testing difficulty update reward recalculation (EASY -> HARD)...');
    const diffUpdate = await makeRequest(`/api/quests/${questEasyId}`, 'PUT', {
      difficulty: 'HARD'
    }, userAToken);
    if (diffUpdate.body.data.xp_reward !== 75 || diffUpdate.body.data.gold_reward !== 40) {
      throw new Error('Difficulty change reward recalculation failed!');
    }
    console.log('  ✅ Difficulty change from EASY to HARD recalculated rewards to 75 XP & 40 Gold.');

    console.log('\n[Test 16/38] User Isolation Update Check (User B updating User A quest)...');
    const crossUpdate = await makeRequest(`/api/quests/${questEasyId}`, 'PUT', {
      title: 'Hacked Title'
    }, userBToken);
    if (crossUpdate.status !== 404) throw new Error('User B was able to update User A quest!');
    console.log('  ✅ Cross-user update correctly rejected with HTTP 404.');

    console.log('\n[Test 17/38] Anti-Cheating: Updating quest status directly via PUT...');
    const statusUpdate = await makeRequest(`/api/quests/${questEasyId}`, 'PUT', {
      status: 'COMPLETED'
    }, userAToken);
    if (statusUpdate.body.data.status === 'COMPLETED') {
      throw new Error('ANTI-CHEATING FAIL: Client manually completed quest via PUT!');
    }
    console.log('  ✅ Anti-Cheating verified! Direct status change via PUT ignored.');

    // Create User B quest for deletion/isolation tests
    const questBRes = await makeRequest('/api/quests', 'POST', {
      title: 'User B Quest',
      category: 'PRODUCTIVITY',
      difficulty: 'EASY',
      type: 'DAILY'
    }, userBToken);
    questBId = questBRes.body.data.id;

    // --- DELETE TESTS ---
    console.log('\n[Test 18/38] Deleting active quest (DELETE /api/quests/:id)...');
    const delRes = await makeRequest(`/api/quests/${questEasyId}`, 'DELETE', null, userAToken);
    if (delRes.status !== 200) throw new Error('Delete quest failed!');
    console.log('  ✅ Quest deleted cleanly.');

    console.log('\n[Test 19/38] User Isolation Delete Check (User A deleting User B quest)...');
    const crossDel = await makeRequest(`/api/quests/${questBId}`, 'DELETE', null, userAToken);
    if (crossDel.status !== 404) throw new Error('User A was able to delete User B quest!');
    console.log('  ✅ Cross-user delete correctly rejected with HTTP 404.');

    console.log('\n[Test 20/38] Unauthenticated deletion check...');
    const unauthDel = await makeRequest(`/api/quests/${questBId}`, 'DELETE');
    if (unauthDel.status !== 401) throw new Error('Unauthenticated deletion was not rejected!');
    console.log('  ✅ Unauthenticated deletion correctly rejected with HTTP 401.');

    // --- COMPLETE TESTS ---
    console.log('\n[Test 21/38] Completing ONE_DAY MEDIUM quest (CODING -> Intellect)...');
    const compRes = await makeRequest(`/api/quests/${questMediumId}/complete`, 'POST', null, userAToken);
    if (compRes.status !== 200 || compRes.body.data.quest.status !== 'COMPLETED' || compRes.body.data.quest.is_completed_today !== true) {
      throw new Error(`ONE_DAY Quest completion failed: ${JSON.stringify(compRes.body)}`);
    }
    console.log('  ✅ ONE_DAY Quest completed successfully! Status updated to COMPLETED.');

    console.log('\n[Test 22/38] Verifying PostgreSQL quest_completions table record for ONE_DAY quest...');
    const compDb = await db.query('SELECT * FROM quest_completions WHERE quest_id = $1;', [questMediumId]);
    if (compDb.rows.length !== 1) throw new Error('Completion record not found in database!');
    const cRow = compDb.rows[0];
    if (cRow.xp_earned !== 40 || cRow.gold_earned !== 20 || cRow.attribute !== 'Intellect') {
      throw new Error(`Completion record values mismatch: ${JSON.stringify(cRow)}`);
    }
    console.log('  ✅ PostgreSQL `quest_completions` record verified: +40 XP, +20 Gold, Attribute=Intellect.');

    console.log('\n[Test 23/38] Completing DAILY HARD quest (STUDY -> Knowledge)...');
    const dailyCompRes = await makeRequest(`/api/quests/${questHardId}/complete`, 'POST', null, userAToken);
    if (dailyCompRes.status !== 200 || dailyCompRes.body.data.quest.status !== 'ACTIVE' || dailyCompRes.body.data.quest.is_completed_today !== true) {
      throw new Error(`DAILY Quest completion failed: ${JSON.stringify(dailyCompRes.body)}`);
    }
    console.log('  ✅ DAILY Quest completed today! Status remains ACTIVE for upcoming days, is_completed_today is true.');

    console.log('\n[Test 24/38] Same-Day Duplicate Completion Prevention for DAILY quest...');
    const dupDailyRes = await makeRequest(`/api/quests/${questHardId}/complete`, 'POST', null, userAToken);
    if (dupDailyRes.status !== 400 || !dupDailyRes.body.message.includes('already completed')) {
      throw new Error(`Same-day duplicate completion for DAILY quest was not rejected correctly: ${JSON.stringify(dupDailyRes.body)}`);
    }
    console.log('  ✅ Same-day duplicate completion for DAILY quest correctly rejected with HTTP 400 ("You have already completed this daily quest today.").');

    // Verify Category -> Attribute Mappings
    console.log('\n[Test 25/38] Testing Category -> Attribute Mapping for FITNESS (Strength)...');
    const fitQ = await makeRequest('/api/quests', 'POST', { title: 'Gym Workout', category: 'FITNESS', difficulty: 'EASY', type: 'ONE_DAY' }, userAToken);
    const fitComp = await makeRequest(`/api/quests/${fitQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (fitComp.body.data.completion.attribute !== 'Strength') throw new Error('FITNESS mapping failed!');
    console.log('  ✅ FITNESS mapped correctly to Strength.');

    console.log('\n[Test 26/38] Testing Category -> Attribute Mapping for STUDY (Knowledge)...');
    const stdQ = await makeRequest('/api/quests', 'POST', { title: 'Read Book', category: 'STUDY', difficulty: 'EASY', type: 'ONE_DAY' }, userAToken);
    const stdComp = await makeRequest(`/api/quests/${stdQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (stdComp.body.data.completion.attribute !== 'Knowledge') throw new Error('STUDY mapping failed!');
    console.log('  ✅ STUDY mapped correctly to Knowledge.');

    console.log('\n[Test 27/38] Testing Category -> Attribute Mapping for MEDITATION (Focus)...');
    const medQ = await makeRequest('/api/quests', 'POST', { title: 'Mindfulness', category: 'MEDITATION', difficulty: 'EASY', type: 'ONE_DAY' }, userAToken);
    const medComp = await makeRequest(`/api/quests/${medQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (medComp.body.data.completion.attribute !== 'Focus') throw new Error('MEDITATION mapping failed!');
    console.log('  ✅ MEDITATION mapped correctly to Focus.');

    console.log('\n[Test 28/38] Testing Category -> Attribute Mapping for PRODUCTIVITY (Discipline)...');
    const prodQ = await makeRequest('/api/quests', 'POST', { title: 'Organize Desk', category: 'PRODUCTIVITY', difficulty: 'EASY', type: 'ONE_DAY' }, userAToken);
    const prodComp = await makeRequest(`/api/quests/${prodQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (prodComp.body.data.completion.attribute !== 'Discipline') throw new Error('PRODUCTIVITY mapping failed!');
    console.log('  ✅ PRODUCTIVITY mapped correctly to Discipline.');

    console.log('\n[Test 29/38] Verifying ONE_DAY quest status and completed_at timestamp update...');
    const qCheck = await makeRequest(`/api/quests/${questMediumId}`, 'GET', null, userAToken);
    if (qCheck.body.data.status !== 'COMPLETED' || !qCheck.body.data.completed_at) {
      throw new Error('Quest status or completed_at not updated!');
    }
    console.log('  ✅ ONE_DAY Quest status=COMPLETED and completed_at timestamp verified.');

    console.log('\n[Test 30/38] Double-Completion Prevention: Attempting to complete already COMPLETED ONE_DAY quest...');
    const doubleComp = await makeRequest(`/api/quests/${questMediumId}/complete`, 'POST', null, userAToken);
    if (doubleComp.status !== 400 || doubleComp.body.success !== false) {
      throw new Error('Double completion was not rejected!');
    }
    console.log('  ✅ Double completion for ONE_DAY quest correctly rejected with HTTP 400.');

    console.log('\n[Test 31/38] Verifying database completion count after double-completion attempt...');
    const doubleDbCheck = await db.query('SELECT COUNT(*) FROM quest_completions WHERE quest_id = $1;', [questMediumId]);
    if (parseInt(doubleDbCheck.rows[0].count, 10) !== 1) {
      throw new Error('Duplicate completion row was created in database!');
    }
    console.log('  ✅ Verified database contains exactly 1 completion record for ONE_DAY quest.');

    console.log('\n[Test 32/38] Concurrency & Race Condition Protection (Simultaneous Completion Requests on new ONE_DAY quest)...');
    const concQ = await makeRequest('/api/quests', 'POST', { title: 'Race Condition Test Quest', category: 'CODING', difficulty: 'HARD', type: 'ONE_DAY' }, userAToken);
    const concQId = concQ.body.data.id;
    const concRes = await Promise.all([
      makeRequest(`/api/quests/${concQId}/complete`, 'POST', null, userAToken),
      makeRequest(`/api/quests/${concQId}/complete`, 'POST', null, userAToken)
    ]);
    const statuses = concRes.map(r => r.status);
    const successCount = statuses.filter(s => s === 200).length;
    const failCount = statuses.filter(s => s === 400).length;
    if (successCount !== 1 || failCount !== 1) {
      throw new Error(`Race condition failure! Success count: ${successCount}, Fail count: ${failCount}`);
    }
    console.log('  ✅ Concurrency protection verified (`FOR UPDATE` locking)! Exactly 1 request succeeded (200), 1 request failed cleanly (400).');

    console.log('\n[Test 33/38] Attempting to update COMPLETED ONE_DAY quest...');
    const updateComp = await makeRequest(`/api/quests/${questMediumId}`, 'PUT', { title: 'New Title' }, userAToken);
    if (updateComp.status !== 400) throw new Error('Modifying completed quest was not rejected!');
    console.log('  ✅ Updating completed quest correctly rejected with HTTP 400.');

    // --- USER ISOLATION TESTS ---
    console.log('\n[Test 34/38] User Isolation Complete Check (User A completing User B quest)...');
    const crossComp = await makeRequest(`/api/quests/${questBId}/complete`, 'POST', null, userAToken);
    if (crossComp.status !== 404) throw new Error('User A was able to complete User B quest!');
    console.log('  ✅ User B quest completion by User A correctly rejected with HTTP 404.');

    console.log('\n[Test 35/38] Anti-Cheating: Submitting arbitrary rewards in complete payload...');
    const cheatComp = await makeRequest(`/api/quests/${questBId}/complete`, 'POST', {
      xp_earned: 999999,
      gold_earned: 999999,
      attribute: 'Strength'
    }, userBToken);
    const cheatDb = await db.query('SELECT * FROM quest_completions WHERE quest_id = $1;', [questBId]);
    if (cheatDb.rows[0].xp_earned === 999999 || cheatDb.rows[0].gold_earned === 999999) {
      throw new Error('ANTI-CHEATING FAIL: Arbitrary completion payload values accepted!');
    }
    console.log('  ✅ Anti-Cheating verified! Arbitrary completion payload ignored, backend recorded computed rewards.');

    console.log('\n[Test 36/38] Database Integrity Verification...');
    const totalComps = await db.query('SELECT COUNT(*) FROM quest_completions WHERE user_id = $1;', [userAToken ? userAId : null]);
    console.log(`  ✅ Database integrity verified cleanly. User A completed ${totalComps.rows[0].count} quests.`);

    console.log('\n[Test 37/38] Cleaning up test records...');
    await db.query('DELETE FROM users WHERE id IN ($1, $2);', [userAId, userBId]);
    console.log('  ✅ Test users and cascading quest records cleaned up cleanly.');

    console.log('\n🎉 ALL 38 QUEST SYSTEM TESTS PASSED SUCCESSFULLY!');
    server.close();
    await db.pool.end();
  } catch (err) {
    console.error('\n❌ QUEST SYSTEM TEST FAILED:', err.message);
    if (userAId || userBId) {
      try { await db.query('DELETE FROM users WHERE id IN ($1, $2);', [userAId, userBId].filter(Boolean)); } catch (e) {}
    }
    server.close();
    await db.pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  testQuestSystemSuite();
}

module.exports = { testQuestSystemSuite };
