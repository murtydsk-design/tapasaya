-- ===================================================
-- TAPASYA (Life RPG) PostgreSQL Schema DDL
-- Database Host: Neon PostgreSQL
-- Documentation: DATABASE.md, RULES.md, DESIGN.md, PRD.md
-- ===================================================

-- Enable pgcrypto / uuid extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    google_avatar_url VARCHAR(500) NULL,
    custom_avatar_url VARCHAR(500) NULL,
    avatar_type VARCHAR(20) NOT NULL DEFAULT 'preset',
    avatar_id VARCHAR(50) NOT NULL DEFAULT 'avatar_01',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Characters Table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    gold INTEGER NOT NULL DEFAULT 0 CHECK (gold >= 0),
    strength INTEGER NOT NULL DEFAULT 0 CHECK (strength >= 0),
    intellect INTEGER NOT NULL DEFAULT 0 CHECK (intellect >= 0),
    focus INTEGER NOT NULL DEFAULT 0 CHECK (focus >= 0),
    knowledge INTEGER NOT NULL DEFAULT 0 CHECK (knowledge >= 0),
    discipline INTEGER NOT NULL DEFAULT 0 CHECK (discipline >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Quests Table
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('FITNESS', 'CODING', 'STUDY', 'MEDITATION', 'PRODUCTIVITY')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    type VARCHAR(20) NOT NULL DEFAULT 'ONE_DAY' CHECK (type IN ('DAILY', 'ONE_DAY')),
    quest_date DATE NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
    gold_reward INTEGER NOT NULL CHECK (gold_reward >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Quest Completions Table
CREATE TABLE IF NOT EXISTS quest_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
    gold_earned INTEGER NOT NULL CHECK (gold_earned >= 0),
    attribute VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Streaks Table (Global Activity)
CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
    last_activity_date DATE NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5b. Daily Quest Individual Streaks Table
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

-- 6. Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('THEME', 'BADGE', 'COSMETIC', 'PROFILE_ITEM')),
    price INTEGER NOT NULL CHECK (price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_user_reward UNIQUE (user_id, reward_id)
);

-- 8. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
    price_paid INTEGER NOT NULL CHECK (price_paid >= 0),
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Frequently Queried Columns
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_quests_created_at ON quests(created_at);
CREATE INDEX IF NOT EXISTS idx_quest_completions_user_id ON quest_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_completions_completed_at ON quest_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
