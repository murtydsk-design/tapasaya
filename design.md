# Life RPG — System & UI Design

## 1. Purpose

This document defines the technical architecture, application structure, user flows, pages, API responsibilities, and UI/UX direction for Life RPG.

The application will be developed using the PERN stack with Neon PostgreSQL.

---

# 2. Technology Stack

## Frontend

- React
- JavaScript
- HTML
- CSS
- React Router
- Fetch API / Axios for API communication

UI libraries may be added when they provide a clear benefit.

---

## Backend

- Node.js
- Express.js
- REST APIs

The backend will contain authentication, authorization, validation, and all core RPG business logic.

---

## Database

- PostgreSQL
- Neon PostgreSQL

Neon will be the primary persistent database.

---

# 3. High-Level Architecture

The application follows a three-layer architecture:

    ┌──────────────────────────┐
    │      React Frontend      │
    │                          │
    │  Pages / Components / UI │
    └────────────┬─────────────┘
                 │
                 │ HTTP / REST API
                 ↓
    ┌──────────────────────────┐
    │     Express Backend      │
    │                          │
    │ Auth / Validation /      │
    │ RPG Business Logic       │
    └────────────┬─────────────┘
                 │
                 │ SQL
                 ↓
    ┌──────────────────────────┐
    │    Neon PostgreSQL       │
    │                          │
    │ Users / Quests / Stats / │
    │ Rewards / Inventory      │
    └──────────────────────────┘

---

# 4. Architecture Responsibilities

## 4.1 Frontend Responsibility

The React application is responsible for:

- Displaying data
- Collecting user input
- Navigation
- Showing loading states
- Showing errors
- Animations
- User interactions
- Responsive UI
- Accessibility

The frontend must not be responsible for authoritative game calculations.

---

## 4.2 Backend Responsibility

The Express backend is responsible for:

- Authentication
- Authorization
- Input validation
- Quest management
- Quest completion
- XP calculation
- Level calculation
- Gold calculation
- Attribute progression
- Streak calculation
- Reward purchasing
- Inventory management
- Database operations

The backend is the authority for game logic.

---

## 4.3 Database Responsibility

PostgreSQL is responsible for persistent application data.

It stores:

- Users
- Characters
- Quests
- Quest completion information
- Progress
- Streak information
- Rewards
- Inventory
- Purchase records

---

# 5. Application Structure

The application will have the following major areas:

    Authentication
        │
        ├── Signup
        └── Login
              │
              ↓
          Dashboard
              │
       ┌──────┼────────┐
       ↓      ↓        ↓
    Quests  Character Rewards
       │      │        │
       ↓      ↓        ↓
    Progress Stats   Inventory

---

# 6. Main Pages

## 6.1 Landing Page

Purpose:

Introduce Life RPG and encourage users to start.

Main elements:

- Application branding
- Short product explanation
- RPG-themed visual
- Login button
- Signup button
- Key feature highlights

The landing page should communicate the idea:

> Turn your real life into an RPG.

---

# 7. Authentication Pages

## 7.1 Signup

Fields:

- Name
- Email
- Password
- Confirm password

Actions:

- Create account
- Navigate to login

Validation should provide clear feedback.

---

## 7.2 Login

Fields:

- Email
- Password

Actions:

- Login
- Navigate to signup

Invalid credentials should produce a clear error message.

---

# 8. Dashboard

The dashboard is the main screen after login.

It should provide a quick overview of the user's current RPG progress.

Possible layout:

    ┌──────────────────────────────────────┐
    │ Header / Profile / Gold              │
    ├──────────────────────────────────────┤
    │                                      │
    │ Level 5        XP Progress           │
    │ ███████████████░░░░                  │
    │                                      │
    ├───────────────┬──────────────────────┤
    │ Character     │ Daily Progress       │
    │ Attributes    │ Streak               │
    ├───────────────┴──────────────────────┤
    │                                      │
    │ Active Quests                        │
    │                                      │
    └──────────────────────────────────────┘

The exact visual layout may change during UI implementation.

---

# 9. Quest Page

The Quest page is the primary productivity area.

It should allow users to:

- View active quests
- Create quests
- Edit quests
- Delete quests
- Complete quests
- View completed quests

---

## 9.1 Quest Card

A quest card should display:

- Quest title
- Description
- Category
- Difficulty
- XP reward
- Gold reward
- Status
- Completion action

Example:

    ┌─────────────────────────────┐
    │ 💻 Coding Practice          │
    │ Practice coding for 1 hour  │
    │                             │
    │ Difficulty: Medium          │
    │ +40 XP    +20 Gold          │
    │                             │
    │          [Complete Quest]   │
    └─────────────────────────────┘

---

# 10. Create Quest Flow

User selects:

    + Create Quest

