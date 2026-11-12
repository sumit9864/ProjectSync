# ProjectSync — API Contract (Phase 1 Deliverable)

> **Status: LOCKED** — This document is the binding contract between the
> frontend and backend. Do not change endpoints, field names, or response
> shapes without following the change process in `BACKEND_PLAN.md`.
>
> **Produced by**: Phase 1 (API Contract) of the Backend Development Plan.
> **Date locked**: 2026-10-08

---

## A. Architecture Decision — Authentication (Task 1.5)

### Decision: JWT stored in `httpOnly` cookie, via Next.js API proxy

**Reasoning for this project:**

The frontend runs on Next.js (port 3000) and the backend on Express (port 3001).
These are different origins. Rather than dealing with CORS for cookies or
exposing tokens to client-side JavaScript via `localStorage`, the cleanest and
most secure approach for a Next.js project is:

1. Next.js rewrites act as a **transparent proxy** — all `/api/*` requests from
   the browser go to `http://localhost:3000/api/*`, which Next.js internally
   forwards to `http://localhost:3001/api/*`.
2. Because the browser only talks to `localhost:3000` (one origin), `httpOnly`
   cookies work perfectly with no CORS issues.
3. The JWT token is stored in a `httpOnly` cookie set by the Express backend.
   It is **never accessible to JavaScript** — fully protected from XSS attacks.
4. The frontend does not need to manually attach any header. The cookie is sent
   automatically with every request.

**Next.js rewrite config** (add to `next.config.mjs`):
```js
async rewrites() {
  return [
    { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' }
  ]
}
```

**Cookie settings:**
```
Name:     ps_token
HttpOnly: true
SameSite: Lax       (works in dev; change to Strict in production)
Secure:   false      (dev only — must be true in production with HTTPS)
MaxAge:   86400      (24 hours)
Path:     /
```

**JWT payload shape:**
```json
{ "userId": "uuid", "email": "string", "name": "string", "role": "student|mentor|admin", "iat": 0, "exp": 0 }
```

**Token expiry:** 24 hours. If any request returns `401`, the frontend clears
the session from memory and redirects to the login screen.

**Impact on `useAuth.ts`:** The hook will no longer call `demoUsers`. Instead:
- `signIn()` calls `POST /api/auth/login` → backend sets the cookie.
- `signOut()` calls `POST /api/auth/logout` → backend clears the cookie.
- Session restore on page load calls `GET /api/auth/me` → returns user from cookie.
- `localStorage` is no longer used for session storage.

---

## B. Architecture Decision — Backend Technology Stack (Task 1.6)

### Decision: Confirmed Stack

| Concern | Choice | Why this project specifically |
|---------|--------|-------------------------------|
| **Runtime** | Node.js 20 LTS | Same language as frontend; easy sharing of types |
| **Framework** | Express.js | Minimal boilerplate; full control over middleware order; well-understood |
| **Language** | TypeScript (strict mode) | Types shared with frontend; catches field-name mismatches at compile time |
| **Database** | PostgreSQL 16 | Data is highly relational (Groups → Members, Topics, Milestones, LogBook); ACID transactions needed for allocation algorithm |
| **ORM** | Prisma | Auto-generates TypeScript types from the DB schema; migration system prevents schema drift; works perfectly with PostgreSQL |
| **Auth** | `jsonwebtoken` + `bcrypt` | Industry standard; `bcrypt` cost factor 12 is appropriate for a university system |
| **Validation** | `zod` | Define request body schemas once; auto-generates TypeScript types; excellent error messages to return to frontend |
| **Dev server** | `tsx --watch` | Fastest TypeScript execution in dev; no build step required |
| **Env vars** | `dotenv` | Standard; loads `backend/.env` |
| **CORS** | `cors` middleware | Configured to allow only `http://localhost:3000` in dev |
| **Cookie parsing** | `cookie-parser` | Reads `httpOnly` cookies on every request |

