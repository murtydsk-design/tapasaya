# TAPASYA — Life RPG

> **Turn your real life into an RPG.**

TAPASYA (Life RPG) is a full-stack web application built on the PERN stack (PostgreSQL, Express, React, Node.js) with Neon PostgreSQL. It converts real-world habits and productivity tasks into gamified quests, awarding Experience Points (XP), virtual currency (Gold), character level progression, attribute increases, and streak tracking.

---

## 📚 Project Documentation

The project structure and business logic strictly follow five core specification documents:

1. [`PRD.md`](./prd.md) — Product Overview, User Experience, Feature Requirements, and Scope.
2. [`RULES.md`](./rules.md) — Game Logic, XP Formulas, Character Attributes, Gold Economy, and Anti-Cheating Rules.
3. [`DESIGN.md`](./design.md) — System Architecture, UI/UX Principles, Navigation, and API Specifications.
4. [`DATABASE.md`](./database.md) — Neon PostgreSQL Database Schema, Table Specifications, Relationships, Constraints, and Indexing.
5. [`PHASES.md`](./phases.md) — Sequential 17-Phase Development Roadmap.

---

## 🛠️ Technology Stack

- **Frontend**: React, React Router, Axios, CSS Modules / Vanilla CSS
- **Backend**: Node.js, Express.js, REST API
- **Database**: PostgreSQL hosted on **Neon PostgreSQL**
- **Authentication**: JWT (JSON Web Tokens) with hashed passwords (`bcryptjs`)

---

## 📁 Repository Structure

```text
Tapasya/
├── backend/                  # Express Node.js REST API
│   ├── src/
│   │   ├── controllers/      # Request handlers & controllers
│   │   ├── routes/           # REST API routes
│   │   ├── middleware/       # Auth & validation middleware
│   │   ├── services/         # RPG business logic engine
│   │   ├── db/               # PostgreSQL pool connection (Neon)
│   │   ├── validators/       # Input validation schemas
│   │   └── utils/            # Helper utilities & constants
│   ├── .env.example          # Backend environment template
│   ├── .gitignore            # Backend gitignore
│   └── package.json          # Backend dependencies
│
├── frontend/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page views (Dashboard, Quests, etc.)
│   │   ├── layouts/          # Page layouts & navigation
│   │   ├── services/         # API service client
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Helper functions
│   ├── .env.example          # Frontend environment template
│   ├── .gitignore            # Frontend gitignore
│   └── package.json          # Frontend dependencies
│
├── .env.example              # Root environment blueprint
├── .gitignore                # Root gitignore rules
├── prd.md                    # Product Requirements Document
├── rules.md                  # System & RPG Rules
├── design.md                 # UI/UX & Architectural Design
├── database.md               # Database Schema Specifications
├── phases.md                 # Project Phase Plan
└── README.md                 # Project Overview & Setup Guide
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- Neon PostgreSQL Account & Connection String

### Setup Instructions

1. **Clone & Setup Environment**
   ```bash
   git clone <repository-url>
   cd Tapasya
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Neon DATABASE_URL and JWT_SECRET
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   cp .env.example .env
   # Edit .env with VITE_API_URL
   npm install
   npm run dev
   ```

---

## 🔒 Security Principles

- **Backend Authority**: All XP, Gold, Level, and Attribute calculations are calculated and validated solely on the backend.
- **Data Isolation**: Users can only access and modify their own records.
- **Environment Safety**: Secrets and database credentials are kept out of source control via `.gitignore`.
