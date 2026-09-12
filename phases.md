# Life RPG — Development Phases

## 1. Purpose

This document defines the complete development roadmap for Life RPG.

The project will be developed in a controlled sequence so that each major part is completed and tested before moving to the next.

The primary development order is:

    DATABASE
       ↓
    BACKEND
       ↓
    API TESTING
       ↓
    FRONTEND
       ↓
    INTEGRATION
       ↓
    TESTING
       ↓
    DEPLOYMENT
       ↓
    FINAL SUBMISSION

---

# 2. Development Principles

The project will follow these principles:

1. Complete one major phase before moving to the next.
2. Test each phase before depending on it.
3. Keep the backend as the authority for RPG logic.
4. Keep PostgreSQL as the persistent source of truth.
5. Do not use localStorage as the primary database.
6. Avoid unnecessary features until the required features are stable.
7. Maintain clean Git commits throughout development.
8. Keep the implementation aligned with PRD, Rules, Design, and Database documents.

---

# 3. Phase Overview

| Phase | Area | Status |
|---|---|---|
| Phase 0 | Project Preparation | Pending |
| Phase 1 | Neon PostgreSQL Database | Pending |
| Phase 2 | Backend Setup | Pending |
| Phase 3 | Authentication | Pending |
| Phase 4 | Quest APIs | Pending |
| Phase 5 | RPG Engine | Pending |
| Phase 6 | Rewards & Inventory APIs | Pending |
| Phase 7 | Backend Testing | Pending |
| Phase 8 | React Frontend Setup | Pending |
| Phase 9 | Authentication UI | Pending |
| Phase 10 | Quest UI | Pending |
| Phase 11 | Character & Progress UI | Pending |
| Phase 12 | Rewards & Inventory UI | Pending |
| Phase 13 | RPG Experience & Polish | Pending |
| Phase 14 | Frontend + Backend Integration | Pending |
| Phase 15 | Full Testing | Pending |
| Phase 16 | Deployment | Pending |
| Phase 17 | Final Submission | Pending |

---

# 4. Phase 0 — Project Preparation

## Goal

Prepare the project structure and development environment.

## Tasks

- Create GitHub repository.
- Create project root.
- Create documentation files.
- Set up frontend folder.
- Set up backend folder.
- Create `.gitignore`.
- Create `.env.example`.
- Verify Node.js environment.
- Verify Git configuration.

## Expected Structure

    life-rpg/
    │
    ├── frontend/
    ├── backend/
    │
    ├── PRD.md
    ├── RULES.md
    ├── DESIGN.md
    ├── DATABASE.md
    ├── PHASES.md
    │
    ├── README.md
    ├── .gitignore
    └── .env.example

## Completion Criteria

- Repository exists.
- Project structure is clean.
- Environment files are prepared.
- No secrets are committed.

---

# 5. Phase 1 — Neon PostgreSQL Database

## Goal

Create the complete initial database structure in Neon PostgreSQL.

## Tasks

### Step 1

Create Neon PostgreSQL project.

### Step 2

Configure database connection.

### Step 3

Create tables:

    users
    characters
    quests
    quest_completions
    streaks
    rewards
    inventory
    purchases

### Step 4

Add:

- Primary keys
- Foreign keys
- Unique constraints
- Check constraints
- Default values
- Required indexes

### Step 5

Insert initial reward data.

### Step 6

Verify relationships.

### Step 7

Test database operations.

## Completion Criteria

The database must:

- Successfully connect.
- Create all required tables.
- Enforce relationships.
- Prevent invalid values.
- Store user data correctly.
- Store quest data correctly.
- Store RPG progress correctly.
- Store reward and inventory data correctly.

---

# 6. Phase 2 — Backend Setup

## Goal

Create the Express backend and connect it to Neon PostgreSQL.

## Tasks

- Initialize Node.js project.
- Install Express.
- Configure environment variables.
- Configure PostgreSQL connection.
- Create server.
- Create API structure.
- Create middleware structure.
- Create error-handling middleware.
- Create validation structure.
- Create database utility layer.

