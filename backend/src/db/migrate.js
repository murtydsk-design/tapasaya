require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function runMigration() {
  console.log('🔄 Starting TAPASYA PostgreSQL Migration...');
  
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('your_password') || process.env.DATABASE_URL.includes('your_neon_connection_string')) {
    console.error('❌ ERROR: DATABASE_URL in backend/.env is missing or contains placeholder values.');
    console.error('Please configure your real Neon PostgreSQL connection string in backend/.env:');
    console.error('DATABASE_URL=postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

    console.log('📋 Applying DDL Schema...');
    await client.query(schemaSql);

    // Apply attribute migration: Set defaults to 0 and update constraints
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_avatar_url VARCHAR(500);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_avatar_url VARCHAR(500);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_type VARCHAR(20) DEFAULT 'preset';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(50) DEFAULT 'aarav';

      ALTER TABLE characters ALTER COLUMN strength SET DEFAULT 0;
      ALTER TABLE characters ALTER COLUMN intellect SET DEFAULT 0;
      ALTER TABLE characters ALTER COLUMN focus SET DEFAULT 0;
      ALTER TABLE characters ALTER COLUMN knowledge SET DEFAULT 0;
      ALTER TABLE characters ALTER COLUMN discipline SET DEFAULT 0;

      ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_strength_check;
      ALTER TABLE characters ADD CONSTRAINT characters_strength_check CHECK (strength >= 0);

      ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_intellect_check;
      ALTER TABLE characters ADD CONSTRAINT characters_intellect_check CHECK (intellect >= 0);

      ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_focus_check;
      ALTER TABLE characters ADD CONSTRAINT characters_focus_check CHECK (focus >= 0);

      ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_knowledge_check;
      ALTER TABLE characters ADD CONSTRAINT characters_knowledge_check CHECK (knowledge >= 0);

      ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_discipline_check;
      ALTER TABLE characters ADD CONSTRAINT characters_discipline_check CHECK (discipline >= 0);
    `);
    console.log('✅ Schema tables, constraints, avatar columns, and attribute defaults updated successfully.');

    console.log('🌱 Applying Seed Data...');
    await client.query(seedSql);
    console.log('✅ Initial rewards seeded successfully.');

    console.log('🎉 TAPASYA Database Migration Completed Cleanly!');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