A form appears.

User enters:

- Title
- Description
- Category
- Difficulty

The backend determines the corresponding rewards according to the rules.

Flow:

    Create Quest
          ↓
    Validate Input
          ↓
    Send API Request
          ↓
    Backend Validation
          ↓
    Save to PostgreSQL
          ↓
    Return Quest
          ↓
    Update UI

---

# 11. Quest Completion Flow

When the user selects:

    Complete Quest

The frontend sends a request to the backend.

Flow:

    User clicks Complete
            ↓
       API Request
            ↓
       Authenticate
            ↓
       Validate Quest
            ↓
       Check Quest Status
            ↓
       Calculate Rewards
            ↓
    ┌───────┼────────┐
    ↓       ↓        ↓
   XP     Gold    Attribute
    │       │        │
    └───────┼────────┘
            ↓
       Update Streak
            ↓
      Mark Quest Complete
            ↓
       Database Commit
            ↓
       Return New State
            ↓
       Update Frontend
            ↓
       Celebration UI

All related database changes should be handled safely as one logical operation.

---

# 12. Level-Up Experience

When a quest causes the user to reach a new level:

The interface should clearly communicate:

    🎉 LEVEL UP!

    Level 4 → Level 5

The UI may include:

- Animation
- Progress bar animation
- Particle effect
- Notification
- Character visual update

The actual level calculation is performed by the backend.

---

# 13. Character Page

The Character page displays the user's RPG progression.

It should show:

- Current level
- Total XP
- XP progress
- Current Gold
- Current streak
- Best streak
- Character attributes

Example:

    CHARACTER

    Level 5
    ████████████░░░

    Strength      8
    Intellect    14
    Focus         6
    Knowledge    11
    Discipline    9

    🔥 Streak: 7 days
    🪙 Gold: 240

---

# 14. Rewards Page

The Rewards page displays available virtual items.

Each item should show:

- Item name
- Description
- Type
- Price
- Ownership status
- Purchase action

Example:

    ┌──────────────────────┐
    │ 🌌 Night Theme       │
    │ Special profile theme│
    │                      │
    │ 🪙 100 Gold          │
    │                      │
    │       [Buy]          │
    └──────────────────────┘

---

# 15. Purchase Flow

    User selects Buy
           ↓
      API Request
           ↓
    Authenticate User
           ↓
      Check Item
           ↓
    Check Gold Balance
           ↓
    Check Ownership
           ↓
    Deduct Gold
           ↓
    Add Inventory Record
           ↓
    Save Purchase
           ↓
      Return Result
           ↓
       Update UI

If the user does not have enough Gold:

    Purchase Rejected
          ↓
    Show Error Message

No Gold should be deducted.

---

# 16. Inventory Page

The Inventory page displays items owned by the current user.

Users can:

- View owned items
- View item details
- Equip supported items

The inventory must only contain items owned by the authenticated user.

---

# 17. Navigation

The application will use a consistent navigation system.

Possible navigation:

    🏠 Dashboard
    ⚔️ Quests
    🧙 Character
    🎁 Rewards
    🎒 Inventory

The exact terminology may be adapted to the final visual theme.

---

# 18. API Design

The frontend communicates with the Express backend using REST APIs.

Initial API structure:

## Authentication

    POST /api/auth/register
    POST /api/auth/login
    POST /api/auth/logout
    GET  /api/auth/me

---

## Quests

    GET    /api/quests
    GET    /api/quests/:id
    POST   /api/quests
    PUT    /api/quests/:id
    DELETE /api/quests/:id

---

## Quest Completion

    POST /api/quests/:id/complete

Quest completion is a protected operation.

---

## Character

    GET /api/character

---

## Progress

    GET /api/progress

---

## Rewards

    GET  /api/rewards
    GET  /api/rewards/:id
    POST /api/rewards/:id/purchase

---

## Inventory

    GET /api/inventory

---

# 19. Authentication Flow

The authentication system will protect private resources.

General flow:

    Signup
       ↓
    Create User
       ↓
    Hash Password
       ↓
    Store User
       ↓
    Login
       ↓
    Verify Credentials
       ↓
    Create Authenticated Session
       ↓
    Access Protected APIs

The exact authentication implementation will be finalized during backend development.

---

# 20. Authorization

Every protected API request must identify the authenticated user.

For user-owned resources:

    authenticatedUserId
            ↓
       Find Resource
            ↓
       Verify Ownership
            ↓
    Allow / Reject Request

Example:

User A cannot request or modify User B's quest.

---

# 21. State Management

The frontend should maintain only the state required for the user interface.

Important persistent values come from the backend.

Examples:

- Current user
- Current character
- Quest list
- Gold
- Inventory
- Progress

The frontend should refresh its state from the backend when required.