## Initial Structure

    backend/
    │
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   ├── services/
    │   ├── db/
    │   ├── validators/
    │   └── utils/
    │
    ├── .env
    ├── .env.example
    └── package.json

## Completion Criteria

- Server starts successfully.
- Backend connects to Neon.
- Database query succeeds.
- Health-check endpoint works.

Example:

    GET /api/health

Expected:

    API is running
    Database is connected

---

# 7. Phase 3 — Authentication

## Goal

Implement secure user authentication.

## Tasks

- Registration endpoint.
- Password hashing.
- Login endpoint.
- Authentication mechanism.
- Logout.
- Current-user endpoint.
- Authentication middleware.
- Authorization checks.

## Endpoints

    POST /api/auth/register
    POST /api/auth/login
    POST /api/auth/logout
    GET  /api/auth/me

## Tests

Verify:

- User can register.
- Duplicate email is rejected.
- Invalid credentials are rejected.
- Valid user can log in.
- Protected routes reject unauthenticated users.
- Users cannot access another user's data.

## Completion Criteria

Authentication works reliably before moving to the main game APIs.

---

# 8. Phase 4 — Quest APIs

## Goal

Implement complete Quest CRUD functionality.

## Endpoints

    GET    /api/quests
    GET    /api/quests/:id
    POST   /api/quests
    PUT    /api/quests/:id
    DELETE /api/quests/:id

## Tasks

- Create quest controller.
- Create quest service.
- Create quest routes.
- Validate quest input.
- Apply difficulty rules.
- Store quests in PostgreSQL.
- Verify user ownership.

## Tests

Test:

- Create quest.
- Read quests.
- Read individual quest.
- Update quest.
- Delete quest.
- Reject invalid quest.
- Prevent cross-user access.

## Completion Criteria

Quest CRUD works entirely through the backend.

---

# 9. Phase 5 — RPG Progression Engine

## Goal

Implement the core Life RPG game logic.

This is one of the most important backend phases.

## Tasks

Implement:

- Quest completion.
- XP rewards.
- Gold rewards.
- Attribute progression.
- Level calculation.
- Streak calculation.
- Completion history.

## Quest Completion Endpoint

    POST /api/quests/:id/complete

## Completion Flow

    Request
       ↓
    Authenticate
       ↓
    Find Quest
       ↓
    Verify Ownership
       ↓
    Verify Active Status
       ↓
    Calculate Reward
       ↓
    Award XP
       ↓
    Award Gold
       ↓
    Increase Attribute
       ↓
    Update Streak
       ↓
    Create Completion Record
       ↓
    Mark Quest Completed
       ↓
    Commit Transaction
       ↓
    Return Updated State

## Level Rule

    XP Required = 100 × Level²

## Attribute Rule

    Fitness       → Strength
    Coding        → Intellect
    Study         → Knowledge
    Meditation    → Focus
    Productivity  → Discipline

## Completion Criteria

Quest completion must correctly update all related RPG values.

---

# 10. Phase 6 — Rewards & Inventory APIs

## Goal

Implement the virtual economy.

## Endpoints

    GET  /api/rewards
    GET  /api/rewards/:id
    POST /api/rewards/:id/purchase

    GET  /api/inventory

## Tasks

- Retrieve available rewards.
- Check Gold balance.
- Check reward availability.
- Check existing ownership.
- Deduct Gold.
- Add inventory record.
- Create purchase record.
- Use database transaction.

## Completion Criteria

A user can safely purchase available rewards.

Invalid purchases must be rejected without partially changing the database.

---

# 11. Phase 7 — Backend Testing

## Goal

Verify that the backend is stable before building the frontend.

## Test Areas

### Authentication

- Register
- Login
- Logout
- Unauthorized access
- Invalid credentials

### Quests

- Create
- Read
- Update
- Delete
- Complete

### RPG

- XP
- Level
- Gold
- Attributes
- Streaks

### Rewards

- List rewards
- Purchase
- Insufficient Gold
- Duplicate ownership

