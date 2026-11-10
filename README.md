# ProjectSync

ProjectSync is a student final-year project tracking and management platform. It streamlines the lifecycle of academic projects by connecting students, mentors, and administrators in a single interface.

## Architecture

The project consists of two separate servers:
1. **Frontend**: Next.js React application (runs on port 3000)
2. **Backend**: Express.js server with persistent database storage (runs on port 3001)

## Running Locally

You will need to open **two separate terminal windows** to run the frontend and backend simultaneously.

> **Note:** Use `npm` instead of `pnpm` if your system's application control policy blocks pnpm scripts.

### 1. Start the Backend Server (Terminal 1)
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the Express server on port 3001
npm run dev
```

### 2. Start the Frontend Server (Terminal 2)
```bash
# Open a new terminal at the project root
# Install dependencies
npm install

# Start the Next.js server on port 3000
npm run dev
```

3. Open `http://localhost:3000` in your browser.

## Demo Accounts

The frontend interacts with the backend database. The following credentials are valid for login:

- **Admin**: `admin@university.edu` / `password`
- **Mentor**: `mentor@university.edu` / `password`
- **Student**: `student@university.edu` / `password`

## Current Status

- **Frontend**: ✅ Complete. Built with Next.js, React, and Tailwind CSS.
- **Backend (Mock & API)**: ✅ Complete. Express server enforcing business logic and routing.
- **Backend (Database)**: ⏳ In Progress. Added persistent JSON file database schema (`backend/src/lib/db.ts`) and data folder. Full PostgreSQL + Prisma migration in Phase 3.

## Folder Structure

- `backend/`: Express.js server, route handlers, and database layer.
  - `backend/data/`: Persistent database store (`db.json` excluded via `.gitignore`).
  - `backend/src/lib/`: Database configuration (`db.ts`), JWT, and audit utilities.
- `src/components/`: Reusable UI components (buttons, cards, forms) and shells.
- `src/screens/`: Page-level components separated by role (`student`, `mentor`, `admin`).
- `src/lib/`: Utility functions (formatting, `apiClient.ts` wrapper).