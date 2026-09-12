# Life RPG — Product Requirements Document

## 1. Product Overview

Life RPG is a full-stack web application that turns real-life tasks into RPG-style quests.

The purpose of the application is to make everyday productivity more engaging by giving users immediate game-like feedback such as:

- Experience Points (XP)
- Character levels
- Character attributes
- Streaks
- Virtual currency
- Rewards
- Inventory items
- Profile badges

Instead of simply completing a boring to-do item, the user completes a quest and progresses their virtual character.

---

## 2. Problem Statement

Traditional productivity applications such as to-do lists and habit trackers can feel repetitive and unrewarding.

Many real-life activities provide benefits only after a long period of time. For example:

- Studying
- Coding
- Reading
- Exercising
- Building habits

Video games solve a similar motivation problem through immediate feedback and progression.

When a player completes a mission, they immediately receive rewards such as XP, currency, items, or level progression.

Life RPG applies this concept to real-life productivity.

The application converts real-world tasks into game-like quests and rewards users for completing them.

---

## 3. Product Goal

The primary goal is:

> Make real-life productivity feel like playing an RPG.

The application should provide a satisfying loop:

    Create Quest
        ↓
    Complete Quest
        ↓
    Earn XP + Currency
        ↓
    Improve Character
        ↓
    Level Up
        ↓
    Unlock / Purchase Rewards
        ↓
    Continue Progressing

---

## 4. Target Users

The application is designed for people who want to improve their productivity and daily habits but find traditional task-management systems boring.

Example users include:

- Students
- Developers
- Self-learners
- People building daily habits
- Users who enjoy RPG/game mechanics

---

## 5. Core User Experience

A user should be able to:

1. Create an account.
2. Log in securely.
3. Create real-life quests.
4. Categorize quests.
5. Complete quests.
6. Receive XP and virtual currency.
7. Improve character attributes.
8. Build activity streaks.
9. Level up their character.
10. Spend earned currency on virtual rewards.
11. View their inventory and progress.
12. Refresh or revisit the application without losing their data.

---

## 6. Core Features

### 6.1 Authentication

The application must provide:

- User signup
- User login
- Secure session/authentication handling
- Logout
- Protected user data

Each user must only be able to access and modify their own data.

---

### 6.2 Quest / Task Management

Users must be able to:

- Create quests
- View quests
- Update quests
- Delete quests
- Complete quests

Each quest should contain relevant information such as:

- Title
- Description
- Category
- Difficulty
- XP reward
- Currency reward
- Completion status
- Creation date
- Completion date

---

### 6.3 XP System

Completing quests gives users XP.

XP is used to progress the character toward the next level.

The leveling system must be non-linear.

This means that each subsequent level should require more XP than the previous level.

Example:

    Level 1 → 100 XP
    Level 2 → 250 XP
    Level 3 → 450 XP
    Level 4 → 700 XP

The exact progression formula will be defined separately in the application rules.

---

### 6.4 Character System

Every user should have a character/profile representing their progress.

The character can contain attributes such as:

- Strength
- Intellect
- Focus
- Discipline
- Knowledge

The exact attributes and their effects will be finalized during system design.

---

### 6.5 Quest Categories & Attributes

Different quest categories can improve different character attributes.

Example:

    Coding Quest
        → Intellect

    Workout Quest
        → Strength

    Reading Quest
        → Knowledge

    Meditation Quest
        → Focus

The system should make the connection between real-world activity and character progression clear.

---

### 6.6 Streak System

The application should track consecutive days of user activity.

Example:

    Day 1  ✓
    Day 2  ✓
    Day 3  ✓
    Day 4  ✓

    4 Day Streak 🔥

The streak should update based on valid quest activity.

---

### 6.7 Reward & Economy System

Users should earn virtual currency when completing quests.

The currency can be used to purchase virtual rewards such as:

- Items
- Themes
- Profile badges
- Other unlockable content

The exact economy and item prices will be defined in the system rules.

---

### 6.8 Inventory

Users should have an inventory containing rewards they have purchased or unlocked.

The inventory belongs to the individual user.

Users must not be able to access another user's inventory.

---

### 6.9 Progress Dashboard

The application should provide a clear overview of the user's progress.

The dashboard may display:

- Current level
- Current XP
- XP required for next level
- Character attributes
- Current streak
- Currency
- Active quests
- Completed quests
- Recent rewards
- Inventory

The UI should avoid unnecessary clutter.

---

## 7. Technology Stack

### Frontend

- React
- HTML
- CSS
- JavaScript

Additional UI libraries may be used where appropriate.

---