### Security

- User data isolation
- Invalid IDs
- Invalid input
- Unauthorized requests

### Database

- Transactions
- Constraints
- Foreign keys
- Persistence

## Completion Criteria

No critical backend functionality remains untested.

---

# 12. Phase 8 — React Frontend Setup

## Goal

Create the React application and establish the UI foundation.

## Tasks

- Initialize React.
- Configure routing.
- Create global layout.
- Create reusable components.
- Create API service layer.
- Create authentication state handling.
- Create loading states.
- Create error handling UI.

## Initial Pages

    Landing
    Login
    Signup
    Dashboard
    Quests
    Character
    Rewards
    Inventory

## Completion Criteria

Navigation and basic application structure work.

---

# 13. Phase 9 — Authentication UI

## Goal

Connect authentication screens to the backend.

## Tasks

- Signup form.
- Login form.
- Form validation.
- API integration.
- Authentication state.
- Protected routes.
- Logout.
- Error messages.

## Completion Criteria

A real user can:

    Signup
       ↓
    Login
       ↓
    Access Dashboard
       ↓
    Logout

---

# 14. Phase 10 — Quest UI

## Goal

Build the main productivity interface.

## Tasks

- Quest list.
- Quest cards.
- Create quest form.
- Edit quest.
- Delete quest.
- Complete quest.
- Active/completed states.
- API integration.

## Completion Criteria

The user can manage quests completely from the frontend.

---

# 15. Phase 11 — Character & Progress UI

## Goal

Display RPG progression.

## UI Elements

- Level
- XP
- XP progress bar
- Gold
- Attributes
- Current streak
- Best streak
- Recent progress

## Completion Criteria

The frontend accurately displays backend-confirmed RPG state.

---

# 16. Phase 12 — Rewards & Inventory UI

## Goal

Create the virtual economy interface.

## Rewards

Display:

- Item
- Description
- Type
- Price
- Purchase button
- Ownership state

## Inventory

Display:

- Owned items
- Item details
- Equip state where supported

## Completion Criteria

Users can purchase and view rewards through the frontend.

---

# 17. Phase 13 — RPG Experience & UI Polish

## Goal

Transform the functional application into a polished RPG experience.

## Tasks

- Finalize visual theme.
- Improve typography.
- Improve spacing.
- Add animations.
- Add XP feedback.
- Add level-up animation.
- Add reward notifications.
- Add loading skeletons.
- Add transitions.
- Improve empty states.
- Improve error states.

## Important Principle

The UI must not become cluttered.

Important information should have a clear visual hierarchy.

## Completion Criteria

The application feels like an RPG rather than a generic CRUD dashboard.

---

# 18. Phase 14 — Frontend + Backend Integration

## Goal

Verify that the complete application works together.

## Flow

    React
      ↓
    API
      ↓
    Express
      ↓
    Neon PostgreSQL
      ↓
    Express
      ↓
    React

## Test Complete User Journey

    Signup
      ↓
    Login
      ↓
    Create Quest
      ↓
    View Quest
      ↓
    Complete Quest
      ↓
    Receive XP
      ↓
    Receive Gold
      ↓
    Attribute Increases
      ↓
    Streak Updates
      ↓
    Level Updates
      ↓
    Purchase Reward
      ↓
    Inventory Updates
      ↓
    Refresh Page
      ↓
    Data Remains

---

# 19. Phase 15 — Full Testing

## Goal

Test the application as a real user and identify edge cases.

## Functional Testing

Test every major feature.

## Edge Cases

Test:

- Empty quest title.
- Very long input.
- Invalid category.
- Invalid difficulty.
- Completing the same quest twice.
- Buying without enough Gold.
- Buying unavailable reward.
- Buying an already-owned item.
- Invalid resource ID.
- Expired/invalid authentication.
- Network failure.
- Database failure.

## Responsive Testing

Test:

- Desktop
- Tablet
- Mobile

## Accessibility Testing

Test:

