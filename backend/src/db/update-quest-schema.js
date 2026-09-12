require('dotenv').config();
const { pool } = require('./index');

async function updateQuestSchema() {
  console.log('🔄 Updating TAPASYA PostgreSQL Schema for Daily & One-Day Quests...');
  const client = await pool.connect();

  try {
    console.log('📋 Adding type and quest_date columns to quests table...');
    await client.query(`
      ALTER TABLE quests 
      ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'ONE_DAY';
    `);

    // Ensure constraint on type
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_quest_type'
        ) THEN
          ALTER TABLE quests ADD CONSTRAINT check_quest_type CHECK (type IN ('DAILY', 'ONE_DAY'));
        END IF;
      END $$;
    `);

    await client.query(`
      ALTER TABLE quests 
      ADD COLUMN IF NOT EXISTS quest_date DATE NULL;
    `);

    console.log('📋 Adding completed_date column to quest_completions table...');
    await client.query(`
      ALTER TABLE quest_completions 
      ADD COLUMN IF NOT EXISTS completed_date DATE NOT NULL DEFAULT CURRENT_DATE;
    `);

    console.log('📋 Creating indexes for Daily quest completion checks...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quest_completions_quest_date 
      ON quest_completions (quest_id, completed_date);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quests_type 
      ON quests (type);
    `);

    console.log('✅ Quest schema updated successfully in PostgreSQL!');
  } catch (err) {
    console.error('❌ Schema update failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  updateQuestSchema();
}

module.exports = { updateQuestSchema };