### Backend

- Node.js
- Express.js
- REST API

The backend will contain the application's main business logic.

---

### Database

- PostgreSQL
- Neon PostgreSQL as the hosted database

Primary application data must be stored in PostgreSQL rather than relying on browser localStorage.

---

### Architecture

The application will follow:

    React Frontend
          ↓
    Express Backend
          ↓
    PostgreSQL
        (Neon)

The frontend communicates with the backend through APIs.

---

## 8. Security Requirements

The backend must not blindly trust values received from the frontend.

Important game-related calculations such as:

- XP
- Level
- Currency
- Attribute progression
- Quest completion

should be validated or calculated on the backend.

Users must only be able to access their own records.

Authentication and authorization must be implemented properly.

---

## 9. Data Persistence

All important user information must persist in the PostgreSQL database.

Refreshing the browser must not reset:

- User account
- Quests
- XP
- Level
- Attributes
- Currency
- Streak
- Inventory
- Rewards

Example:

    Before Refresh:
    Level = 5
    XP = 420
    Gold = 150

    After Refresh:
    Level = 5
    XP = 420
    Gold = 150

---

## 10. UI / UX Requirements

The application must not look like a generic enterprise dashboard.

It should have a strong RPG identity and a consistent visual theme.

The chosen theme should influence:

- Colors
- Typography
- Terminology
- Components
- Icons
- Animations
- Layout

Possible themes include:

- Fantasy RPG
- Cyberpunk
- Retro 16-bit
- Cozy / Lo-fi
- Modern RPG

The final theme will be selected during the design phase.

---

## 11. Interaction & Feedback

The application should provide immediate visual feedback for important actions.

Examples:

- Quest completion animation
- XP gain animation
- Level-up celebration
- Currency update
- Progress bar animation
- Reward notification
- Inventory purchase feedback

The goal is to make completing a normal real-life task feel rewarding.

---

## 12. Performance

The application should feel responsive even when communicating with the backend.

Where appropriate, the frontend may use:

- Loading states
- Skeleton screens
- Optimistic UI updates
- Smooth transitions

Network delays should not make the application feel slow.

---

## 13. Responsive Design

The application must work across:

- Desktop
- Tablet
- Mobile

The layout should adapt to different screen sizes without breaking functionality.

---

## 14. Accessibility

The application should support:

- Keyboard navigation
- Tab navigation
- Enter / Space interaction
- Semantic HTML
- Screen-reader-friendly structure
- Appropriate labels and focus states

---

## 15. Error Handling

The application should handle common errors gracefully.

Examples:

- Empty quest submission
- Invalid input
- Failed API request
- Database failure
- Unauthorized access
- Network connection failure
- Attempt to complete an invalid quest
- Attempt to purchase an unavailable item

The application should show useful feedback instead of crashing or displaying a blank screen.

---

## 16. Non-Functional Requirements

The application must:

- Be full-stack.
- Use a persistent database.
- Have secure authentication.
- Have working CRUD functionality.
- Have a non-linear progression system.
- Have gamification elements.
- Be responsive.
- Be accessible.
- Handle errors gracefully.
- Be deployable publicly.
- Have a clean GitHub repository.

---

## 17. Hackathon Deliverables

The final project must provide:

1. Public GitHub repository
2. Complete source code
3. Frontend code
4. Backend code
5. Database implementation
6. Professional README.md
7. `.env.example`
8. Live deployed application
9. Walkthrough video

The walkthrough video should demonstrate:

    Signup/Login
        ↓
    Create Quest
        ↓
    Complete Quest
        ↓
    XP / Level Progression
        ↓
    Refresh Page
        ↓
    Persistent Data

---

## 18. Success Criteria

The project will be considered successful when:

- A new user can create an account.
- A user can securely log in.
- A user can create and manage quests.
- Completing a quest correctly awards XP/rewards.
- Character progression works correctly.
- Levels follow a non-linear progression system.
- Streaks work correctly.
- Users can earn and spend virtual currency.
- Inventory works correctly.
- Data persists in Neon PostgreSQL.
- Refreshing the page does not lose progress.
- Users cannot modify another user's data.
- The application works on mobile and desktop.
- The application has a polished RPG-themed UI.
- The deployed application works without runtime crashes.

---

## 19. Development Principle

The project will be developed in the following order:

    1. Product Requirements
    2. System Rules
    3. System & UI Design
    4. Database
    5. Backend
    6. Frontend
    7. Integration
    8. Testing
    9. Deployment
    10. Final Submission

The database, backend, and frontend should be developed only after their requirements and rules are clearly defined.