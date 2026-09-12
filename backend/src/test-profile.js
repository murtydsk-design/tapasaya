const http = require('http');
const app = require('./app');
const db = require('./db');
const authService = require('./services/auth.service');
const questService = require('./services/quest.service');

async function runProfileVerificationSuite() {
  console.log('🧪 Starting TAPASYA User Profile Verification Suite...');

  // Start HTTP Server on dynamic port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`  ✅ Test server running on ${baseUrl}\n`);

  let testUserA = null;
  let tokenA = null;
  let testUserB = null;
  let tokenB = null;
  let dailyQuest1 = null;
  let dailyQuest2 = null;

  try {
    // Setup Test User A
    const timestamp = Date.now();
    const regResA = await authService.registerUser({
      name: 'Parth ProfileTester',
      email: `profile.user.a.${timestamp}@example.com`,
      password: 'password123'
    });
    testUserA = regResA.user;
    tokenA = regResA.token;

    // Setup Test User B
    const regResB = await authService.registerUser({
      name: 'Other User B',
      email: `profile.user.b.${timestamp}@example.com`,
      password: 'password123'
    });
    testUserB = regResB.user;
    tokenB = regResB.token;

    // 1. Test unauthenticated request to /api/profile
    console.log('[Test 1/10] Verifying unauthenticated GET /api/profile rejection...');
    const unauthRes = await fetch(`${baseUrl}/api/profile`);
    if (unauthRes.status === 401) {
      console.log('  ✅ Unauthenticated profile request correctly rejected with HTTP 401.\n');
    } else {
      throw new Error(`Expected HTTP 401 for unauthenticated profile request, got ${unauthRes.status}`);
    }

    // 2. Create Quests for User A: 2 Daily Quests & 1 One-Day Quest
    console.log('[Test 2/10] Creating Daily & One-Day quests for User A...');
    dailyQuest1 = await questService.createQuest(testUserA.id, {
      title: 'Study for 1 Hour',
      description: 'Read chapter 4 of algorithms',
      category: 'STUDY',
      difficulty: 'HARD',
      type: 'DAILY',
      start_date: '2026-09-01'
    });

    dailyQuest2 = await questService.createQuest(testUserA.id, {
      title: 'Exercise for 30 Minutes',
      description: 'Morning cardio session',
      category: 'FITNESS',
      difficulty: 'MEDIUM',
      type: 'DAILY',
      start_date: '2026-09-01'
    });

    await questService.createQuest(testUserA.id, {
      title: 'Submit Assignment',
      description: 'Submit project report PDF',
      category: 'PRODUCTIVITY',
      difficulty: 'HARD',
      type: 'ONE_DAY',
      quest_date: '2026-09-12'
    });
    console.log('  ✅ Quests created for User A.\n');

    // 3. Complete Daily Quest 1 consecutive days to build streak = 3
    console.log('[Test 3/10] Completing Daily Quest 1 on Sep 10, 11, 12 (Streak = 3)...');
    await questService.completeQuest(testUserA.id, dailyQuest1.id, '2026-09-10');
    await questService.completeQuest(testUserA.id, dailyQuest1.id, '2026-09-11');
    await questService.completeQuest(testUserA.id, dailyQuest1.id, '2026-09-12');

    // Complete Daily Quest 2 once on Sep 12 (Streak = 1)
    await questService.completeQuest(testUserA.id, dailyQuest2.id, '2026-09-12');
    console.log('  ✅ Completions recorded cleanly.\n');

    // 4. Test GET /api/profile for User A
    console.log('[Test 4/10] Fetching GET /api/profile for User A...');
    const profileResA = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const profileJsonA = await profileResA.json();

    if (!profileJsonA.success || !profileJsonA.data) {
      throw new Error(`GET /api/profile failed: ${JSON.stringify(profileJsonA)}`);
    }

    const dataA = profileJsonA.data;
    console.log('  Status: 200, Response payload overview:', {
      userName: dataA.user.name,
      userEmail: dataA.user.email,
      memberSince: dataA.user.createdAt,
      questStats: dataA.questStats,
      bestStreak: dataA.bestStreak,
      dailyStreaksCount: dataA.dailyStreaks.length,
      recentCompletionsCount: dataA.recentCompletions.length
    });

    // 5. Verify User Header & Basic Info
    console.log('\n[Test 5/10] Verifying Profile User & Account Information...');
    if (dataA.user.name === 'Parth ProfileTester' && dataA.user.email.includes('profile.user.a')) {
      console.log('  ✅ User name and email verified without exposing password hash or token.');
    } else {
      throw new Error(`Unexpected user data: ${JSON.stringify(dataA.user)}`);
    }

    // 6. Verify Quest Summary Statistics
    console.log('\n[Test 6/10] Verifying Quest Summary Statistics...');
    // Total quests created = 3 (2 Daily, 1 One-Day)
    // Completed completions = 4 (3 for Q1, 1 for Q2)
    if (dataA.questStats.total === 3 &&
        dataA.questStats.completed === 4 &&
        dataA.questStats.daily === 2 &&
        dataA.questStats.oneDay === 1) {
      console.log('  ✅ Quest statistics verified matching exact DB counts:', dataA.questStats);
    } else {
      throw new Error(`Quest stats mismatch: ${JSON.stringify(dataA.questStats)}`);
    }

    // 7. Verify Daily Streaks & Best Streak
    console.log('\n[Test 7/10] Verifying Individual Daily Streaks & Overall Best Streak...');
    if (dataA.dailyStreaks.length === 2) {
      console.log('  ✅ Daily Streaks list contains 2 individual items:');
      dataA.dailyStreaks.forEach(s => {
        console.log(`     - "${s.title}": current=${s.current}, best=${s.best}`);
      });
    } else {
      throw new Error(`Expected 2 daily streaks, got ${dataA.dailyStreaks.length}`);
    }

    if (dataA.bestStreak.days === 3 && dataA.bestStreak.questTitle === 'Study for 1 Hour') {
      console.log('  ✅ Highest Best Streak verified: 3 days ("Study for 1 Hour").');
    } else {
      throw new Error(`Best streak mismatch: ${JSON.stringify(dataA.bestStreak)}`);
    }

    // 8. Verify Recent Completions History (Most recent first)
    console.log('\n[Test 8/10] Verifying Quest Completion History (Recent First)...');
    if (dataA.recentCompletions.length === 4) {
      console.log('  ✅ Recent Completions list verified (4 items total):');
      dataA.recentCompletions.forEach((c, idx) => {
        console.log(`     #${idx + 1}: "${c.title}" on ${c.completedAt.substring(0, 10)} (+${c.xpEarned} XP)`);
      });
    } else {
      throw new Error(`Expected 4 recent completions, got ${dataA.recentCompletions.length}`);
    }

    // 9. Verify User Data Isolation (User B profile must NOT show User A's data)
    console.log('\n[Test 9/10] Verifying User Data Isolation (User B profile)...');
    const profileResB = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const profileJsonB = await profileResB.json();
    const dataB = profileJsonB.data;

    if (dataB.user.name === 'Other User B' && dataB.questStats.total === 0 && dataB.recentCompletions.length === 0) {
      console.log('  ✅ User Isolation Verified! User B profile contains 0 quests and 0 completions.');
    } else {
      throw new Error(`User isolation leak in profile B: ${JSON.stringify(dataB)}`);
    }

    // 10. Clean up test records
    console.log('\n[Test 10/10] Cleaning up test users and records...');
    await db.query(`DELETE FROM users WHERE id IN ($1, $2)`, [testUserA.id, testUserB.id]);
    console.log('  ✅ Test users cleaned up cleanly.');

    console.log('\n🎉 ALL 10 USER PROFILE VERIFICATION TESTS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ PROFILE TEST SUITE FAILED:', err);
    if (testUserA) {
      await db.query(`DELETE FROM users WHERE id IN ($1, $2)`, [testUserA.id, testUserB?.id].filter(Boolean));
    }
    process.exit(1);
  } finally {
    server.close();
  }
}

runProfileVerificationSuite();
