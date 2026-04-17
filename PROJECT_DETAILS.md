# DSA Platform - Detailed Project Documentation

## 1. Project Overview

This is a full-stack DSA practice platform with:
- User authentication
- Problem library and topic roadmap
- Progress tracking (solved/attempted/streak)
- AI/curated hints
- Daily challenge and leaderboard
- Admin workflows for importing LeetCode problems by URL or problem number

The current frontend stack is **React + Vite**.

---

## 2. Languages Used and Their Purpose

### JavaScript (Node.js) - Backend and Data Scripts
Used in:
- API server and route handlers
- Business logic/controllers
- Firebase Admin integration
- LeetCode import/scrape services
- One-time and bulk import scripts

Key folders:
- `backend/server.js`
- `backend/controllers/`
- `backend/routes/`
- `backend/services/`
- `backend/models/` (seed/import scripts)

### TypeScript + TSX - Frontend Application
Used in:
- React pages and components
- Frontend state/context/hooks
- API service wrappers
- Type-safe UI logic

Key folders:
- `frontend/src/pages/`
- `frontend/src/components/`
- `frontend/src/context/`
- `frontend/src/hooks/`
- `frontend/src/services/`

### CSS (Tailwind + Custom CSS)
Used in:
- Global theme tokens and app styling
- Utility-first UI with Tailwind classes
- Component-level visual design

Key files:
- `frontend/src/globals.css`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`

### JSON
Used for:
- Package/dependency management
- TypeScript and toolchain configuration
- Build scripts and metadata

Key files:
- `package.json`
- `backend/package.json`
- `frontend/package.json`
- `frontend/tsconfig.json`

### Markdown
Used for:
- Project documentation and setup notes

Key files:
- `README.md`
- `PROJECT_DETAILS.md` (this file)

### Problem-Solution Languages Supported in Stored Data
For coding templates/content, the platform stores starter code in:
- JavaScript
- Python
- Java
- C++

These are stored in problem documents (`starterCode`) and are used as content for coding practice flows.

---

## 3. High-Level Architecture

### Frontend (React + Vite)
Responsibilities:
- UI rendering and interactions
- Authentication state management
- Calling backend REST APIs
- Showing progress analytics, roadmap, leaderboard, interview screen

Main app entry:
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`

### Backend (Express)
Responsibilities:
- REST API endpoints
- Auth-guarded operations
- Firestore reads/writes
- Hint generation integration
- LeetCode scraping/import workflows

Main server entry:
- `backend/server.js`

### Database (Firebase Firestore)
Responsibilities:
- Persist users, problems, submissions, bookmarks/progress fields

Admin SDK wrapper:
- `backend/utils/firebase.js`

---

## 4. Core Functional Modules

### Authentication
- Firebase Auth + backend profile registration
- Profile fetch/update APIs
- Context management in frontend

Relevant files:
- `backend/controllers/authController.js`
- `backend/routes/authRoutes.js`
- `frontend/src/context/AuthContext.tsx`

### Problem Management
- List/filter/get problem details
- Create problem (admin)
- Update user progress (`attempted`, `solved`, `reset`)

Relevant files:
- `backend/controllers/problemController.js`
- `backend/routes/problemRoutes.js`
- `frontend/src/pages/ProblemsPage.tsx`
- `frontend/src/pages/ProblemDetailPage.tsx`

### Progress and Gamification
- Solved/attempted tracking
- Daily streak + max streak
- Solve history and recently solved
- Achievements/badges and printable certificates

Relevant files:
- `backend/controllers/problemController.js`
- `frontend/src/components/BadgesPanel.tsx`
- `frontend/src/components/CertificateModal.tsx`
- `frontend/src/pages/DashboardPage.tsx`

### Roadmap
- Topic-based progression view
- Topic normalization support for imported LeetCode topics
- Topic link integration with problem list filters

Relevant files:
- `frontend/src/pages/RoadmapPage.tsx`
- `frontend/src/pages/ProblemsPage.tsx`

### LeetCode Import System
- Import by URL and by problem number
- Bulk topic import scripts
- Duplicate-safe upsert behavior

Relevant files:
- `backend/services/leetcodeService.js`
- `backend/controllers/adminController.js`
- `backend/routes/adminRoutes.js`
- `frontend/src/pages/AdminAddQuestionPage.tsx`

Bulk scripts added during development:
- `backend/models/bulkAddArrayProblems.js`
- `backend/models/bulkAddCoreTopics.js`
- `backend/models/bulkAddStackQueue.js`
- `backend/models/bulkAddGraphs.js`

---

## 5. API Surface (Major Routes)

- `GET /api/problems` - fetch all problems
- `GET /api/problems/:id` - problem detail
- `POST /api/problems/:id/progress` - mark attempted/solved/reset
- `POST /api/auth/register` - register profile
- `GET /api/auth/profile` - fetch profile
- `PUT /api/auth/profile` - update profile
- `GET /api/daily` - daily challenge
- `GET /api/leaderboard` - ranking data
- `POST /api/hint` - hint retrieval
- `POST /api/bookmarks/toggle` - bookmark toggle
- `GET /api/bookmarks` - bookmark list
- `POST /api/admin/scrape-leetcode` - import by URL
- `POST /api/admin/fetch-by-number` - import by LeetCode number

---

## 6. Data Model Snapshot

### users
Typical fields:
- `id`, `email`, `name`
- `solvedProblems: string[]`
- `attemptedProblems: string[]`
- `bookmarks: string[]`
- `streak`, `maxStreak`, `lastSolvedDate`
- `solveHistory: { [date: string]: number }`
- `recentlySolved: string[]`

### problems
Typical fields:
- `title`, `difficulty`, `topic`
- `source`, `sourceUrl`, `leetcodeId`
- `description`, `examples`, `constraints`, `hints`
- `starterCode` by language
- `testCases`

### submissions
Used when submission/execution mode is enabled for workflows requiring it.

---

## 7. Build and Run Commands

### Workspace root
- `npm run dev` - run frontend + backend concurrently
- `npm run start` - start both in production mode scripts

### Backend
- `npm run dev` - nodemon server
- `npm start` - node server

### Frontend
- `npm run dev` - Vite dev server
- `npm run build` - TypeScript compile + Vite build
- `npm run preview` - preview built app

---

## 8. Key Notes for Future Development

1. Prefer topic normalization (`Array` -> `Arrays`, `String` -> `Strings`) when importing external problem metadata.
2. Use LeetCode ID (`leetcodeId`) for dedupe/upsert instead of title matching.
3. Keep profile fields backward-compatible; initialize new gamification fields in registration flow.
4. For large imports, use dry-run first, then full import with retry/backoff.
5. Keep UI theme changes centralized in `frontend/src/globals.css` tokens before editing many component classes.
