process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const { testDatabase } = require('./db/test-db');

async function testBackendFoundation() {
  console.log('🧪 Starting TAPASYA Backend Foundation Verification (Phases 3-6)...');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const PORT = server.address().port;
  console.log(`  ✅ Temporary test server listening on http://localhost:${PORT}`);

  function fetchJson(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = http.request(
        `http://localhost:${PORT}${path}`,
        { method },
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
      req.end();
    });
  }

  try {
    // 1. GET /api/health
    console.log('\n[Test 1/6] Testing GET /api/health endpoint...');
    const health = await fetchJson('/api/health');
    console.log(`  Status: ${health.status}, Response:`, health.body);
    if (health.status !== 200 || !health.body.success || health.body.database !== 'connected') {
      throw new Error('Health check failed or database disconnected!');
    }
    console.log('  ✅ GET /api/health passed cleanly with live database connectivity!');

    // 2. 404 Route Handling
    console.log('\n[Test 2/6] Testing 404 Route Handler for unmatched endpoint...');
    const notFound = await fetchJson('/api/unknown-endpoint');
    console.log(`  Status: ${notFound.status}, Response:`, notFound.body);
    if (notFound.status !== 404 || notFound.body.success !== false) {
      throw new Error('404 handler failed!');
    }
    console.log('  ✅ 404 route handler returned consistent JSON error.');

    // 3. Route Architecture & Auth Protection
    console.log('\n[Test 3/6] Testing API route protection & placeholders...');
    const authRes = await fetchJson('/api/auth/me'); // Protected: 401
    const questRes = await fetchJson('/api/quests'); // Protected: 401
    const charRes = await fetchJson('/api/character'); // Protected: 401
    const rewRes = await fetchJson('/api/rewards'); // Protected: 401 (Phase 7 Implemented)
    
    if (authRes.status !== 401 || questRes.status !== 401 || charRes.status !== 401 || rewRes.status !== 401) {
      throw new Error('Route architecture placeholder or auth protection check failed!');
    }
    console.log('  ✅ Protected routes (/auth/me, /quests, /character, /rewards) return 401 unauthorized when unauthenticated.');

    // 4. Centralized Error Handling
    console.log('\n[Test 4/6] Testing Centralized Error Handler...');
    const errRes = await fetchJson('/api/test-error');
    console.log(`  Status: ${errRes.status}, Response:`, errRes.body);
    if (errRes.status !== 400 || errRes.body.success !== false || errRes.body.message !== 'Custom Test Server Error') {
      throw new Error('Centralized error handler test failed!');
    }
    console.log('  ✅ Centralized error handler returned formatted JSON error.');

    // 5. Environment & Security Check
    console.log('\n[Test 5/6] Verifying Security & Environment leakage...');
    const rawResponse = JSON.stringify(health.body);
    if (rawResponse.includes('neondb_owner') || rawResponse.includes('postgresql://') || rawResponse.includes('password')) {
      throw new Error('SECURITY VIOLATION: Database connection string or password exposed in response!');
    }
    console.log('  ✅ Security check passed. No passwords or DATABASE_URL exposed in HTTP responses.');

    // 6. Phase 2 Database Schema Integrity Test
    console.log('\n[Test 6/6] Verifying Phase 2 PostgreSQL Database Schema integrity...');
    server.close();
    await testDatabase();

    console.log('\n🎉 ALL PHASE 3-6 BACKEND FOUNDATION TESTS PASSED CLEANLY!');
  } catch (err) {
    console.error('\n❌ BACKEND TEST FAILED:', err.message);
    server.close();
    process.exit(1);
  }
}

if (require.main === module) {
  testBackendFoundation();
}

module.exports = { testBackendFoundation };
