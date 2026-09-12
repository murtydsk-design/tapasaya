# Life RPG — System Rules

## 1. Purpose

This document defines the rules and logic of the Life RPG system.

These rules must be implemented consistently across the backend and database.

The frontend must never be the source of truth for important game calculations.

---

# 2. User Rules

## 2.1 Account

Every user must have:

- Unique ID
- Name
- Email
- Password
- Account creation date

Email must be unique.

Passwords must never be stored as plain text.

---

## 2.2 User Data Isolation

A user can only:

- View their own quests
- Create their own quests
- Update their own quests
- Delete their own quests
- Complete their own quests
- View their own character
- View their own inventory
- Spend their own currency

A user must never be able to access or modify another user's data.

---

# 3. Quest Rules

## 3.1 Quest Creation

A quest must have:

- Title
- Description
- Category
- Difficulty
- XP reward
- Gold reward
- Status
- Creation timestamp

A quest title cannot be empty.

---

## 3.2 Quest Difficulty

The system will have three difficulty levels:

| Difficulty | Base XP | Base Gold |
|---|---:|---:|
| Easy | 20 XP | 10 Gold |
| Medium | 40 XP | 20 Gold |
| Hard | 75 XP | 40 Gold |

The backend determines the final reward.

The frontend cannot directly award arbitrary XP or Gold.

---

## 3.3 Quest Status

A quest can have:

- `ACTIVE`
- `COMPLETED`

An active quest can be completed.

A completed quest cannot be completed again.

---

## 3.4 Quest Completion

When a user completes a valid quest:

1. The quest is marked as completed.
2. XP is awarded.
3. Gold is awarded.
4. The related character attribute is increased.
5. The user's activity is recorded.
6. The streak is updated.
7. The transaction is saved in the database.

These operations should be handled safely by the backend.

---

# 4. XP Rules

## 4.1 XP Source

XP is earned primarily by completing quests.

The user cannot manually increase their XP.

---

## 4.2 XP Calculation

The base XP depends on quest difficulty.

    Easy   = 20 XP
    Medium = 40 XP
    Hard   = 75 XP

The backend calculates and awards the appropriate amount.

---

# 5. Level Rules

## 5.1 Starting Level

Every new character starts at:

    Level 1

Starting XP:

    0 XP

---

## 5.2 Level Progression

The level system must be non-linear.

The XP required for each level follows:

    XP Required = 100 × Level²

Therefore:

| Level | Total XP Required |
|---|---:|
| 1 | 100 |
| 2 | 400 |
| 3 | 900 |
| 4 | 1600 |
| 5 | 2500 |
| 6 | 3600 |
| 7 | 4900 |
| 8 | 6400 |
| 9 | 8100 |
| 10 | 10000 |

The backend determines the user's level from their accumulated XP.

---

## 5.3 Level Up

A user levels up automatically when their total XP reaches the required threshold.

Example:

    Current:
    Level = 2
    XP = 390

    User earns:
    +20 XP

    New XP:
    410

    Result:
    Level 3

If a single reward causes the user to cross multiple level thresholds, the system must correctly advance to the appropriate level.

---

# 6. Character Attribute Rules

Every character has the following attributes:

- Strength
- Intellect
- Focus
- Knowledge
- Discipline

Starting value:

    Each attribute = 0 (represents total valid quest completions in that category)

---

## 6.1 Attribute Mapping

Quest categories determine which attribute receives progression.

| Quest Category | Character Attribute |
|---|---|
| Fitness | Strength |
| Coding | Intellect |
| Study | Knowledge |
| Meditation | Focus |
| Discipline / Productivity | Discipline |

---

## 6.2 Attribute Calculation

Character attribute numbers represent the total count of valid quest completions in that category.

Each valid completion record in `quest_completions` for a quest in a given category increments the corresponding character attribute by 1. If a completion or quest is deleted, attribute counts automatically resynchronize to match remaining valid completions.

Example:

    Coding Quest Completed
            ↓
    Intellect +1 (Total completed Coding quests)

---

# 7. Streak Rules

## 7.1 Activity Definition

A day counts as an active day when the user successfully completes at least one quest.

---

## 7.2 Starting Streak

A new user starts with:

    Current Streak = 0
    Best Streak = 0

---

## 7.3 Consecutive Days

If the user completes at least one quest on consecutive calendar days:

    Current Streak +1

Example:

    Monday  → Quest completed → 1 day
    Tuesday → Quest completed → 2 days
    Wednesday → Quest completed → 3 days

Result:

    🔥 3 Day Streak

---

## 7.4 Missed Day

If the user does not complete any quest on a calendar day, the current streak resets.

The best streak is not reset.

Example:

    Best Streak = 7
    Current Streak = 7

    User misses the next day.

    Current Streak = 0
    Best Streak = 7

---

## 7.5 Same-Day Completion

Completing multiple quests on the same calendar day does not increase the streak multiple times.

Example:

    Monday:
    Quest 1 ✓
    Quest 2 ✓
    Quest 3 ✓

    Streak = 1 day

