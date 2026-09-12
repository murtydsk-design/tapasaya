# Life RPG — Database Design

## 1. Purpose

This document defines the PostgreSQL database structure for Life RPG.

The database will be hosted using Neon PostgreSQL.

The database is the persistent source of truth for:

- Users
- Characters
- Quests
- Quest completion
- XP
- Levels
- Character attributes
- Gold
- Streaks
- Rewards
- Inventory
- Purchases

---

# 2. Database Technology

Database:

    PostgreSQL

Hosted using:

    Neon PostgreSQL

The backend will communicate with PostgreSQL.

The React frontend will never connect directly to the database.

Architecture:

    React
       ↓
    Express API
       ↓
    Neon PostgreSQL

---

# 3. Database Design Principles

The database should:

- Maintain strong relationships between entities.
- Prevent invalid data where possible.
- Keep user data isolated.
- Support historical records.
- Avoid unnecessary duplication.
- Use foreign keys.
- Use appropriate indexes.
- Support database transactions for important game operations.
- Store timestamps consistently.

---

# 4. Main Tables

The initial database will contain these tables:

    users
       │
       ├── characters
       │
       ├── quests
       │       │
       │       └── quest_completions
       │
       ├── streaks
       │
       ├── inventory
       │       │
       │       └── rewards
       │
       └── purchases

Additional supporting tables may be introduced if required during implementation.

---

# 5. Entity Relationship Overview

    USERS
      │
      ├──────────────→ CHARACTERS
      │
      ├──────────────→ QUESTS
      │                     │
      │                     ↓
      │              QUEST_COMPLETIONS
      │
      ├──────────────→ STREAKS
      │
      ├──────────────→ INVENTORY
      │                     │
      │                     ↓
      │                  REWARDS
      │
      └──────────────→ PURCHASES
                            │
                            ↓
                         REWARDS

---

# 6. Users Table

## Table

    users

## Purpose

Stores authentication and basic user information.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Unique user ID |
| name | VARCHAR(100) | NOT NULL | User's name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email |
| password_hash | TEXT | NULLABLE | Hashed password (NULL for Google OAuth users) |
| google_id | VARCHAR(255) | NULLABLE, UNIQUE | Google OAuth subject ID |
| google_avatar_url | VARCHAR(500) | NULLABLE | Verified Google profile picture URL |
| avatar_type | VARCHAR(20) | DEFAULT 'preset' | Avatar source type ('preset' or 'google') |
| avatar_id | VARCHAR(50) | DEFAULT 'avatar_01' | Built-in TAPASYA preset avatar ID ('avatar_01'...'avatar_08') |
| created_at | TIMESTAMPTZ | NOT NULL | Account creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update time |

---

# 7. Characters Table

## Table

    characters

## Purpose

Stores the RPG character and overall progression of a user.

Each user has exactly one character.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Character ID |
| user_id | UUID | UNIQUE, FK | Owner |
| level | INTEGER | NOT NULL | Current level |
| total_xp | INTEGER | NOT NULL | Total accumulated XP |
| gold | INTEGER | NOT NULL | Current Gold |
| created_at | TIMESTAMPTZ | NOT NULL | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update time |

## Default Values

New character:

    level = 1
    total_xp = 0
    gold = 0

---

# 8. Character Attributes

The character has five attributes:

- Strength
- Intellect
- Focus
- Knowledge
- Discipline

Each new character starts with:

    Strength = 0
    Intellect = 0
    Focus = 0
    Knowledge = 0
    Discipline = 0

These values represent total valid quest completions in each category.

## Additional Columns

| Column | Type | Default |
|---|---|---:|
| strength | INTEGER | 0 |
| intellect | INTEGER | 0 |
| focus | INTEGER | 0 |
| knowledge | INTEGER | 0 |
| discipline | INTEGER | 0 |

The backend controls increases to these values.

---

# 9. Quests Table

## Table

    quests

## Purpose

Stores user-created real-life quests.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Quest ID |
| user_id | UUID | FK, NOT NULL | Quest owner |
| title | VARCHAR(150) | NOT NULL | Quest title |
| description | TEXT | NULL | Quest description |
| category | VARCHAR(30) | NOT NULL | Quest category |
| difficulty | VARCHAR(20) | NOT NULL | Quest difficulty |
| xp_reward | INTEGER | NOT NULL | XP reward |
| gold_reward | INTEGER | NOT NULL | Gold reward |
| status | VARCHAR(20) | NOT NULL | Current status |
| created_at | TIMESTAMPTZ | NOT NULL | Creation time |
| completed_at | TIMESTAMPTZ | NULL | Completion time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update |

---

# 10. Quest Categories

Supported categories:

    FITNESS
    CODING
    STUDY
    MEDITATION
    PRODUCTIVITY

Category → Attribute mapping:

