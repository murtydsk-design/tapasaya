process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/db');

async function testAuthenticationSuite() {
  console.log('🧪 Starting TAPASYA Authentication & Security Verification (Phase 4)...');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const PORT = server.address().port;
  console.log(`  ✅ Test server running on http://localhost:${PORT}`);

  function makeRequest(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

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

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  let userAToken = null;
  let userAId = null;
  let userBToken = null;
  let userBId = null;
  const userAEmail = `auth_test_hero_a_${Date.now()}@tapasya.rpg`;
  const userBEmail = `auth_test_hero_b_${Date.now()}@tapasya.rpg`;
  const userAPassword = 'HeroicPassword123!';

  try {
    // 1. User Registration & Transaction Check
    console.log('\n[Test 1/12] Testing POST /api/auth/register (Atomic Transaction)...');
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Arjuna Adventurer',
      email: userAEmail,
      password: userAPassword
    });

    console.log(`  Status: ${regRes.status}, Response:`, regRes.body);
    if (regRes.status !== 201 || !regRes.body.success || !regRes.body.token) {
      throw new Error('Registration failed!');
    }
    userAToken = regRes.body.token;
    userAId = regRes.body.user.id;
    console.log(`  ✅ User A registered cleanly. ID=${userAId}`);

    // Verify DB transaction created users, characters, and streaks records
    const charRes = await db.query('SELECT * FROM characters WHERE user_id = $1;', [userAId]);
    const streakRes = await db.query('SELECT * FROM streaks WHERE user_id = $1;', [userAId]);
    if (charRes.rows.length !== 1 || streakRes.rows.length !== 1) {
      throw new Error('Database transaction incomplete! Character or streak record missing.');
    }
    const char = charRes.rows[0];
    const streak = streakRes.rows[0];
    console.log('  ✅ Database Transaction verified! `users`, `characters`, and `streaks` records created atomically.');

    // 2. Character & Streak Starting State Verification
    console.log('\n[Test 2/12] Verifying starting state RPG stats & defaults...');
    if (char.level !== 1 || char.total_xp !== 0 || char.gold !== 0 ||
        char.strength !== 0 || char.intellect !== 0 || char.focus !== 0 ||
        char.knowledge !== 0 || char.discipline !== 0) {
      throw new Error(`Character starting stats mismatch: ${JSON.stringify(char)}`);
    }
    if (streak.current_streak !== 0 || streak.best_streak !== 0) {
      throw new Error(`Streak starting stats mismatch: ${JSON.stringify(streak)}`);
    }
    console.log('  ✅ Character defaults verified (Level 1, XP 0, Gold 0, Str:0, Int:0, Foc:0, Kno:0, Dis:0) and Streaks (0 current, 0 best).');

    // 3. Password Hashing Security Check
    console.log('\n[Test 3/12] Verifying Password Hashing Security...');
    const userDbRes = await db.query('SELECT password_hash FROM users WHERE id = $1;', [userAId]);
    const hash = userDbRes.rows[0].password_hash;
    if (hash === userAPassword || !hash.startsWith('$2')) {
      throw new Error('SECURITY VIOLATION: Password stored as plaintext or invalid hash!');
    }
    const rawResString = JSON.stringify(regRes.body);
    if (rawResString.includes(hash) || rawResString.includes(userAPassword)) {
      throw new Error('SECURITY VIOLATION: Password or password_hash leaked in API response!');
    }
    console.log('  ✅ Password securely hashed (`bcryptjs`) and never exposed in API responses.');

    // 4. Duplicate Email Rejection
    console.log('\n[Test 4/12] Testing Duplicate Email Registration Rejection...');
    const dupRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Duplicate Hero',
      email: userAEmail,
      password: userAPassword
    });
    console.log(`  Status: ${dupRes.status}, Response:`, dupRes.body);
    if (dupRes.status !== 400 || dupRes.body.success !== false) {
      throw new Error('Duplicate email registration was not rejected!');
    }
    console.log('  ✅ Duplicate email registration correctly rejected with HTTP 400.');

    // 5. Input Validation Testing
    console.log('\n[Test 5/12] Testing Server-side Input Validation...');
    const invalidEmailRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Test',
      email: 'not-an-email',
      password: 'password123'
    });
    const invalidPassRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Test',
      email: 'valid@tapasya.rpg',
      password: '123'
    });
    if (invalidEmailRes.status !== 400 || invalidPassRes.status !== 400) {
      throw new Error('Invalid input validation failed!');
    }
    console.log('  ✅ Malformed inputs (invalid email, short password) correctly rejected.');

    // 6. User Login (Valid Credentials)
    console.log('\n[Test 6/12] Testing POST /api/auth/login with valid credentials...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: userAEmail,
      password: userAPassword
    });
    console.log(`  Status: ${loginRes.status}, Response:`, loginRes.body);
    if (loginRes.status !== 200 || !loginRes.body.success || !loginRes.body.token) {
      throw new Error('Login failed for valid credentials!');
    }
    console.log('  ✅ Login successful. JWT token issued.');

    // 7. Login Rejection (Invalid Credentials)
    console.log('\n[Test 7/12] Testing Login Rejection for invalid password...');
    const invalidLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: userAEmail,
      password: 'WrongPassword999!'
    });
    console.log(`  Status: ${invalidLoginRes.status}, Response:`, invalidLoginRes.body);
    if (invalidLoginRes.status !== 401 || invalidLoginRes.body.success !== false) {
      throw new Error('Invalid login credentials were not rejected!');
    }
    console.log('  ✅ Invalid password login correctly rejected with generic HTTP 401 message.');

    // 8. GET /api/auth/me (Protected Endpoint)
    console.log('\n[Test 8/12] Testing GET /api/auth/me with valid Bearer token...');
    const meRes = await makeRequest('/api/auth/me', 'GET', null, userAToken);
    console.log(`  Status: ${meRes.status}, Response:`, meRes.body);
    if (meRes.status !== 200 || !meRes.body.success || meRes.body.user.id !== userAId) {
      throw new Error('GET /api/auth/me failed for authenticated user!');
    }
    console.log('  ✅ GET /api/auth/me returned correct authenticated user profile.');

    // 9. Protected Endpoint Rejection (Missing & Invalid Token)
    console.log('\n[Test 9/12] Testing Protected Endpoint Rejection (No token & Tampered token)...');
    const noTokenRes = await makeRequest('/api/auth/me', 'GET', null, null);
    const badTokenRes = await makeRequest('/api/auth/me', 'GET', null, 'invalid.tampered.token');
    if (noTokenRes.status !== 401 || badTokenRes.status !== 401) {
      throw new Error('Protected endpoint failed to reject unauthenticated requests!');
    }
    console.log('  ✅ Unauthenticated and tampered requests correctly rejected with HTTP 401.');

    // 10. Logout Endpoint
    console.log('\n[Test 10/12] Testing POST /api/auth/logout...');
    const logoutRes = await makeRequest('/api/auth/logout', 'POST');
    console.log(`  Status: ${logoutRes.status}, Response:`, logoutRes.body);
    if (logoutRes.status !== 200 || !logoutRes.body.success) {
      throw new Error('Logout endpoint failed!');
    }
    console.log('  ✅ POST /api/auth/logout acknowledged cleanly.');

    // 11. User Data Isolation Test
    console.log('\n[Test 11/12] Testing User Data Isolation between User A and User B...');
    const regBRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Bhim Adventurer',
      email: userBEmail,
      password: 'UserBPassword456!'
    });
    userBToken = regBRes.body.token;
    userBId = regBRes.body.user.id;

    const meARes = await makeRequest('/api/auth/me', 'GET', null, userAToken);
    const meBRes = await makeRequest('/api/auth/me', 'GET', null, userBToken);

    if (meARes.body.user.id !== userAId || meBRes.body.user.id !== userBId || meARes.body.user.id === meBRes.body.user.id) {
      throw new Error('User isolation failure! Token returned wrong user context.');
    }
    console.log('  ✅ User isolation verified! User A token resolves exclusively to User A, User B token to User B.');

    // 12. Cleanup Test Users
    console.log('\n[Test 12/12] Cleaning up test records...');
    await db.query('DELETE FROM users WHERE id IN ($1, $2);', [userAId, userBId]);
    console.log('  ✅ Test users and cascading character/streak records cleaned up cleanly.');

    console.log('\n🎉 ALL PHASE 4 AUTHENTICATION & SECURITY TESTS PASSED CLEANLY!');
    server.close();
    await db.pool.end();
  } catch (err) {
    console.error('\n❌ AUTHENTICATION TEST FAILED:', err.message);
    if (userAId || userBId) {
      try {
        await db.query('DELETE FROM users WHERE id IN ($1, $2);', [userAId, userBId].filter(Boolean));
      } catch (e) {
        // Silent cleanup
      }
    }
    server.close();
    await db.pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  testAuthenticationSuite();
}

module.exports = { testAuthenticationSuite };
