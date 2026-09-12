require('dotenv').config();
const { pool } = require('./index');

async function updateDailyStreaksSchema() {
  console.log('🔄 Updating TAPASYA PostgreSQL Schema for Individual Daily Quest Streaks...');
  const client = await pool.connect();

  try {
    console.log('📋 Adding start_date and end_date columns to quests table...');
    await client.query(`
      ALTER TABLE quests 
      ADD COLUMN IF NOT EXISTS start_date DATE NULL,
      ADD COLUMN IF NOT EXISTS end_date DATE NULL;
    `);

    console.log('📋 Creating daily_quest_streaks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_quest_streaks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quest_id UUID NOT NULL UNIQUE REFERENCES quests(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
        best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
        last_completed_date DATE NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📋 Creating indexes for daily_quest_streaks table...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_quest_streaks_quest_id 
      ON daily_quest_streaks (quest_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_quest_streaks_user_id 
      ON daily_quest_streaks (user_id);
    `);

    console.log('✅ Daily Quest Streaks schema updated successfully in PostgreSQL!');
  } catch (err) {
    console.error('❌ Schema update failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  updateDailyStreaksSchema();
}

module.exports = { updateDailyStreaksSchema };