**Folder structure (confirmed):**
```
ProjectSync/
├── src/                        ← Next.js frontend (existing)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── index.ts            ← app entry, middleware, route registration
│       ├── middleware/
│       │   ├── auth.ts         ← verifies JWT cookie, attaches req.user
│       │   └── requireRole.ts  ← role guard (e.g. admin-only routes)
│       ├── lib/
│       │   ├── prisma.ts       ← Prisma client singleton
│       │   ├── jwt.ts          ← sign / verify helpers
│       │   └── audit.ts        ← reusable audit event writer
│       ├── mockData/           ← Phase 2 only; deleted in Phase 3
│       └── routes/
│           ├── auth.ts
│           ├── groups.ts
│           ├── mentors.ts
│           ├── preferences.ts
│           ├── topics.ts
│           ├── milestones.ts
│           ├── logbook.ts
│           ├── github.ts
│           ├── windows.ts
│           ├── allocation.ts
│           ├── notifications.ts
│           ├── audit.ts
│           ├── archive.ts
│           └── dashboard.ts
└── next.config.mjs             ← add rewrites here
```

---

## C. Shared TypeScript Types (Task 1.2)

These types are the single source of truth. The frontend `src/types/` files
must stay in sync with these. The backend will import these from a shared
`backend/src/types/` file.

