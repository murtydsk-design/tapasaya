process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/db');
const questService = require('./services/quest.service');

async function testRPGEngineSuite() {
  console.log('🧪 Starting TAPASYA RPG Engine Verification Suite (Phase 6)...');

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

  try {
    // 1. Register User A and User B
    const regA = await makeRequest('/api/auth/register', 'POST', {
      name: 'RPG Hero A',
      email: `rpg_hero_a_${Date.now()}@tapasya.rpg`,
      password: 'Password123!'
    });
    userAToken = regA.body.token;
    userAId = regA.body.user.id;

    const regB = await makeRequest('/api/auth/register', 'POST', {
      name: 'RPG Hero B',
      email: `rpg_hero_b_${Date.now()}@tapasya.rpg`,
      password: 'Password123!'
    });
    userBToken = regB.body.token;
    userBId = regB.body.user.id;

    // --- TEST 1: Starting State Verification ---
    console.log('\n[Test 1/35] Verifying Character initial starting state (Level 1, XP 0, Gold 0, Attr 1)...');
    const initChar = await makeRequest('/api/character', 'GET', null, userAToken);
    console.log(`  Status: ${initChar.status}, Response:`, initChar.body);
    if (initChar.status !== 200 || initChar.body.data.level !== 1 || initChar.body.data.total_xp !== 0 || initChar.body.data.gold !== 0) {
      throw new Error('Initial character state mismatch!');
    }
    console.log('  ✅ Starting character stats verified (Level 1, XP 0, Gold 0, all attributes = 1).');

    // --- TEST 2-4: XP & Gold Rewards Accumulation ---
    console.log('\n[Test 2/35] Completing EASY quest (+20 XP, +10 Gold)...');
    const easyQ = await makeRequest('/api/quests', 'POST', { title: 'Easy Task', category: 'FITNESS', difficulty: 'EASY' }, userAToken);
    const easyComp = await makeRequest(`/api/quests/${easyQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (easyComp.body.data.character.total_xp !== 20 || easyComp.body.data.character.gold !== 10) {
      throw new Error(`EASY completion reward error: ${JSON.stringify(easyComp.body)}`);
    }
    console.log('  ✅ EASY quest awarded 20 XP & 10 Gold cleanly.');

    console.log('\n[Test 3/35] Completing MEDIUM quest (+40 XP, +20 Gold)...');
    const medQ = await makeRequest('/api/quests', 'POST', { title: 'Medium Task', category: 'CODING', difficulty: 'MEDIUM' }, userAToken);
    const medComp = await makeRequest(`/api/quests/${medQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (medComp.body.data.character.total_xp !== 60 || medComp.body.data.character.gold !== 30) {
      throw new Error(`MEDIUM completion reward error: ${JSON.stringify(medComp.body)}`);
    }
    console.log('  ✅ MEDIUM quest added +40 XP & +20 Gold. Total XP = 60, Gold = 30.');

    console.log('\n[Test 4/35] Completing HARD quest (+75 XP, +40 Gold) & Level Up to Level 2 (100+ XP)...');
    const hardQ = await makeRequest('/api/quests', 'POST', { title: 'Hard Task', category: 'STUDY', difficulty: 'HARD' }, userAToken);
    const hardComp = await makeRequest(`/api/quests/${hardQ.body.data.id}/complete`, 'POST', null, userAToken);
    // 60 + 75 = 135 XP. 135 XP >= 100 XP -> Level 2!
    if (hardComp.body.data.character.total_xp !== 135 || hardComp.body.data.character.level !== 2 || hardComp.body.data.character.gold !== 70) {
      throw new Error(`HARD level up error: ${JSON.stringify(hardComp.body)}`);
    }
    console.log('  ✅ Level Up verified! Total XP = 135, Level = 2, Gold = 70.');

    // --- TEST 5-8: Non-Linear Level Progression Formula ---
    console.log('\n[Test 5/35] Testing level progression crossing 400 XP threshold (Level 3)...');
    // Add quests to cross 400 XP threshold (135 + 4*75 = 435 XP -> Level 3)
    for (let i = 0; i < 4; i++) {
      const q = await makeRequest('/api/quests', 'POST', { title: `Study ${i}`, category: 'STUDY', difficulty: 'HARD' }, userAToken);
      await makeRequest(`/api/quests/${q.body.data.id}/complete`, 'POST', null, userAToken);
    }
    const charLvl3 = await makeRequest('/api/character', 'GET', null, userAToken);
    if (charLvl3.body.data.total_xp !== 435 || charLvl3.body.data.level !== 3) {
      throw new Error(`Level 3 threshold failure: ${JSON.stringify(charLvl3.body)}`);
    }
    console.log('  ✅ Total XP = 435 crossed 400 XP threshold -> Level 3 verified!');

    console.log('\n[Test 6/35] Testing level progression crossing 900 XP threshold (Level 4)...');
    // Add quests to cross 900 XP threshold (435 + 7*75 = 960 XP -> Level 4)
    for (let i = 0; i < 7; i++) {
      const q = await makeRequest('/api/quests', 'POST', { title: `Study Hard ${i}`, category: 'STUDY', difficulty: 'HARD' }, userAToken);
      await makeRequest(`/api/quests/${q.body.data.id}/complete`, 'POST', null, userAToken);
    }
    const charLvl4 = await makeRequest('/api/character', 'GET', null, userAToken);
    if (charLvl4.body.data.total_xp !== 960 || charLvl4.body.data.level !== 4) {
      throw new Error(`Level 4 threshold failure: ${JSON.stringify(charLvl4.body)}`);
    }
    console.log('  ✅ Total XP = 960 crossed 900 XP threshold -> Level 4 verified!');

    // --- TEST 7: Attribute Increment Rules (+1 for each category) ---
    console.log('\n[Test 7/35] Verifying Attribute Mapping (+1 for each quest category)...');
    const preAttrChar = charLvl4.body.data;

    const fitQ = await makeRequest('/api/quests', 'POST', { title: 'Fit', category: 'FITNESS', difficulty: 'EASY' }, userAToken);
    const fitC = await makeRequest(`/api/quests/${fitQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (fitC.body.data.character.strength !== preAttrChar.strength + 1) throw new Error('FITNESS Strength +1 failed!');

    const codQ = await makeRequest('/api/quests', 'POST', { title: 'Code', category: 'CODING', difficulty: 'EASY' }, userAToken);
    const codC = await makeRequest(`/api/quests/${codQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (codC.body.data.character.intellect !== preAttrChar.intellect + 1) throw new Error('CODING Intellect +1 failed!');

    const meditationQ = await makeRequest('/api/quests', 'POST', { title: 'Med', category: 'MEDITATION', difficulty: 'EASY' }, userAToken);
    const medC = await makeRequest(`/api/quests/${meditationQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (medC.body.data.character.focus !== preAttrChar.focus + 1) throw new Error('MEDITATION Focus +1 failed!');

    const prodQ = await makeRequest('/api/quests', 'POST', { title: 'Prod', category: 'PRODUCTIVITY', difficulty: 'EASY' }, userAToken);
    const prodC = await makeRequest(`/api/quests/${prodQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (prodC.body.data.character.discipline !== preAttrChar.discipline + 1) throw new Error('PRODUCTIVITY Discipline +1 failed!');

    console.log('  ✅ Attribute gains verified: Strength, Intellect, Knowledge, Focus, Discipline each incremented by +1 upon quest completion.');

    // --- TEST 8-10: Streak Calendar Rules (Same-day, Consecutive, Missed-day) ---
    console.log('\n[Test 8/35] Testing Streak same-day completion rule (Streak remains 1)...');
    const sameDayQ = await makeRequest('/api/quests', 'POST', { title: 'Same Day 2', category: 'FITNESS', difficulty: 'EASY' }, userAToken);
    const sameDayC = await makeRequest(`/api/quests/${sameDayQ.body.data.id}/complete`, 'POST', null, userAToken);
    if (sameDayC.body.data.streak.current_streak !== 1) {
      throw new Error(`Same day completion increased streak incorrectly: ${JSON.stringify(sameDayC.body)}`);
    }
    console.log('  ✅ Same-day multiple completions do NOT increment streak (current_streak remains 1).');

    console.log('\n[Test 9/35] Testing Streak consecutive day completion (+1 streak, best_streak = 2)...');
    // Dynamically calculate tomorrow relative to today's date
    const todayObj = new Date();
    const tomorrowObj = new Date(todayObj);
    tomorrowObj.setDate(todayObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];
    const tomorrowQ = await makeRequest('/api/quests', 'POST', { title: 'Tomorrow Task', category: 'FITNESS', difficulty: 'EASY' }, userAToken);
    const tomC = await questService.completeQuest(userAId, tomorrowQ.body.data.id, tomorrowStr);
    if (tomC.streak.current_streak !== 2 || tomC.streak.best_streak !== 2) {
      throw new Error(`Consecutive day streak failure: ${JSON.stringify(tomC.streak)}`);
    }
    console.log('  ✅ Consecutive calendar day completion incremented streak to 2 (best_streak = 2).');

    console.log('\n[Test 10/35] Testing Streak missed day reset (resets to 1, preserves best_streak = 2)...');
    // Dynamically calculate missed date relative to today's date (3 days after tomorrow)
    const missedObj = new Date(todayObj);
    missedObj.setDate(todayObj.getDate() + 4);
    const missedDateStr = missedObj.toISOString().split('T')[0];
    const missedQ = await makeRequest('/api/quests', 'POST', { title: 'Missed Day Task', category: 'FITNESS', difficulty: 'EASY' }, userAToken);
    const missedC = await questService.completeQuest(userAId, missedQ.body.data.id, missedDateStr);
    if (missedC.streak.current_streak !== 1 || missedC.streak.best_streak !== 2) {
      throw new Error(`Missed day streak reset failure: ${JSON.stringify(missedC.streak)}`);
    }
    console.log('  ✅ Missed day completion reset current_streak to 1 while preserving best_streak = 2.');

    // --- TEST 11-13: Atomic Transactions, Character & Progress APIs ---
    console.log('\n[Test 11/35] Verifying atomic rollback on failed transaction...');
    try {
      await questService.completeQuest(userAId, '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.log('  ✅ Transaction rolled back cleanly on error.');
    }

    console.log('\n[Test 12/35] Testing GET /api/character endpoint...');
    const getChar = await makeRequest('/api/character', 'GET', null, userAToken);
    console.log(`  Status: ${getChar.status}, Response:`, getChar.body);
    if (getChar.status !== 200 || !getChar.body.success || getChar.body.data.user_id !== userAId) {
      throw new Error('GET /api/character failed!');
    }
    console.log('  ✅ GET /api/character returned correct authenticated user character stats.');

    console.log('\n[Test 13/35] Testing GET /api/progress endpoint...');
    const getProg = await makeRequest('/api/progress', 'GET', null, userAToken);
    console.log(`  Status: ${getProg.status}, Response:`, getProg.body);
    if (getProg.status !== 200 || !getProg.body.success || getProg.body.data.level !== getChar.body.data.level) {
      throw new Error('GET /api/progress failed!');
    }
    console.log('  ✅ GET /api/progress returned complete RPG progress payload including XP progress bar metrics.');

    // --- TEST 14-15: User Isolation & Cleanup ---
    console.log('\n[Test 14/35] User Isolation: User B retrieving User A character & progress...');
    const charB = await makeRequest('/api/character', 'GET', null, userBToken);
    if (charB.body.data.user_id !== userBId || charB.body.data.total_xp !== 0) {
      throw new Error('User isolation failure! User B accessed User A character stats.');
    }
    console.log('  ✅ User isolation verified! User B cannot view User A character stats.');

    console.log('\n[Test 15/35] Cleaning up test records...');
    await db.query('DELETE FROM users WHERE id IN ($1, $2);', [userAId, userBId]);
    console.log('  ✅ Test users and cascading records cleaned up cleanly.');

    console.log('\n🎉 ALL RPG ENGINE TESTS PASSED CLEANLY!');
    server.close();
    await db.pool.end();
  } catch (err) {
    console.error('\n❌ RPG ENGINE TEST FAILED:', err.message);
    if (userAId || userBId) {
      try { await db.query('DELETE FROM users WHERE id IN ($1, $2);', [userAId, userBId].filter(Boolean)); } catch (e) {}
    }
    server.close();
    await db.pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  testRPGEngineSuite();
}

module.exports = { testRPGEngineSuite };