---

# 22. Loading States

The application should not appear frozen during API requests.

Use:

- Loading indicators
- Skeleton components
- Disabled buttons during important operations
- Smooth transitions

Example:

    [ Completing Quest... ]

instead of allowing repeated clicks.

---

# 23. Optimistic UI

Optimistic updates may be used for interactions where appropriate.

However, important game state must ultimately be confirmed by the backend.

Example:

    User completes quest
          ↓
    Show immediate UI feedback
          ↓
    Backend processes request
          ↓
    Backend response confirms state
          ↓
    UI uses confirmed state

If the request fails, the UI must recover correctly.

---

# 24. Error Handling UI

Errors should be understandable to users.

Examples:

    "Quest title is required."

    "This quest has already been completed."

    "You don't have enough Gold."

    "Something went wrong. Please try again."

Technical database errors should not be directly exposed to users.

---

# 25. RPG Visual Direction

The application should not resemble a generic SaaS dashboard.

The visual system should have a strong RPG identity.

The final theme will be selected before detailed frontend implementation.

Possible directions:

### Fantasy RPG

- Quests
- Gold
- Character
- Inventory
- Guild-style visuals

### Cyberpunk

- Missions
- Credits
- Stats
- Digital inventory
- Futuristic interface

### Retro RPG

- Pixel-inspired interface
- Game-like panels
- Retro typography
- Classic RPG presentation

### Cozy RPG

- Soft visual environment
- Study / productivity atmosphere
- Relaxed game-like progression

---

# 26. UI Design Principles

The UI should follow these principles:

## Clear

Important information should be immediately visible.

## Consistent

Buttons, cards, spacing, typography, and terminology should follow one design system.

## Rewarding

Important actions should provide visible feedback.

## Uncluttered

Do not display every statistic everywhere.

## Responsive

The UI must adapt to mobile, tablet, and desktop.

## Accessible

The UI must support keyboard navigation and screen readers.

---

# 27. Responsive Layout

## Desktop

Use a sidebar or expanded navigation.

Example:

    ┌──────────┬─────────────────────────┐
    │ Sidebar  │ Main Content            │
    │          │                         │
    │ Dashboard│                         │
    │ Quests   │                         │
    │ Character│                         │
    │ Rewards  │                         │
    │ Inventory│                         │
    └──────────┴─────────────────────────┘

---

## Mobile

Navigation should become compact.

Example:

    ┌──────────────────────┐
    │ Header               │
    ├──────────────────────┤
    │                      │
    │ Main Content         │
    │                      │
    ├──────────────────────┤
    │ Home Quest Stats ... │
    └──────────────────────┘

Cards and components must fit smaller screens.

---

# 28. Accessibility Design

The application should provide:

- Semantic HTML
- Accessible form labels
- Keyboard navigation
- Visible focus states
- Meaningful button labels
- Appropriate ARIA attributes where required
- Sufficient text readability
- Screen-reader-friendly structure

Every important action must be possible without a mouse.

---

# 29. Security Design

The frontend should never be trusted for sensitive game calculations.

For example:

Bad:

    Frontend:
    XP = currentXP + 1000

Good:

    Frontend:
    Complete Quest

    Backend:
    Validate quest
    Calculate reward
    Update XP

The backend and database remain the source of truth.

---

# 30. Database Communication

React must never connect directly to Neon PostgreSQL.

Correct:

    React
      ↓
    Express
      ↓
    PostgreSQL / Neon

Incorrect:

    React
      ↓
    PostgreSQL

---

# 31. Folder Structure

The final project can follow a structure similar to:

    life-rpg/
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── layouts/
    │   │   ├── services/
    │   │   ├── hooks/
    │   │   └── utils/
    │   └── package.json
    │
    ├── backend/
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── routes/
    │   │   ├── middleware/
    │   │   ├── services/
    │   │   ├── db/
    │   │   ├── validators/
    │   │   └── utils/
    │   └── package.json
    │
    ├── README.md
    ├── PRD.md
    ├── RULES.md
    ├── DESIGN.md
    ├── DATABASE.md
    └── PHASES.md

The exact folder structure may be adjusted during implementation.

---

# 32. Development Order

The project will be implemented in this order:

    Requirements
         ↓
    Rules
         ↓
    Design
         ↓
    Database
         ↓
    Backend
         ↓
    API Testing
         ↓
    Frontend
         ↓
    Integration
         ↓
    Testing
         ↓
    Deployment

---

# 33. Core Design Principle

The application follows:

    React
       =
    User Interface

    Express
       =
    Business Logic + Security

    Neon PostgreSQL
       =
    Persistent Source of Truth

The frontend displays the RPG experience.

The backend controls the RPG rules.

The database stores the RPG state.