| Category | Attribute |
|---|---|
| FITNESS | Strength |
| CODING | Intellect |
| STUDY | Knowledge |
| MEDITATION | Focus |
| PRODUCTIVITY | Discipline |

---

# 11. Quest Difficulties

Supported difficulties:

    EASY
    MEDIUM
    HARD

Reward values:

| Difficulty | XP | Gold |
|---|---:|---:|
| EASY | 20 | 10 |
| MEDIUM | 40 | 20 |
| HARD | 75 | 40 |

The backend should determine these values.

The frontend must not be trusted to provide arbitrary rewards.

---

# 12. Quest Status

Supported statuses:

    ACTIVE
    COMPLETED

A completed quest cannot be completed again.

---

# 13. Quest Completions Table

## Table

    quest_completions

## Purpose

Stores historical information about successful quest completion.

This table is important because the application needs historical activity data for:

- Streak calculation
- Progress history
- Quest completion history
- Future analytics

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Completion ID |
| quest_id | UUID | FK, NOT NULL | Completed quest |
| user_id | UUID | FK, NOT NULL | User who completed it |
| completed_at | TIMESTAMPTZ | NOT NULL | Completion timestamp |
| xp_earned | INTEGER | NOT NULL | XP awarded |
| gold_earned | INTEGER | NOT NULL | Gold awarded |
| attribute | VARCHAR(30) | NOT NULL | Attribute improved |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation time |

A quest should have only one completion record if quests are one-time tasks.

---

# 14. Streaks Table

## Table

    streaks

## Purpose

Stores the user's current and best streak information.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Streak ID |
| user_id | UUID | UNIQUE, FK | User |
| current_streak | INTEGER | NOT NULL | Current consecutive-day streak |
| best_streak | INTEGER | NOT NULL | Highest streak achieved |
| last_activity_date | DATE | NULL | Last active calendar date |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update |

## Default Values

    current_streak = 0
    best_streak = 0

---

# 15. Streak Activity

Quest completion records provide the historical activity required for streak calculations.

A user is considered active on a calendar day when they complete at least one quest that day.

Multiple completions on the same day count as:

    1 active day

not multiple streak days.

The backend uses completion dates to calculate streak changes.

---

# 16. Rewards Table

## Table

    rewards

## Purpose

Stores virtual items that users can purchase.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Reward ID |
| name | VARCHAR(100) | NOT NULL | Item name |
| description | TEXT | NULL | Item description |
| type | VARCHAR(30) | NOT NULL | Reward type |
| price | INTEGER | NOT NULL | Gold price |
| is_available | BOOLEAN | NOT NULL | Whether item can be purchased |
| created_at | TIMESTAMPTZ | NOT NULL | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update |

---

# 17. Reward Types

Initial reward types:

    THEME
    BADGE
    COSMETIC
    PROFILE_ITEM

More types can be added later.

---

# 18. Inventory Table

## Table

    inventory

## Purpose

Stores rewards owned by users.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Inventory record ID |
| user_id | UUID | FK, NOT NULL | Owner |
| reward_id | UUID | FK, NOT NULL | Owned reward |
| acquired_at | TIMESTAMPTZ | NOT NULL | Acquisition time |
| is_equipped | BOOLEAN | NOT NULL | Whether item is equipped |

---

# 19. Inventory Ownership

A user can only see and manage their own inventory.

A reward is added to inventory only after a valid purchase or unlock operation.

Users cannot directly create inventory records through the frontend.

---

# 20. Purchases Table

## Table

    purchases

## Purpose

Stores the history of reward purchases.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Purchase ID |
| user_id | UUID | FK, NOT NULL | Buyer |
| reward_id | UUID | FK, NOT NULL | Purchased reward |
| price_paid | INTEGER | NOT NULL | Gold paid |
| purchased_at | TIMESTAMPTZ | NOT NULL | Purchase time |

The `price_paid` value records the price at the time of purchase.

This protects historical purchase information if the reward price changes later.

---

# 21. Relationships

## User → Character

Relationship:

    1 : 1

One user has one character.

---

## User → Quests

Relationship:

    1 : Many

One user can create many quests.

---

## Quest → Quest Completion

Relationship:

    1 : 0..1

A one-time quest can have zero or one completion record.

---

## User → Quest Completions

Relationship:

    1 : Many

A user can have many historical completion records.

---

## User → Streak

Relationship:

    1 : 1

One user has one streak record.

---

## User → Inventory

Relationship:

    1 : Many

One user can own many rewards.

---

## Reward → Inventory

Relationship:

    1 : Many

A reward can be owned by many different users.

---

## User → Purchases

Relationship:

    1 : Many

A user can have many purchase records.

---

# 22. Foreign Keys

The database should enforce relationships using foreign keys.

