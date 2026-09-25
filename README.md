# Final Year Project Manager

A web-based system that digitizes and automates the final-year project pipeline in an engineering college — from group registration through mentor allocation, topic approval, and progress tracking.

## Background

The final-year project lifecycle currently runs as a mix of offline steps and a Google Form, with manual mentor allocation and topic approval. This project replaces the online portions of that workflow with a connected system covering:

- **Group Registration** — digital registration replacing the Google Form, with built-in validation (shared elective subject, max 4 members per group, one group per student).
- **Mentor Preference Selection** — groups rank their top 3 mentor choices, timestamped precisely.
- **Automated Mentor Allocation** — First-Come-First-Served allocation across multiple rounds, capped at 3 groups per mentor, repeating until groups are assigned or capacity runs out.
- **Topic Proposal & Approval Workflow** — groups submit proposed topics (existing work, identified problem, proposed difference, innovation, feasibility); mentors approve or reject with feedback; full resubmission history is tracked.
- **GitHub Link Management** — groups submit and update their repository link at any time.
- **Role-Based Access** — separate Student/Group, Mentor, and Admin roles, each scoped to their own visibility.
- **Admin Controls** — open/close registration and preference rounds, manage mentors and capacities, manually resolve edge cases.
- **Notifications & Dashboards** — status updates for groups and mentors, plus at-a-glance pipeline views for each role.
- **Deadlines, Audit Logging, Data Export** — auto-closing windows, a timestamped activity log for dispute resolution, and CSV/PDF export for records.

**Out of scope (deliberately offline):** group formation itself, analysis of previous years' projects, and the in-person jury presentation.

## Tech Stack

This is a pnpm-managed monorepo (workspace) with the following layout:

- **`artifacts/final-year-project-manager`** — the frontend (React + Vite, shadcn/ui components).
- **`artifacts/api-server`** — the backend API server.
- **`artifacts/mockup-sandbox`** — UI mockup/preview sandbox.
- **`lib/db`** — database schema and access layer (Drizzle ORM).
- **`lib/api-spec`** — OpenAPI specification for the API.
- **`lib/api-zod`** — generated Zod validation schemas from the API spec.
- **`lib/api-client-react`** — generated typed API client for the frontend.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (install globally if you don't have it):
  ```
  npm install -g pnpm
  ```

### Setup

1. Clone this repository and open it in your editor.
2. From the project root (where `package.json` and `pnpm-workspace.yaml` live), install dependencies:
   ```
   pnpm install
   ```
   If this stops with `ERR_PNPM_IGNORED_BUILDS`, run:
   ```
   pnpm approve-builds --all
   pnpm install
   ```

### Running the dev server

**Command Prompt:**
```
set PORT=5173&& set BASE_PATH=/&& pnpm --filter @workspace/final-year-project-manager run dev
```

**PowerShell:**
```
$env:PORT=5173; $env:BASE_PATH="/"; pnpm --filter @workspace/final-year-project-manager run dev
```

Then open `http://localhost:5173` in a browser.

To stop the server: click the terminal, press `Ctrl+C`, and type `Y` if prompted. A red `ELIFECYCLE`/`ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL` message may appear afterward — this is harmless, just pnpm reacting to the forced shutdown.

> Steps above (Node/pnpm install, `pnpm install`) are one-time setup per machine. On future runs, only the dev server command is needed.

## Project Status

This project is under active development. The frontend scaffold was built via Replit; further development continues outside of Replit.