```typescript
// ─── Auth ────────────────────────────────────────────────────────────────────
export type AuthRole = 'student' | 'mentor' | 'admin';

export type AuthUser = {
  id:    string;
  name:  string;
  email: string;
  role:  AuthRole;
};

// ─── Electives ───────────────────────────────────────────────────────────────
export type ElectiveOption = {
  id:    string;   // e.g. 'ai'
  label: string;   // e.g. 'Artificial Intelligence'
  code:  string;   // e.g. 'CS701'
};

// ─── Group ───────────────────────────────────────────────────────────────────
export type PipelineStage =
  'registered' | 'mentor_assigned' | 'topic_approved' | 'github_connected';

export type GroupMember = {
  id:         string;
  name:       string;
  rollNumber: string;
  email:      string;
  elective:   string;
};

export type Group = {
  id:           string;
  projectId:    string;       // FYP-YYYY-NNN
  name:         string;
  leaderCrn:    string;
  electiveTwo:  string;
  electiveThree: string;
  members:      GroupMember[];
  mentorId:     string | null;
  registeredAt: string;       // ISO 8601
  stage:        PipelineStage;
};

// ─── Mentor ──────────────────────────────────────────────────────────────────
export type Mentor = {
  id:           string;
  name:         string;
  domain:       string;
  focus:        string;
  capacity:     number;
  currentLoad:  number;
  bio:          string;
  pastProjects: string[];
  avatarColor:  string;
};

// Admin-facing mentor (includes email)
export type AdminMentor = Mentor & { email: string };

// ─── Preferences ─────────────────────────────────────────────────────────────
export type ShortlistEntry = {
  mentorId: string;
  rank:     number;   // 1 = first choice
};

export type ShortlistSubmission = {
  round:       1 | 2;
  entries:     ShortlistEntry[];
  submittedAt: string;          // ISO 8601
};

// ─── Topic ───────────────────────────────────────────────────────────────────
export type TopicStatus = 'pending' | 'approved' | 'changes_requested';

export type TopicDraft = {
  workingTitle:       string;
  existingWork:       string;
  problemIdentified:  string;
  proposedDifference: string;
  innovation:         string;
  feasibility:        string;
};

export type TopicVersion = {
  version:     number;
  submittedAt: string;      // ISO 8601
  status:      TopicStatus;
  feedback?:   string;
};

export type DiscussionMessage = {
  id:          string;
  author:      string;
  role:        string;      // 'Student' | 'Mentor'
  avatarColor: string;
  body:        string;
  time:        string;      // ISO 8601
};

// ─── Milestones ──────────────────────────────────────────────────────────────
export type MilestoneStatus = 'complete' | 'incomplete';

export type Milestone = {
  id:           string;
  number:       number;
  title:        string;
  dueDate:      string;         // YYYY-MM-DD
  status:       MilestoneStatus;
  checkInNote?: string;
  checkedInAt?: string;         // ISO 8601
};

// ─── Log Book ─────────────────────────────────────────────────────────────────
export type LogBookAttendee = { name: string; present: boolean };

export type LogBookHistoryEntry = {
  editedAt:          string;
  pointsDiscussed:   string;
  mentorSuggestions: string;
  remarks:           string;
};

export type LogBookEntry = {
  id:                string;
  entryNumber:       number;
  date:              string;    // YYYY-MM-DD
  lastEditedAt:      string;    // ISO 8601
  attendance:        LogBookAttendee[];
  pointsDiscussed:   string;
  mentorSuggestions: string;
  remarks:           string;
  editHistory?:      LogBookHistoryEntry[];
};

// ─── Windows ─────────────────────────────────────────────────────────────────
export type WindowKey = 'registration' | 'round1' | 'round2';

export type ControlWindow = {
  open:     boolean;
  opensOn:  string;   // YYYY-MM-DD
  closesOn: string;   // YYYY-MM-DD
};

export type ControlWindows = Record<WindowKey, ControlWindow>;

// ─── Extensions ──────────────────────────────────────────────────────────────
export type Extension = {
  id:         string;
  groupId:    string | 'all';
  groupName:  string;
  offsetDays: number;
  reason:     string;
  grantedAt:  string;   // ISO 8601
  grantedBy:  string;
};

// ─── Allocation ───────────────────────────────────────────────────────────────
export type AllocationStatus = 'assigned' | 'unassigned';

export type AllocationResult = {
  groupId:         string;
  groupName:       string;
  status:          AllocationStatus;
  matchedMentorId?: string;
  matchedRank?:    number;
};

export type AllocationHistoryEntry = {
  id:         string;
  round:      1 | 2;
  ranAt:      string;   // ISO 8601
  results:    AllocationResult[];
  assignedCount: number;
  unassignedCount: number;
};

// ─── Admin Pipeline ───────────────────────────────────────────────────────────
export type AdminPipelineStage =
  'awaiting_allocation' | 'mentor_assigned' | 'topic_review' | 'building';

export type AdminGroup = {
  id:             string;
  projectId:      string;
  name:           string;
  memberCount:    number;
  elective:       string;
  mentorId:       string | null;
  mentorName:     string | null;
  topicStatus:    'none' | 'pending' | 'approved' | 'changes_requested';
  githubConnected: boolean;
  stage:          AdminPipelineStage;
  preferences:    ShortlistEntry[];
};

// ─── Mentor (review) ──────────────────────────────────────────────────────────
export type MentorGroup = {
  id:            string;
  projectId:     string;
  name:          string;
  status:        PipelineStage;
  members:       GroupMember[];
  milestones:    Milestone[];
  topicVersions: TopicVersion[];
  discussion:    DiscussionMessage[];
  topicDraft:    TopicDraft | null;
};

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning';

export type Notification = {
  id:   string;
  title: string;
  body:  string;
  time:  string;   // ISO 8601
  read:  boolean;
  type:  NotificationType;
};

// ─── Audit ────────────────────────────────────────────────────────────────────
export type AuditEvent = {
  id:          string;
  timestamp:   string;   // ISO 8601
  description: string;
  actor:       string;
  group:       string;
};

// ─── Archive ─────────────────────────────────────────────────────────────────
export type ArchiveEntry = {
  id:       string;
  year:     string;
  title:    string;
  group:    string;
  elective: string;
  abstract: string;
  mentor:   string;
  grade:    string;
};

// ─── Activity / Dashboard ─────────────────────────────────────────────────────
export type ActivityItem = {
  id:     string;
  action: string;
  actor:  string;
  time:   string;
  icon:   string;
};

export type Deadline = {
  id:       string;
  title:    string;
  date:     string;
  daysLeft: number;
  page:     string;
};
```

---

## D. Standard Error Response Format (Task 1.3)

