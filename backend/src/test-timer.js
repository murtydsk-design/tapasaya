require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/db');

let server;
let port;
let baseUrl;

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body ? JSON.stringify(body) : null;

    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTimerTests() {
  console.log('⏳ Starting TAPASYA Quest Timer Verification Suite...');

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`  ✅ Test server running on ${baseUrl}`);

  const timestamp = Date.now();
  const userAEmail = `timer_test_a_${timestamp}@tapasya.rpg`;
  const userBEmail = `timer_test_b_${timestamp}@tapasya.rpg`;

  try {
    // 1. Setup User A and User B
    const regARes = await request('POST', '/api/auth/register', {
      name: 'Hero Timer A',
      email: userAEmail,
      password: 'Password123!'
    });
    const tokenA = regARes.body.token;

    const regBRes = await request('POST', '/api/auth/register', {
      name: 'Hero Timer B',
      email: userBEmail,
      password: 'Password123!'
    });
    const tokenB = regBRes.body.token;

    console.log('\n[Test 1/10] Creating Quests with 1_HOUR, 2_HOURS, FULL_DAY, and NONE timers...');
    const createHourRes = await request('POST', '/api/quests', {
      title: 'Coding 1 Hour Sprint',
      description: 'Focus sprint with 1 hour timer',
      category: 'CODING',
      difficulty: 'MEDIUM',
      type: 'DAILY',
      timer_option: '1_HOUR'
    }, tokenA);

    if (createHourRes.status !== 201 || createHourRes.body.data.timer_option !== '1_HOUR') {
      throw new Error(`Failed to create 1_HOUR quest: ${JSON.stringify(createHourRes.body)}`);
    }
    const hourQuestId = createHourRes.body.data.id;
    console.log('  ✅ 1_HOUR Daily Quest created successfully. Duration: 3600s.');

    const createTwoHourRes = await request('POST', '/api/quests', {
      title: 'Study 2 Hours',
      description: 'Deep study with 2 hour timer',
      category: 'STUDY',
      difficulty: 'HARD',
      type: 'ONE_DAY',
      timer_option: '2_HOURS'
    }, tokenA);

    if (createTwoHourRes.status !== 201 || createTwoHourRes.body.data.timer_option !== '2_HOURS') {
      throw new Error(`Failed to create 2_HOURS quest: ${JSON.stringify(createTwoHourRes.body)}`);
    }
    const twoHourQuestId = createTwoHourRes.body.data.id;
    console.log('  ✅ 2_HOURS One-Day Quest created successfully. Duration: 7200s.');

    const createFullDayRes = await request('POST', '/api/quests', {
      title: 'Fitness Full Day Challenge',
      category: 'FITNESS',
      difficulty: 'EASY',
      type: 'DAILY',
      timer_option: 'FULL_DAY'
    }, tokenA);

    if (createFullDayRes.status !== 201 || createFullDayRes.body.data.timer_option !== 'FULL_DAY') {
      throw new Error(`Failed to create FULL_DAY quest: ${JSON.stringify(createFullDayRes.body)}`);
    }
    console.log('  ✅ FULL_DAY Daily Quest created successfully.');

    // 2. Test Invalid Timer Option
    console.log('\n[Test 2/10] Testing Invalid Timer Option Rejection...');
    const invalidTimerRes = await request('POST', '/api/quests', {
      title: 'Invalid Timer Quest',
      category: 'CODING',
      difficulty: 'EASY',
      timer_option: '100_HOURS'
    }, tokenA);

    if (invalidTimerRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for invalid timer_option, got ${invalidTimerRes.status}`);
    }
    console.log('  ✅ Invalid timer_option correctly rejected with HTTP 400.');

    // 3. Test Start Timer
    console.log('\n[Test 3/10] Testing POST /api/quests/:id/timer/start...');
    const startRes = await request('POST', `/api/quests/${hourQuestId}/timer/start`, {}, tokenA);
    if (startRes.status !== 200 || startRes.body.data.timer_status !== 'RUNNING') {
      throw new Error(`Failed to start timer: ${JSON.stringify(startRes.body)}`);
    }
    console.log('  ✅ Timer started successfully. Status = RUNNING.');

    // 4. Test Pause Timer
    console.log('\n[Test 4/10] Testing POST /api/quests/:id/timer/pause...');
    const pauseRes = await request('POST', `/api/quests/${hourQuestId}/timer/pause`, {}, tokenA);
    if (pauseRes.status !== 200 || pauseRes.body.data.timer_status !== 'PAUSED') {
      throw new Error(`Failed to pause timer: ${JSON.stringify(pauseRes.body)}`);
    }
    const pausedRemaining = pauseRes.body.data.timer_remaining_seconds;
    console.log(`  ✅ Timer paused successfully. Status = PAUSED, Preserved Remaining: ${pausedRemaining}s.`);

    // 5. Test Resume Timer
    console.log('\n[Test 5/10] Testing POST /api/quests/:id/timer/resume...');
    const resumeRes = await request('POST', `/api/quests/${hourQuestId}/timer/resume`, {}, tokenA);
    if (resumeRes.status !== 200 || resumeRes.body.data.timer_status !== 'RUNNING') {
      throw new Error(`Failed to resume timer: ${JSON.stringify(resumeRes.body)}`);
    }
    console.log('  ✅ Timer resumed successfully. Status = RUNNING.');

    // 6. Test Reset Timer
    console.log('\n[Test 6/10] Testing POST /api/quests/:id/timer/reset...');
    const resetRes = await request('POST', `/api/quests/${hourQuestId}/timer/reset`, {}, tokenA);
    if (resetRes.status !== 200 || resetRes.body.data.timer_status !== 'STOPPED' || resetRes.body.data.timer_remaining_seconds !== 3600) {
      throw new Error(`Failed to reset timer: ${JSON.stringify(resetRes.body)}`);
    }
    console.log('  ✅ Timer reset successfully to initial unstarted STOPPED state (3600s).');

    // 7. Test User Isolation / Unauthorized Access
    console.log('\n[Test 7/10] Testing User Isolation (User B attempting to control User A timer)...');
    const unauthStartRes = await request('POST', `/api/quests/${hourQuestId}/timer/start`, {}, tokenB);
    if (unauthStartRes.status !== 404) {
      throw new Error(`Expected HTTP 404 for unauthorized timer start, got ${unauthStartRes.status}`);
    }
    console.log('  ✅ Cross-user timer control correctly rejected with HTTP 404 Not Found.');

    // 8. Test Timer Expiry does NOT auto-complete quest
    console.log('\n[Test 8/10] Verification: Expiry does NOT auto-complete quest...');
    // Manually set timer_started_at in past to simulate expiration
    await db.query(
      `UPDATE quests
       SET timer_status = 'RUNNING',
           timer_started_at = CURRENT_TIMESTAMP - INTERVAL '4 hours',
           timer_duration_seconds = 3600,
           timer_remaining_seconds = 3600
       WHERE id = $1;`,
      [twoHourQuestId]
    );

    const expiredFetchRes = await request('GET', `/api/quests/${twoHourQuestId}`, null, tokenA);
    if (expiredFetchRes.body.data.timer_status !== 'EXPIRED' || !expiredFetchRes.body.data.is_expired) {
      throw new Error(`Expected EXPIRED timer status, got ${expiredFetchRes.body.data.timer_status}`);
    }
    if (expiredFetchRes.body.data.status === 'COMPLETED') {
      throw new Error('CRITICAL BUG: Timer expiration automatically completed the quest!');
    }
    console.log('  ✅ Timer expired ("Time\'s up") verified. Quest remains ACTIVE and incomplete.');

    // 9. Manual Quest Completion on Expired Quest
    console.log('\n[Test 9/10] Completing quest with expired timer via standard completion flow...');
    const completeRes = await request('POST', `/api/quests/${twoHourQuestId}/complete`, {}, tokenA);
    if (completeRes.status !== 200 || completeRes.body.data.quest.status !== 'COMPLETED') {
      throw new Error(`Failed to complete quest after timer expiration: ${JSON.stringify(completeRes.body)}`);
    }
    console.log('  ✅ Standard quest completion succeeded cleanly on quest with expired timer.');

    // 10. Test Daily Quest Rollover
    console.log('\n[Test 10/10] Testing Daily Quest timer rollover on new calendar date...');
    await db.query(
      `UPDATE quests
       SET timer_status = 'PAUSED',
           timer_remaining_seconds = 500,
           timer_current_day = CURRENT_DATE - INTERVAL '1 day'
       WHERE id = $1;`,
      [hourQuestId]
    );

    const rolloverRes = await request('GET', `/api/quests/${hourQuestId}`, null, tokenA);
    if (rolloverRes.body.data.timer_status !== 'STOPPED' || rolloverRes.body.data.timer_remaining_seconds !== 3600) {
      throw new Error(`Expected daily rollover reset to STOPPED (3600s), got: ${JSON.stringify(rolloverRes.body.data)}`);
    }
    console.log('  ✅ Daily Quest timer rollover verified! Yesterday\'s timer reset for today\'s daily occurrence.');

    // Clean up test data
    console.log('\n🧹 Cleaning up test records...');
    await db.query('DELETE FROM users WHERE email IN ($1, $2);', [userAEmail, userBEmail]);
    console.log('  ✅ Test data cleaned up.');

    console.log('\n🎉 ALL 10 QUEST TIMER TESTS PASSED PERFECTLY!');
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }
}

if (require.main === module) {
  runTimerTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Quest Timer Suite Failed:', err);
      process.exit(1);
    });
}

module.exports = { runTimerTests };
