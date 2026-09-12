process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/db');

async function runSecurityTestSuite() {
  console.log('🛡️ Starting TAPASYA Auth Security & Google Login Verification Suite...');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const PORT = server.address().port;
  console.log(`  ✅ Test server listening on http://localhost:${PORT}`);

  function makeRequest(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
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
            let jsonBody;
            try {
              jsonBody = JSON.parse(data);
            } catch (e) {
              jsonBody = data;
            }
            resolve({ status: res.statusCode, headers: res.headers, body: jsonBody });
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

  const testUser = {
    name: 'Security Test Hero',
    email: `security_hero_${Date.now()}@tapasya.rpg`,
    password: 'SuperSecurePassword123!'
  };
  let userId = null;
  let userToken = null;

  try {
    // 1. Test Helmet Security Headers
    console.log('\n[Test 1/7] Testing Security Headers (Helmet)...');
    const healthRes = await makeRequest('/api/health', 'GET');
    if (healthRes.headers['x-content-type-options'] !== 'nosniff') {
      throw new Error('Helmet header X-Content-Type-Options missing!');
    }
    console.log('  ✅ Security headers (Helmet) present in HTTP responses.');

    // 2. User Registration & Password Omission
    console.log('\n[Test 2/7] Testing User Registration & Password Omission...');
    const regRes = await makeRequest('/api/auth/register', 'POST', testUser);
    if (regRes.status !== 201 || !regRes.body.token) {
      throw new Error(`Registration failed! ${JSON.stringify(regRes.body)}`);
    }
    userId = regRes.body.user.id;
    userToken = regRes.body.token;

    if (regRes.body.user.password || regRes.body.user.password_hash) {
      throw new Error('SECURITY VIOLATION: Password leaked in registration response!');
    }
    console.log('  ✅ User registered. Password and password_hash correctly omitted from API response.');

    // 3. GET /api/auth/me Profile Protection
    console.log('\n[Test 3/7] Testing GET /api/auth/me Endpoint...');
    const meRes = await makeRequest('/api/auth/me', 'GET', null, userToken);
    if (meRes.status !== 200 || meRes.body.user.id !== userId) {
      throw new Error('GET /api/auth/me profile fetch failed!');
    }
    if (meRes.body.user.password || meRes.body.user.password_hash) {
      throw new Error('SECURITY VIOLATION: Password leaked in GET /api/auth/me profile!');
    }
    console.log('  ✅ GET /api/auth/me returns profile securely without exposing password hashes.');

    // 4. Generic Login Error Messages
    console.log('\n[Test 4/7] Testing Generic Login Error Messages...');
    const wrongPassRes = await makeRequest('/api/auth/login', 'POST', {
      email: testUser.email,
      password: 'WrongPassword999!'
    });
    if (wrongPassRes.status !== 401 || wrongPassRes.body.message !== 'Invalid email or password.') {
      throw new Error(`Expected generic error 'Invalid email or password.', got: ${wrongPassRes.body.message}`);
    }

    const wrongEmailRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'non_existent_email_12345@tapasya.rpg',
      password: 'SomePassword123!'
    });
    if (wrongEmailRes.status !== 401 || wrongEmailRes.body.message !== 'Invalid email or password.') {
      throw new Error(`Expected generic error 'Invalid email or password.', got: ${wrongEmailRes.body.message}`);
    }
    console.log('  ✅ Login returns generic error "Invalid email or password." without revealing email existence.');

    // 5. Google Login Route Validation (Missing Credential)
    console.log('\n[Test 5/7] Testing POST /api/auth/google Missing Credential Validation...');
    const googleMissingRes = await makeRequest('/api/auth/google', 'POST', {});
    if (googleMissingRes.status !== 400 || googleMissingRes.body.success !== false) {
      throw new Error('POST /api/auth/google failed to reject missing credential payload!');
    }
    console.log('  ✅ Google auth correctly validates missing token payload (HTTP 400).');

    // 6. Google Login Route Verification (Invalid Credential)
    console.log('\n[Test 6/7] Testing POST /api/auth/google Invalid Token Verification...');
    const googleInvalidRes = await makeRequest('/api/auth/google', 'POST', { credential: 'fake_invalid_token' });
    if (googleInvalidRes.status !== 401 || googleInvalidRes.body.success !== false) {
      throw new Error('POST /api/auth/google failed to reject invalid OAuth token payload!');
    }
    console.log('  ✅ Google auth correctly rejects unverified/invalid token (HTTP 401).');

    // 7. Cleanup
    console.log('\n[Test 7/7] Cleaning up security test records...');
    if (userId) {
      await db.query('DELETE FROM users WHERE id = $1;', [userId]);
    }
    console.log('  ✅ Cleanup complete.');

    console.log('\n🎉 ALL AUTHENTICATION SECURITY & GOOGLE OAUTH VERIFICATION TESTS PASSED!');
    server.close();
    await db.pool.end();
  } catch (err) {
    console.error('\n❌ SECURITY TEST FAILED:', err.message);
    if (userId) {
      try {
        await db.query('DELETE FROM users WHERE id = $1;', [userId]);
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
  runSecurityTestSuite();
}

module.exports = { runSecurityTestSuite };