Every endpoint, on every error, must return this exact shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description shown to developer/logs"
  }
}
```

### Error codes and HTTP status mapping

| HTTP Status | Code | When to use |
|-------------|------|-------------|
| `400` | `VALIDATION_ERROR` | Request body fails zod schema; missing required fields |
| `401` | `UNAUTHORIZED` | Missing cookie / invalid JWT / expired token |
| `403` | `FORBIDDEN` | Valid token but wrong role for this endpoint |
| `404` | `NOT_FOUND` | Requested resource (group, mentor, entry) does not exist |
| `409` | `CONFLICT` | Duplicate — e.g. student already belongs to a group |
| `422` | `BUSINESS_RULE` | Request is well-formed but violates a domain rule (see Section E) |
| `500` | `INTERNAL` | Unexpected server error |

### Frontend error handling

The frontend `apiClient.ts` must:
1. Check if response status is not 2xx.
2. Parse `response.error.code` to decide how to display the error.
3. If `code === 'UNAUTHORIZED'`, clear session and redirect to login.
4. Otherwise, pass `response.error.message` to `showToast(..., 'error')`.

---

## E. Business Rules — Server-Side Enforcement (Task 1.4)

These rules are validated by the backend. The frontend also enforces them for
UX, but the backend is the authoritative enforcer.

| # | Rule | Endpoint | HTTP status if violated |
|---|------|----------|------------------------|
| BR-01 | Registration window must be open | `POST /api/groups` | `422 BUSINESS_RULE` |
| BR-02 | A student may only be in one group | `POST /api/groups` | `409 CONFLICT` |
| BR-03 | A group must have 3–4 members total (leader + 2 or 3 others) | `POST /api/groups` | `400 VALIDATION_ERROR` |
| BR-04 | Group composition is locked after registration (no add/remove members) | any member mutation | `422 BUSINESS_RULE` |
| BR-05 | Preference window must be open for the requested round | `POST /api/preferences` | `422 BUSINESS_RULE` |
| BR-06 | Shortlist must have min 2, max 3 entries | `POST /api/preferences` | `400 VALIDATION_ERROR` |
| BR-07 | All shortlist rank values must be unique and sequential from 1 | `POST /api/preferences` | `400 VALIDATION_ERROR` |
| BR-08 | Cannot add a mentor to shortlist if `currentLoad >= capacity` | `POST /api/preferences` | `422 BUSINESS_RULE` |
| BR-09 | Cannot submit topic if status is already `approved` | `POST /api/topics/submit` | `422 BUSINESS_RULE` |
| BR-10 | Cannot submit topic if no mentor has been assigned to the group | `POST /api/topics/submit` | `422 BUSINESS_RULE` |
| BR-11 | Milestone check-in must be sequential (N-1 must be complete first) | `POST /api/milestones/:id/checkin` | `422 BUSINESS_RULE` |
| BR-12 | A mentor can only be deleted if `currentLoad === 0` | `DELETE /api/admin/mentors/:id` | `422 BUSINESS_RULE` |
| BR-13 | Allocation round 2 cannot run until round 1 has been run | `POST /api/admin/allocation/run { round: 2 }` | `422 BUSINESS_RULE` |
| BR-14 | Log book can only be written by the group's assigned mentor | `POST/PUT /api/mentor/groups/:id/logbook` | `403 FORBIDDEN` |
| BR-15 | Topic decisions can only be made by the group's assigned mentor | `POST /api/mentor/groups/:id/topic/decision` | `403 FORBIDDEN` |
| BR-16 | GitHub URL must match pattern `github.com/{owner}/{repo}` | `PUT /api/github` | `400 VALIDATION_ERROR` |
| BR-17 | Admin-only routes must reject non-admin roles | all `/api/admin/*` routes | `403 FORBIDDEN` |
| BR-18 | Mentor-only routes must reject non-mentor roles | all `/api/mentor/*` routes | `403 FORBIDDEN` |

---

## F. Complete Endpoint Reference (Task 1.1)

### F.1 — Auth

```
POST /api/auth/login
  Body:    { email: string, password: string }
  Success: 200 { user: AuthUser }  ← also sets httpOnly cookie
  Errors:  401 UNAUTHORIZED (bad credentials)

POST /api/auth/logout
  Auth:    cookie
  Success: 200 { success: true }  ← clears cookie

GET /api/auth/me
  Auth:    cookie
  Success: 200 { user: AuthUser }
  Errors:  401 UNAUTHORIZED
```

### F.2 — Electives (public)

```
GET /api/electives
  Auth:    none (public)
  Success: 200 { options: ElectiveOption[] }
```

### F.3 — Groups

```
GET /api/groups/mine
  Auth:    cookie (student)
  Success: 200 { group: Group | null }

POST /api/groups
  Auth:    cookie (student)
  Body:    { leaderCrn: string, electiveTwo: string, electiveThree: string, members: { crn: string, name: string, email: string }[] }
  Success: 201 { group: Group }
  Errors:  422 BR-01, 409 BR-02, 400 BR-03
```

### F.4 — Mentor Preferences

```
GET /api/mentors
  Auth:    none (public — students need this before logging in during demo; or cookie)
  Success: 200 { mentors: Mentor[] }

GET /api/preferences/mine
  Auth:    cookie (student)
  Query:   round=1|2
  Success: 200 { submission: ShortlistSubmission | null }

POST /api/preferences
  Auth:    cookie (student)
  Body:    { round: 1 | 2, entries: ShortlistEntry[] }
  Success: 201 { submission: ShortlistSubmission }
  Errors:  422 BR-05, 400 BR-06, 400 BR-07, 422 BR-08
```

### F.5 — Windows (student-facing read)

```
GET /api/windows/:key
  Auth:    none (public — frontend checks this to show/hide submit buttons)
  Param:   key = registration | round1 | round2
  Success: 200 { window: ControlWindow }
```

### F.6 — Topic Studio

```
GET /api/topics/mine
  Auth:    cookie (student)
  Success: 200 {
    draft:         TopicDraft | null,
    versions:      TopicVersion[],
    currentStatus: TopicStatus | null,
    discussion:    DiscussionMessage[]
  }

PUT /api/topics/draft
  Auth:    cookie (student)
  Body:    { draft: TopicDraft }
  Success: 200 { savedAt: string }

POST /api/topics/submit
  Auth:    cookie (student)
  Body:    { draft: TopicDraft }
  Success: 201 { version: TopicVersion }
  Errors:  422 BR-09, 422 BR-10

POST /api/topics/discussion
  Auth:    cookie (student)
  Body:    { body: string }
  Success: 201 { message: DiscussionMessage }
```

### F.7 — GitHub Tracker

```
GET /api/github/mine
  Auth:    cookie (student)
  Success: 200 { url: string | null, lastUpdated: string | null, connected: boolean }

PUT /api/github
  Auth:    cookie (student)
  Body:    { url: string }
  Success: 200 { url: string, lastUpdated: string, connected: true }
  Errors:  400 BR-16
```

### F.8 — Milestones

```
GET /api/milestones/mine
  Auth:    cookie (student)
  Success: 200 { milestones: Milestone[] }

POST /api/milestones/:milestoneId/checkin
  Auth:    cookie (student)
  Body:    { note: string }
  Success: 200 { milestone: Milestone }
  Errors:  422 BR-11, 404 NOT_FOUND
```

### F.9 — Log Book (student read-only)

```
GET /api/logbook/mine
  Auth:    cookie (student)
  Success: 200 { entries: LogBookEntry[] }
```

### F.10 — Student Dashboard

```
GET /api/dashboard/student
  Auth:    cookie (student)
  Success: 200 {
    projectProgress:        number,
    groupHealth:            string,
    groupName:              string,
    teamMembers:            GroupMember[],
    assignedMentor:         { name: string, domain: string } | null,
    nextDeadline:           { title: string, date: string, daysLeft: number } | null,
    completedPipelineStages: PipelineStage[],
    recentActivity:         ActivityItem[],
    upcomingDeadlines:      Deadline[]
  }
```

### F.11 — Mentor Groups

```
GET /api/mentor/groups
  Auth:    cookie (mentor)
  Success: 200 { groups: MentorGroup[] }
  Errors:  403 BR-18

GET /api/mentor/groups/:groupId/topic
  Auth:    cookie (mentor)
  Success: 200 { versions: TopicVersion[], currentStatus: TopicStatus | null, draft: TopicDraft | null, discussion: DiscussionMessage[] }
  Errors:  403 BR-18, 404 NOT_FOUND
```

### F.12 — Mentor Topic Decisions

```
POST /api/mentor/groups/:groupId/topic/decision
  Auth:    cookie (mentor)
  Body:    { decision: 'approved' | 'changes_requested', feedback?: string }
  Success: 200 { version: TopicVersion }
  Errors:  403 BR-15, 404 NOT_FOUND

POST /api/mentor/groups/:groupId/discussion
  Auth:    cookie (mentor)
  Body:    { body: string }
  Success: 201 { message: DiscussionMessage }
  Errors:  403 BR-18, 404 NOT_FOUND

POST /api/mentor/bulk-decision
  Auth:    cookie (mentor)
  Body:    { groupIds: string[], decision: 'approved' | 'changes_requested', feedback?: string }
  Success: 200 { updated: number }
  Errors:  403 BR-18
```

### F.13 — Mentor Log Book

```
GET /api/mentor/groups/:groupId/logbook
  Auth:    cookie (mentor)
  Success: 200 { entries: LogBookEntry[] }
  Errors:  403 BR-18, 404 NOT_FOUND

POST /api/mentor/groups/:groupId/logbook
  Auth:    cookie (mentor)
  Body:    {
    date: string,
    time: string,
    attendance: { memberId: string, present: boolean }[],
    pointsDiscussed: string,
    mentorSuggestions: string,
    remarks: string
  }
  Success: 201 { entry: LogBookEntry }
  Errors:  403 BR-14, 404 NOT_FOUND

PUT /api/mentor/groups/:groupId/logbook/:entryId
  Auth:    cookie (mentor)
  Body:    { same as POST }
  Success: 200 { entry: LogBookEntry }
  Errors:  403 BR-14, 404 NOT_FOUND
  Note:    Backend archives previous values into editHistory before overwriting.
```

### F.14 — Mentor Dashboard & Calendar

```
GET /api/mentor/dashboard
  Auth:    cookie (mentor)
  Success: 200 {
    stats:        { assignedGroups: number, pendingReviews: number, avgResponseTime: string, capacity: number },
    weekProgress: { reviewed: number, total: number },
    groups:       MentorGroup[]
  }

GET /api/mentor/calendar
  Auth:    cookie (mentor)
  Query:   month=YYYY-MM
  Success: 200 {
    events:         { day: number, title: string, type: 'review' | 'session' | 'deadline' }[],
    recentActivity: { group: string, action: string, time: string }[]
  }
```

### F.15 — Admin: Mentors

```
GET /api/admin/mentors
  Auth:    cookie (admin)
  Success: 200 { mentors: AdminMentor[] }
  Errors:  403 BR-17

POST /api/admin/mentors
  Auth:    cookie (admin)
  Body:    { name: string, domain: string, email: string, capacity: number }
  Success: 201 { mentor: AdminMentor }
  Errors:  403 BR-17, 409 CONFLICT (email already exists)

PUT /api/admin/mentors/:mentorId
  Auth:    cookie (admin)
  Body:    { name?: string, domain?: string, email?: string, capacity?: number }
  Success: 200 { mentor: AdminMentor }
  Errors:  403 BR-17, 404 NOT_FOUND

DELETE /api/admin/mentors/:mentorId
  Auth:    cookie (admin)
  Success: 200 { success: true }
  Errors:  403 BR-17, 404 NOT_FOUND, 422 BR-12
```

### F.16 — Admin: Windows & Extensions

```
GET /api/admin/windows
  Auth:    cookie (admin)
  Success: 200 { windows: ControlWindows }

PUT /api/admin/windows/:key
  Auth:    cookie (admin)
  Param:   key = registration | round1 | round2
  Body:    { opensOn?: string, closesOn?: string, open?: boolean }
  Success: 200 { window: ControlWindow }
  Errors:  403 BR-17, 400 VALIDATION_ERROR

POST /api/admin/extensions
  Auth:    cookie (admin)
  Body:    { groupId: string | 'all', offsetDays: number, reason: string }
  Success: 201 { extension: Extension }
  Errors:  403 BR-17, 400 VALIDATION_ERROR

GET /api/admin/extensions
  Auth:    cookie (admin)
  Success: 200 { extensions: Extension[] }
```

### F.17 — Admin: Allocation

```
POST /api/admin/allocation/run
  Auth:    cookie (admin)
  Body:    { round: 1 | 2 }
  Success: 200 { results: AllocationResult[], historyEntry: AllocationHistoryEntry }
  Errors:  403 BR-17, 422 BR-13

POST /api/admin/allocation/manual
  Auth:    cookie (admin)
  Body:    { groupId: string, mentorId: string }
  Success: 200 { result: AllocationResult }
  Errors:  403 BR-17, 404 NOT_FOUND, 422 BUSINESS_RULE (mentor full)

GET /api/admin/allocation/history
  Auth:    cookie (admin)
  Success: 200 { history: AllocationHistoryEntry[] }
```

### F.18 — Admin: Groups (Pipeline view)

```
GET /api/admin/groups
  Auth:    cookie (admin)
  Query:   search?, stage?, topicStatus?, elective?, page=1, limit=20
  Success: 200 { groups: AdminGroup[], total: number }

GET /api/admin/groups/export.csv
  Auth:    cookie (admin)
  Success: 200  Content-Type: text/csv
```

### F.19 — Admin: Dashboard

```
GET /api/admin/dashboard
  Auth:    cookie (admin)
  Success: 200 {
    stats: {
      totalGroups:        number,
      awaitingAllocation: number,
      pendingTopics:      number,
      githubConnected:    number
    },
    pipelineDistribution: { stage: string, count: number }[],
    attentionNeeded:      AdminGroup[],
    mentorLoad:           { mentorId: string, name: string, current: number, capacity: number }[]
  }
```

### F.20 — Admin: Audit Log

```
GET /api/admin/audit
  Auth:    cookie (admin)
  Query:   search?, actor?, group?, page=1, limit=50
  Success: 200 { events: AuditEvent[], total: number }

GET /api/admin/audit/export.csv
  Auth:    cookie (admin)
  Success: 200  Content-Type: text/csv
```

### F.21 — Admin: Archive

```
GET /api/admin/archive
  Auth:    cookie (admin)
  Query:   search?, year?, elective?
  Success: 200 { entries: ArchiveEntry[] }

POST /api/admin/archive
  Auth:    cookie (admin)
  Body:    { year: string, title: string, group: string, elective: string, abstract: string, mentor: string, grade: string }
  Success: 201 { entry: ArchiveEntry }
  Errors:  403 BR-17
```

### F.22 — Notifications

```
GET /api/notifications
  Auth:    cookie (any authenticated role)
  Success: 200 { notifications: Notification[] }

POST /api/notifications/:id/read
  Auth:    cookie (any authenticated role)
  Success: 200 { notification: Notification }
  Errors:  404 NOT_FOUND
```

---

## G. Audit Events Reference

Every backend mutation must create an entry in the `AuditEvent` table.
The following lists the expected `description` format per event:

| Trigger | Description format |
|---------|--------------------|
| Group registered | `"Group {projectId} ({name}) registered"` |
| Mentor assigned (auto) | `"Mentor {mentorName} assigned to {groupName} (Round {round}, Rank {rank})"` |
| Mentor assigned (manual) | `"Admin manually assigned {mentorName} to {groupName}"` |
| Topic submitted | `"Group {groupName} submitted topic v{version}: {workingTitle}"` |
| Topic approved | `"Mentor {mentorName} approved topic for {groupName}"` |
| Topic changes requested | `"Mentor {mentorName} requested changes on {groupName}'s topic"` |
| Log book entry created | `"Mentor {mentorName} created log entry #{entryNumber} for {groupName}"` |
| Log book entry edited | `"Mentor {mentorName} edited log entry #{entryNumber} for {groupName}"` |
| Milestone checked in | `"Group {groupName} checked in milestone #{number}: {title}"` |
| Extension granted | `"Admin granted {offsetDays}-day extension to {groupName}: {reason}"` |
| Window opened | `"Admin opened {key} window (closes {closesOn})"` |
| Window closed | `"Admin closed {key} window"` |
| GitHub URL saved | `"Group {groupName} connected GitHub repository"` |

---

## H. Endpoint Count Summary

| Category | Endpoint count |
|----------|---------------|
| Auth | 3 |
| Public (electives, windows) | 4 |
| Student | 11 |
| Mentor | 10 |
| Admin | 18 |
| Notifications | 2 |
| **Total** | **48** |

---

*This document is LOCKED as of 2026-10-08.*
*Any modification requires updating this file first, before changing any code.*