---

# 8. Gold Rules

## 8.1 Starting Gold

Every new user starts with:

    Gold = 0

---

## 8.2 Earning Gold

Gold is awarded when a quest is successfully completed.

Base rewards:

    Easy   → 10 Gold
    Medium → 20 Gold
    Hard   → 40 Gold

---

## 8.3 Spending Gold

Gold can be spent on virtual items.

The backend must verify:

    User Gold >= Item Price

before allowing a purchase.

---

## 8.4 Insufficient Gold

If the user does not have enough Gold:

    Purchase = Rejected

No Gold should be deducted.

No item should be added to the inventory.

---

# 9. Reward / Item Rules

Items are virtual and have no real-world monetary value.

Each item should have:

- ID
- Name
- Description
- Price
- Type
- Availability status

Example item types:

- Theme
- Badge
- Cosmetic
- Profile item

---

## 9.1 Purchasing an Item

Purchase flow:

    User selects item
          ↓
    Backend checks item
          ↓
    Backend checks Gold
          ↓
    Gold deducted
          ↓
    Item added to inventory
          ↓
    Purchase recorded

---

## 9.2 Duplicate Items

The initial system will not allow duplicate ownership of the same unique item.

If the user already owns a unique item:

    Purchase = Rejected

---

# 10. Inventory Rules

Every user has their own inventory.

An inventory record represents an item owned by a user.

Users can:

- View their inventory
- View item details
- Equip supported items

Users cannot:

- Add arbitrary items
- Change item prices
- Transfer items between users

---

# 11. Anti-Cheating Rules

Game-related values must be controlled by the backend.

The frontend must not be trusted for:

- XP amount
- Gold amount
- Level
- Attribute values
- Quest completion rewards
- Inventory ownership
- Item prices

For example, the frontend must NOT send:

    "Give me 1000 XP"

Instead, it should send:

    "Complete Quest #123"

The backend then verifies the quest and calculates the reward.

---

# 12. Quest Completion Integrity

Quest completion must be processed as one logical operation.

The system should prevent situations where:

- XP is awarded but the quest is not completed.
- Gold is awarded twice.
- An attribute increases without a valid quest completion.
- An item is added without payment.
- A quest is completed multiple times.

Database transactions should be used where multiple related records must change together.

---

# 13. API Rules

The frontend communicates with the backend through APIs.

The frontend must not communicate directly with PostgreSQL.

Architecture:

    React
      ↓
    Express API
      ↓
    PostgreSQL / Neon

Protected endpoints require authentication.

---

# 14. Validation Rules

The backend must validate incoming data.

Examples:

### Quest title

Cannot be:

- Empty
- Only whitespace
- Unreasonably long

### Difficulty

Must be one of:

    EASY
    MEDIUM
    HARD

### Category

Must be one of the supported categories.

### Item purchase

The item must exist and be available.

---

# 15. Error Rules

The application must return meaningful errors.

Examples:

    Invalid credentials
    Unauthorized request
    Quest not found
    Quest already completed
    Invalid quest data
    Insufficient Gold
    Item not found
    Item already owned
    Database error

The frontend should display user-friendly messages.

---

# 16. Persistence Rules

Important game state must be stored in PostgreSQL.

The following must persist:

- User account
- Quests
- Quest completion
- XP
- Level
- Character attributes
- Gold
- Streak
- Inventory
- Purchases

Browser localStorage must not be used as the primary source of this data.

---

# 17. Time Rules

Quest completion and streak calculations must use a consistent application timezone strategy.

The backend/database should store timestamps consistently.

Streak calculations must be based on calendar dates rather than simply counting completed quests.

---

# 18. Security Rules

The backend must:

- Authenticate users.
- Authorize access to resources.
- Validate input.
- Hash passwords.
- Prevent unauthorized data access.
- Prevent users from modifying protected game values.
- Handle database errors safely.
- Avoid exposing sensitive information.

---

# 19. Frontend Trust Rule

The frontend is responsible for displaying the game state.

The backend is responsible for determining the game state.

Therefore:

    Frontend = Presentation

    Backend = Business Logic

    Database = Persistent Source of Truth

---

# 20. Rule Priority

If there is a conflict between frontend state and backend/database state:

    Database / Backend state wins.

Example:

    Frontend says:
    Gold = 1000

    Database says:
    Gold = 100

    Correct value:
    100 Gold

---

# 21. Future Expansion

The system may later support:

- More quest categories
- More attributes
- More item types
- Achievements
- Daily quests
- Special quests
- Boss quests
- Events
- More complex reward systems

These features should not break the core rules defined above.

---

# 22. Core Principle

The fundamental gameplay loop is:

    REAL-LIFE ACTIVITY
            ↓
          QUEST
            ↓
       COMPLETE QUEST
            ↓
       ┌────┼────┐
       ↓    ↓    ↓
      XP  GOLD  ATTRIBUTE
       ↓    ↓    ↓
      LEVEL REWARDS CHARACTER
            ↓
         STREAK
            ↓
       MORE PROGRESS