- Keyboard navigation.
- Tab order.
- Enter.
- Space.
- Focus states.
- Form labels.
- Screen-reader structure.

## Completion Criteria

No blank-screen crashes or critical runtime errors.

---

# 20. Phase 16 — Deployment

## Goal

Deploy the complete application publicly.

## Components

    React Frontend
          ↓
    Public Deployment

    Express Backend
          ↓
    Public API

    Neon PostgreSQL
          ↓
    Production Database

## Tasks

- Configure production environment variables.
- Deploy backend.
- Connect backend to Neon production database.
- Deploy frontend.
- Configure frontend API URL.
- Test production API.
- Test production database connection.
- Test authentication.
- Test complete gameplay flow.

## Completion Criteria

The live application works from start to finish.

---

# 21. Phase 17 — Final Submission

## Goal

Prepare the project for hackathon submission.

## GitHub

Repository must contain:

- Frontend
- Backend
- Documentation
- README.md
- `.env.example`

Git history should contain meaningful chronological commits.

---

## README

README should contain:

- Project overview
- Problem statement
- Features
- Tech stack
- Architecture
- Setup instructions
- Environment variables
- Database setup
- Backend setup
- Frontend setup
- API information
- Deployment information

---

## Walkthrough Video

The video must demonstrate the required user flow.

Recommended flow:

    Signup/Login
        ↓
    Create Quest
        ↓
    Complete Quest
        ↓
    XP / Gold / Attribute Update
        ↓
    Level Progression
        ↓
    Refresh Page
        ↓
    Data Persistence

The hackathon problem statement requires a 90–180 second walkthrough demonstrating signup/login, adding/completing a task, leveling up, and persistence after refresh. :contentReference[oaicite:0]{index=0}

---

# 22. Git Commit Strategy

Development should use meaningful commits.

Example:

    setup project structure
    setup neon database
    add database schema
    setup express backend
    implement authentication
    implement quest CRUD
    implement quest completion
    implement RPG progression
    implement rewards API
    implement inventory API
    setup react frontend
    add authentication UI
    add quest UI
    add character UI
    add rewards UI
    add inventory UI
    polish RPG interface
    integrate frontend and backend
    fix production issues
    prepare final submission

Commits must reflect actual development work.

The hackathon rulebook states that GitHub commit history will be reviewed and commits must begin after the announced hackathon date and time. :contentReference[oaicite:1]{index=1}

---

# 23. Final Completion Checklist

## Database

- [ ] Neon PostgreSQL configured
- [ ] All required tables created
- [ ] Relationships verified
- [ ] Constraints added
- [ ] Indexes added
- [ ] Seed rewards added

## Backend

- [ ] Express server working
- [ ] Database connected
- [ ] Authentication working
- [ ] Authorization working
- [ ] Quest CRUD working
- [ ] Quest completion working
- [ ] XP system working
- [ ] Level system working
- [ ] Attribute system working
- [ ] Streak system working
- [ ] Rewards working
- [ ] Inventory working
- [ ] Error handling working

## Frontend

- [ ] React application working
- [ ] Landing page
- [ ] Signup
- [ ] Login
- [ ] Dashboard
- [ ] Quest management
- [ ] Character page
- [ ] Rewards page
- [ ] Inventory page
- [ ] Responsive design
- [ ] Accessibility
- [ ] Animations
- [ ] Loading states
- [ ] Error states

## Integration

- [ ] Frontend connected to backend
- [ ] Backend connected to Neon
- [ ] Authentication flow tested
- [ ] Quest flow tested
- [ ] RPG progression tested
- [ ] Reward purchase tested
- [ ] Persistence tested
- [ ] Refresh tested

## Deployment

- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Production database connected
- [ ] Environment variables configured
- [ ] Live URL tested
- [ ] No runtime crashes

## Submission

- [ ] Public GitHub repository
- [ ] Clean commit history
- [ ] README.md
- [ ] `.env.example`
- [ ] Live deployed URL
- [ ] Walkthrough video
- [ ] AI/third-party tools disclosed