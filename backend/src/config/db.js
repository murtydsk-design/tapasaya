const { Pool } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes('sslmode=require') && !connectionString.includes('uselibpqcompat')) {
  connectionString += '&uselibpqcompat=true';
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' || (connectionString && connectionString.includes('neon.tech'))
    ? { rejectUnauthorized: false }
    : false
});

/**
 * Tests the PostgreSQL connection cleanly without exposing credentials.
 */
async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time;');
    return {
      connected: true,
      timestamp: res.rows[0].current_time
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection
};