Examples:

    characters.user_id
        → users.id

    quests.user_id
        → users.id

    quest_completions.quest_id
        → quests.id

    quest_completions.user_id
        → users.id

    streaks.user_id
        → users.id

    inventory.user_id
        → users.id

    inventory.reward_id
        → rewards.id

    purchases.user_id
        → users.id

    purchases.reward_id
        → rewards.id

---

# 23. Delete Rules

User-owned data must be handled carefully when a user is deleted.

Recommended behavior:

    User deleted
        ↓
    Character deleted
    Quests deleted
    Completion history deleted
    Streak deleted
    Inventory deleted
    Purchase history deleted

Rewards are global system records and should not be deleted because one user was deleted.

Foreign-key cascade behavior may be used for user-owned records where appropriate.

---

# 24. Constraints

The database should enforce important rules.

Examples:

### Email

    UNIQUE

### Level

    level >= 1

### XP

    total_xp >= 0

### Gold

    gold >= 0

### Attributes

    attribute >= 0

### Quest Rewards

    xp_reward >= 0
    gold_reward >= 0

### Reward Price

    price >= 0

### Streak

    current_streak >= 0
    best_streak >= 0

---

# 25. Unique Constraints

Important uniqueness rules:

    users.email
        → UNIQUE

    characters.user_id
        → UNIQUE

    streaks.user_id
        → UNIQUE

For unique virtual items:

    inventory(user_id, reward_id)
        → UNIQUE

This prevents the same user from purchasing the same unique item multiple times.

---

# 26. Indexing

Indexes should be added to frequently queried columns.

Recommended indexes:

    users.email

    quests.user_id

    quests.status

    quests.created_at

    quest_completions.user_id

    quest_completions.completed_at

    inventory.user_id

    purchases.user_id

Indexes should be added based on actual query patterns during implementation.

---

# 27. Transactions

Important game operations must use database transactions.

## Quest Completion

The following should happen within one transaction:

    Verify Quest
        ↓
    Mark Quest Completed
        ↓
    Add XP
        ↓
    Add Gold
        ↓
    Increase Attribute
        ↓
    Create Completion Record
        ↓
    Update Streak
        ↓
    Commit

If any required operation fails:

    ROLLBACK

This prevents partial game-state updates.

---

# 28. Reward Purchase Transaction

Purchasing a reward should also use a transaction.

    Verify User
        ↓
    Verify Reward
        ↓
    Verify Availability
        ↓
    Verify Gold
        ↓
    Verify Ownership
        ↓
    Deduct Gold
        ↓
    Add Inventory
        ↓
    Create Purchase Record
        ↓
    Commit

If anything fails:

    ROLLBACK

---

# 29. XP and Level Storage

The database stores:

    characters.total_xp
    characters.level

The backend is responsible for calculating whether the user should level up.

The database should not trust a level value sent by the frontend.

---

# 30. Level Formula

The current level progression rule is:

    XP Required = 100 × Level²

Example:

    Level 1 → 100 XP
    Level 2 → 400 XP
    Level 3 → 900 XP
    Level 4 → 1600 XP
    Level 5 → 2500 XP

The backend calculates the user's level based on total XP.

---

# 31. Currency Handling

Gold is stored in:

    characters.gold

Gold must never become negative.

The backend controls all Gold increases and decreases.

Valid Gold changes include:

    Quest completion → Gold increase

    Reward purchase → Gold decrease

The frontend cannot directly modify Gold.

---

# 32. Data Persistence

The following data must survive page refreshes and application restarts:

- User account
- Character
- XP
- Level
- Attributes
- Gold
- Quests
- Completion history
- Streak
- Rewards
- Inventory
- Purchase history

All of these are stored in PostgreSQL.

---

# 33. Database Security

Database credentials must never be exposed to the frontend.

The Neon PostgreSQL connection string belongs in backend environment variables.

Example:

    DATABASE_URL=your_neon_connection_string

The `.env` file must not be committed to GitHub.

A `.env.example` file should contain only placeholder values.

---

# 34. Database Source of Truth

The database is the persistent source of truth.

The system follows:

    Frontend
        ↓
    Backend
        ↓
    Database

If frontend data conflicts with database data:

    Database state wins.

---

# 35. Future Database Expansion

The schema can later be extended with:

- Achievements
- Daily quests
- Quest templates
- Skill trees
- Boss quests
- Events
- Leaderboards
- Reward unlock requirements
- Experience history
- Gold transaction history

These should only be added when required by future features.

---

# 36. Final Database Structure

The initial database structure is:

    users
      │
      ├── characters
      │
      ├── quests
      │      │
      │      └── quest_completions
      │
      ├── streaks
      │
      ├── inventory ─── rewards
      │
      └── purchases ─── rewards


Core principle:

    USERS
       ↓
    CHARACTER + QUESTS + PROGRESS
       ↓
    GAMEPLAY
       ↓
    XP + GOLD + ATTRIBUTES + STREAK
       ↓
    REWARDS
       ↓
    INVENTORY