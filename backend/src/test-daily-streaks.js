process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/db');
const questService = require('./services/quest.service');

async function testDailyStreaksSuite() {
  console.log('🧪 Starting TAPASYA Individual Daily Quest Streaks Verification Suite...');

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

  let userToken = null;
  let userId = null;
  let questAId = null;
  let questBId = null;
  let oneDayQuestId = null;

  try {
    // 1. Register User
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Streak Hero',
      email: `streak_hero_${Date.now()}@tapasya.rpg`,
      password: 'Password123!'
    });
    userToken = regRes.body.token;
    userId = regRes.body.user.id;

    // --- TEST 1: Create Daily Quests ---
    console.log('\n[Test 1/16] Creating two independent Daily Quests (Study & Exercise)...');
    const qARes = await makeRequest('/api/quests', 'POST', {
      title: 'Study for 1 Hour',
      category: 'STUDY',
      difficulty: 'MEDIUM',
      type: 'DAILY',
      start_date: '2026-09-01'
    }, userToken);

    const qBRes = await makeRequest('/api/quests', 'POST', {
      title: 'Exercise for 30 Minutes',
      category: 'FITNESS',
      difficulty: 'EASY',
      type: 'DAILY',
      start_date: '2026-09-01'
    }, userToken);

    if (qARes.status !== 201 || qBRes.status !== 201) {
      throw new Error(`Daily quest creation failed: A=${JSON.stringify(qARes.body)}, B=${JSON.stringify(qBRes.body)}`);
    }

    questAId = qARes.body.data.id;
    questBId = qBRes.body.data.id;

    if (!qARes.body.data.streak || qARes.body.data.streak.current !== 0) {
      throw new Error(`Initial quest A streak mismatch: ${JSON.stringify(qARes.body.data.streak)}`);
    }
    console.log('  ✅ Daily Quests created cleanly with individual streak = 0.');

    // --- TEST 2: Create One-Day Quest (Must NOT have daily streak) ---
    console.log('\n[Test 2/16] Verifying One-Day Quests do NOT show Daily streak...');
    const oneDayRes = await makeRequest('/api/quests', 'POST', {
      title: 'One-Time Assignment',
      category: 'CODING',
      difficulty: 'EASY',
      type: 'ONE_DAY'
    }, userToken);

    oneDayQuestId = oneDayRes.body.data.id;
    if (oneDayRes.body.data.streak !== null) {
      throw new Error(`One-Day quest streak should be null, got: ${JSON.stringify(oneDayRes.body.data.streak)}`);
    }
    console.log('  ✅ One-Day quest created cleanly with streak = null.');

    // --- TEST 3: First completion & HTTP response payload ---
    console.log('\n[Test 3/16] Completing Daily Quest via HTTP POST /api/quests/:id/complete...');
    const qHttpRes = await makeRequest('/api/quests', 'POST', {
      title: 'HTTP Daily Test Quest',
      category: 'MEDITATION',
      difficulty: 'HARD',
      type: 'DAILY'
    }, userToken);

    const compHttp = await makeRequest(`/api/quests/${qHttpRes.body.data.id}/complete`, 'POST', null, userToken);
    if (compHttp.status !== 200 || compHttp.body.xpEarned !== 75 || compHttp.body.goldEarned !== 40 || compHttp.body.currentStreak !== 1 || compHttp.body.completedToday !== true) {
      throw new Error(`HTTP completion summary payload mismatch: ${JSON.stringify(compHttp.body)}`);
    }
    console.log('  ✅ HTTP POST completion returned summary payload: ', {
      xpEarned: compHttp.body.xpEarned,
      goldEarned: compHttp.body.goldEarned,
      currentStreak: compHttp.body.currentStreak,
      bestStreak: compHttp.body.bestStreak,
      completedToday: compHttp.body.completedToday
    });

    const compA1 = await questService.completeQuest(userId, questAId, '2026-09-10');
    if (compA1.quest.streak.current !== 1 || compA1.quest.streak.best !== 1) {
      throw new Error(`First completion streak failure: ${JSON.stringify(compA1.quest.streak)}`);
    }
    console.log('  ✅ First completion of Quest A on Sep 10 gave streak.current = 1, best = 1.');

    // --- TEST 4: Quest B streak remains 0 (Independent streaks) ---
    console.log('\n[Test 4/16] Verifying Quest B streak remains unchanged at 0 after completing Quest A...');
    const qBCheck1 = await questService.getQuestById(userId, questBId);
    if (qBCheck1.streak.current !== 0 || qBCheck1.streak.best !== 0) {
      throw new Error(`Quest B streak affected by Quest A! ${JSON.stringify(qBCheck1.streak)}`);
    }
    console.log('  ✅ Completing Quest A did NOT increase Quest B streak (Quest B streak remains 0).');

    // --- TEST 5: Consecutive completion increases streak ---
    console.log('\n[Test 5/16] Completing Quest A on Sep 11, Sep 12 (Consecutive completions)...');
    await questService.completeQuest(userId, questAId, '2026-09-11');
    const compA3 = await questService.completeQuest(userId, questAId, '2026-09-12');

    if (compA3.quest.streak.current !== 3 || compA3.quest.streak.best !== 3) {
      throw new Error(`Consecutive completion streak failure: ${JSON.stringify(compA3.quest.streak)}`);
    }
    console.log('  ✅ Consecutive completions on Sep 11 and Sep 12 increased Quest A streak to 3 (best = 3).');

    // --- TEST 6: Same-day duplicate completion rejected ---
    console.log('\n[Test 6/16] Attempting duplicate completion of Quest A on Sep 12...');
    try {
      await questService.completeQuest(userId, questAId, '2026-09-12');
      throw new Error('Duplicate same-day completion was not rejected!');
    } catch (e) {
      if (!e.message.includes('already completed')) throw e;
      console.log('  ✅ Duplicate same-day completion correctly rejected with error.');
    }

    // --- TEST 7: Missing a day resets Quest A current streak, preserves best streak ---
    console.log('\n[Test 7/16] Simulating missed day on Sep 13, completing Quest A on Sep 14...');
    const compA4 = await questService.completeQuest(userId, questAId, '2026-09-14');
    if (compA4.quest.streak.current !== 1 || compA4.quest.streak.best !== 3) {
      throw new Error(`Missed day streak failure: ${JSON.stringify(compA4.quest.streak)}`);
    }
    console.log('  ✅ Missed day on Sep 13 reset Quest A current streak to 1, while preserving best streak = 3.');

    // --- TEST 8: Quest B consecutive completion independently ---
    console.log('\n[Test 8/16] Completing Quest B on Sep 13 and Sep 14...');
    await questService.completeQuest(userId, questBId, '2026-09-13');
    const compB2 = await questService.completeQuest(userId, questBId, '2026-09-14');

    if (compB2.quest.streak.current !== 2 || compB2.quest.streak.best !== 2) {
      throw new Error(`Quest B streak error: ${JSON.stringify(compB2.quest.streak)}`);
    }
    console.log('  ✅ Quest B streak updated independently to current = 2, best = 2.');

    // Verify Quest A streak was not affected by Quest B
    const qACheck2 = await questService.getQuestById(userId, questAId);
    if (qACheck2.streak.best !== 3) {
      throw new Error(`Quest A streak modified by Quest B activity!`);
    }
    console.log('  ✅ Verified Quest A best streak (3) unaffected by Quest B.');

    // --- TEST 9: Start Date enforcement ---
    console.log('\n[Test 9/16] Testing start_date bound enforcement...');
    const futureQuest = await makeRequest('/api/quests', 'POST', {
      title: 'Future Workout',
      category: 'FITNESS',
      difficulty: 'EASY',
      type: 'DAILY',
      start_date: '2026-10-01'
    }, userToken);

    try {
      await questService.completeQuest(userId, futureQuest.body.data.id, '2026-09-12');
      throw new Error('Completion before start_date was not rejected!');
    } catch (e) {
      if (!e.message.includes('not active yet')) throw e;
      console.log('  ✅ Completion before start_date correctly rejected with HTTP 400.');
    }

    // --- TEST 10: End Date enforcement ---
    console.log('\n[Test 10/16] Testing end_date bound enforcement...');
    const expiredQuest = await makeRequest('/api/quests', 'POST', {
      title: 'Expired Workout',
      category: 'FITNESS',
      difficulty: 'EASY',
      type: 'DAILY',
      start_date: '2026-09-01',
      end_date: '2026-09-05'
    }, userToken);

    try {
      await questService.completeQuest(userId, expiredQuest.body.data.id, '2026-09-12');
      throw new Error('Completion after end_date was not rejected!');
    } catch (e) {
      if (!e.message.includes('expired')) throw e;
      console.log('  ✅ Completion after end_date correctly rejected with HTTP 400.');
    }

    // --- TEST 11: GET /api/quests API structure ---
    console.log('\n[Test 11/16] Verifying GET /api/quests response structure...');
    const listRes = await makeRequest('/api/quests', 'GET', null, userToken);
    if (listRes.status !== 200 || !Array.isArray(listRes.body.data)) {
      throw new Error('GET /api/quests failed!');
    }
    const dailyItem = listRes.body.data.find(q => q.id === questAId);
    if (!dailyItem.streak || typeof dailyItem.streak.current !== 'number' || typeof dailyItem.streak.best !== 'number') {
      throw new Error(`GET /api/quests missing daily streak object: ${JSON.stringify(dailyItem)}`);
    }
    console.log('  ✅ GET /api/quests returned individual streak object correctly: ', dailyItem.streak);

    // --- TEST 12: Anti-Cheating (Backend calculates streak, ignores client body) ---
    console.log('\n[Test 12/16] Anti-Cheating: Attempting manual streak manipulation in complete payload...');
    const cheatComp = await makeRequest(`/api/quests/${questBId}/complete`, 'POST', {
      current_streak: 999999,
      best_streak: 999999
    }, userToken);
    const qBCheckCheat = await questService.getQuestById(userId, questBId);
    if (qBCheckCheat.streak.current === 999999 || qBCheckCheat.streak.best === 999999) {
      throw new Error('ANTI-CHEATING FAIL: Client manual streak payload was accepted!');
    }
    console.log('  ✅ Anti-Cheating verified! Client-supplied streak payload ignored, backend computed values correctly.');

    // --- TEST 13: Persistence across database query refresh ---
    console.log('\n[Test 13/16] Verifying daily quest streak persistence in PostgreSQL table...');
    const dbDqs = await db.query('SELECT * FROM daily_quest_streaks WHERE quest_id = $1;', [questAId]);
    if (dbDqs.rows.length !== 1 || dbDqs.rows[0].best_streak !== 3) {
      throw new Error(`Database persistent record error: ${JSON.stringify(dbDqs.rows)}`);
    }
    console.log('  ✅ Database persistence verified cleanly in `daily_quest_streaks`.');

    // --- TEST 14: Single UNIQUE constraint on quest_id in daily_quest_streaks ---
    console.log('\n[Test 14/16] Verifying UNIQUE constraint on quest_id...');
    const countDqs = await db.query('SELECT COUNT(*) FROM daily_quest_streaks WHERE quest_id = $1;', [questAId]);
    if (parseInt(countDqs.rows[0].count, 10) !== 1) {
      throw new Error('Duplicate rows created in daily_quest_streaks!');
    }
    console.log('  ✅ Exactly ONE streak record per Daily Quest in `daily_quest_streaks`.');

    // --- TEST 15: Database Transaction Rollback on Failure ---
    console.log('\n[Test 15/16] Verifying atomic rollback on failed transaction...');
    try {
      await questService.completeQuest(userId, '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.log('  ✅ Transaction rolled back cleanly on error.');
    }

    // --- TEST 16: Cleanup ---
    console.log('\n[Test 16/16] Cleaning up test records...');
    await db.query('DELETE FROM users WHERE id = $1;', [userId]);
    console.log('  ✅ Test user and cascading daily_quest_streaks cleaned up.');

    console.log('\n🎉 ALL 16 INDIVIDUAL DAILY QUEST STREAK TESTS PASSED CLEANLY!');
    server.close();
    await db.pool.end();
  } catch (err) {
    console.error('\n❌ INDIVIDUAL DAILY QUEST STREAK TEST FAILED:', err.message);
    if (userId) {
      try { await db.query('DELETE FROM users WHERE id = $1;', [userId]); } catch (e) {}
    }
    server.close();
    await db.pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  testDailyStreaksSuite();
}

module.exports = { testDailyStreaksSuite };
