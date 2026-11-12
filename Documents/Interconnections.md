# ProjectSync — Frontend–Backend Interconnections Map

> **Purpose**: This document maps every frontend module, its UI components, and
> the exact data it consumes or produces. Each section ends with the **API
> endpoints** that the backend must expose to replace the current mock data.
> Use this as the single source of truth when building the backend.

---

## How to Read This Document

- **Frontend Component** — the React component file.
- **Data Consumed** — fields read from mock data or props.
- **Data Produced / Actions** — mutations triggered by user interaction.
- **Backend API Required** — the REST endpoints needed to power this module.
- **Cross-Module Links** — which other modules share data with this one.

---

## 1. Authentication Module

### Components

| Component | File |
|-----------|------|
| `AuthScreen` | `src/components/AuthScreen.tsx` |
| `SignInForm` | `src/components/auth/SignInForm.tsx` |
| `SignUpForm` | `src/components/auth/SignUpForm.tsx` |
| `DemoAccountsHelper` | `src/components/auth/DemoAccountsHelper.tsx` |
| `useAuth` hook | `src/hooks/useAuth.ts` |

### Data Flow

**Data Consumed (Sign In)**
- `email: string`
- `password: string`

**Data Produced on Success**
- `AuthSession { email, name, role: 'student' | 'mentor' | 'admin' }`
- Session is persisted to `localStorage` under key `fypm-auth-session`

**Current Mock Behaviour**
- Credentials validated against hardcoded `demoUsers` array.
- No real token issued; a plain JSON object stored in localStorage.

### Backend API Required

```
POST /api/auth/login
  Body: { email, password }
  Response: { token, user: { id, name, email, role } }

POST /api/auth/logout
  (Invalidate token server-side if using session tokens)

GET /api/auth/me
  Header: Authorization: Bearer <token>
  Response: { id, name, email, role }
```

### Cross-Module Links
- On successful login, `App.tsx` routes to the correct shell based on `role`.
- All subsequent API calls from every other module must include the auth token.

---

## 2. Student Module — Group Registration

### Components

| Component | File |
|-----------|------|
| `GroupRegistrationPage` | `src/screens/student/GroupRegistrationPage.tsx` |

### Data Flow

**Data Consumed**
- Logged-in student's `name` and `email` (pre-filled, read-only from auth session)
- `leaderCrn: string` (typed by user)
- `electiveTwo: string` (dropdown — currently hardcoded in the component)
- `electiveThree: string` (dropdown — currently hardcoded in the component)
- `members[]: { crn, name, email }` — 2–3 additional members entered manually

**Data Produced on Submit**
- A new group with a server-assigned `projectId` (FCFS timestamp-based)
- Group status transitions to `registered`

**State After Submission (shown on screen)**
- `projectId` (auto-generated, e.g. `FYP-2026-014`)
- Registered member list
- Warning: "Group composition is now locked"

### Backend API Required

```
POST /api/groups
  Header: Authorization: Bearer <token>
  Body: { leaderCrn, electiveTwo, electiveThree, members: [{ crn, name, email }] }
  Response: { group: { id, projectId, members, registeredAt } }

GET /api/groups/mine
  Header: Authorization: Bearer <token>
  Response: { group: Group | null }

GET /api/electives
  Response: { electiveTwoOptions: string[], electiveThreeOptions: string[] }
```

### Cross-Module Links
- `AdminPipelinePage` displays registered groups.
- `AdminAllocationPage` uses groups for mentor matching.
- `OverviewPage` shows `groupName`, `teamMembers`, and pipeline stage.

---

## 3. Student Module — Mentor Preferences

### Components

| Component | File |
|-----------|------|
| `MentorPreferencesPage` | `src/screens/student/MentorPreferencesPage.tsx` |

### Data Flow

**Data Consumed**
- `mentors[]` — full list of available mentors:
  `{ id, name, domain, focus, capacity, currentLoad, bio, pastProjects, avatarColor }`
- `round: 1 | 2` — user-selected via tab toggle
- `shortlist: string[]` — mentor IDs in rank order (local state)
- `submission: ShortlistSubmission | null` — tracks whether round already submitted

**Data Produced on Submit**
- `ShortlistSubmission { round, entries: [{ mentorId, rank }], submittedAt }`

**UI Rules Enforced**
- Max 3 mentors in shortlist; min 2 to submit.
- Cannot add a mentor whose `currentLoad >= capacity`.
- Submission can be revised until the deadline window closes.
- Profile modal shows mentor bio and past projects.

### Backend API Required

```
GET /api/mentors
  Response: { mentors: Mentor[] }

GET /api/preferences/mine?round=1
  Header: Authorization: Bearer <token>
  Response: { submission: ShortlistSubmission | null }

POST /api/preferences
  Header: Authorization: Bearer <token>
  Body: { round: 1 | 2, entries: [{ mentorId, rank }] }
  Response: { submission: ShortlistSubmission }

GET /api/windows/round1
  Response: { open: boolean, opensOn: string, closesOn: string }
```

### Cross-Module Links
- `AdminAllocationPage` reads these preferences and runs the FCFS algorithm.
- `OverviewPage` shows the `assignedMentor` once allocation is complete.
- `AdminMentorsPage` manages the mentor list displayed here.

---

## 4. Student Module — Topic Studio

### Components

| Component | File |
|-----------|------|
| `TopicStudioPage` (orchestrator) | `src/screens/student/TopicStudioPage.tsx` |
| `TopicForm` | `src/screens/student/topic/TopicForm.tsx` |
| `TopicDiscussion` | `src/screens/student/topic/TopicDiscussion.tsx` |
| `TopicVersionHistory` | `src/screens/student/topic/TopicVersionHistory.tsx` |

### Data Flow

**Data Consumed**
- `topicDraft` — 6-field object:
  `{ workingTitle, existingWork, problemIdentified, proposedDifference, innovation, feasibility }`
- `topicVersions[]` — past submitted versions: `{ version, submittedAt, status, feedback? }`
- `discussionMessages[]` — thread: `{ id, author, role, avatarColor, body, time }`
- `currentUser`, `assignedMentor`

**Data Produced**
- **Auto-save** — draft debounce-saved 2s after last keystroke.
- **Submit** — creates a new `TopicVersion` with `status: 'pending'`.
- **Reply** — posts a new `DiscussionMessage`.

**UI Rules Enforced**
- If `currentStatus === 'approved'`, all form fields are disabled.
- Version history shows all past submissions with status + feedback.

**Topic Status Flow**
```
(not submitted) -> pending -> changes_requested -> pending -> ... -> approved
```

### Backend API Required

```
GET /api/topics/mine
  Header: Authorization: Bearer <token>
  Response: { draft, versions: TopicVersion[], currentStatus, discussion: DiscussionMessage[] }

PUT /api/topics/draft
  Header: Authorization: Bearer <token>
  Body: { draft: TopicDraft }
  Response: { savedAt: string }

POST /api/topics/submit
  Header: Authorization: Bearer <token>
  Body: { draft: TopicDraft }
  Response: { version: TopicVersion }

POST /api/topics/discussion
  Header: Authorization: Bearer <token>
  Body: { body: string }
  Response: { message: DiscussionMessage }
```

### Cross-Module Links
- `MentorReviewQueuePage` reads and acts on the same topic and discussion data.
- Mentor decision updates `topicStatus` — visible here.
- `OverviewPage` reflects `topic_approved` pipeline stage after approval.
- `AdminPipelinePage` shows `topicStatus` per group.

---

## 5. Student Module — GitHub Tracker

### Components

| Component | File |
|-----------|------|
| `GithubTrackerPage` | `src/screens/student/GithubTrackerPage.tsx` |

### Data Flow

**Data Consumed**
- `githubRepo: { url, lastUpdated, connected }`

**Data Produced**
- Updated GitHub URL saved; `connected: true` after first valid save.

**Validation**
- URL must match `/github\.com\/[\w-]+\/[\w.-]+/`

### Backend API Required

```
GET /api/github/mine
  Header: Authorization: Bearer <token>
  Response: { url: string | null, lastUpdated: string | null, connected: boolean }

PUT /api/github
  Header: Authorization: Bearer <token>
  Body: { url: string }
  Response: { url, lastUpdated, connected }
```

### Cross-Module Links
- `AdminPipelinePage` shows `githubConnected: boolean` per group.
- `OverviewPage` shows `github_connected` as a completed pipeline stage.

---

## 6. Student Module — Milestones

### Components

| Component | File |
|-----------|------|
| `MilestonesPage` | `src/screens/student/MilestonesPage.tsx` |

### Data Flow

**Data Consumed**
- `milestones[]: Milestone` — `{ id, number, title, dueDate, status, checkInNote?, checkedInAt? }`
- Milestones grouped into 3 phases: Foundation / Build & Review / Final Delivery

**Data Produced**
- **Check-in** — sets `status: 'complete'`, stores `checkInNote` + `checkedInAt`.

**UI Computed**
- Overall progress bar (`completed / total * 100%`)
- Overdue and next-upcoming milestone highlighted at top

**Locking Rule**
- Milestones are sequential: cannot check in N+1 if N is not complete.

### Backend API Required

```
GET /api/milestones/mine
  Header: Authorization: Bearer <token>
  Response: { milestones: Milestone[] }

POST /api/milestones/:milestoneId/checkin
  Header: Authorization: Bearer <token>
  Body: { note: string }
  Response: { milestone: Milestone }
```

### Cross-Module Links
- `MentorLogBookPage` shows the same milestones in its side panel per group.
- `OverviewPage` shows upcoming deadline from the nearest incomplete milestone.
- Admin can grant extensions via `AdminControlsPage`.

---

## 7. Student Module — Log Book (Read-only)

### Components

| Component | File |
|-----------|------|
| `LogBookPage` | `src/screens/student/LogBookPage.tsx` |

### Data Flow

**Data Consumed**
- `logBookEntries[]: LogBookEntry` — written by the mentor; student view is read-only.
- Each entry: `{ id, entryNumber, date, attendance, pointsDiscussed, mentorSuggestions, remarks, editHistory? }`

**Data Produced**
- None — read-only.

### Backend API Required

```
GET /api/logbook/mine
  Header: Authorization: Bearer <token>
  Response: { entries: LogBookEntry[] }
```

### Cross-Module Links
- `MentorLogBookPage` is the write side of this same data.

---

## 8. Student Module — Overview Dashboard

### Components

| Component | File |
|-----------|------|
| `OverviewPage` (orchestrator) | `src/screens/student/OverviewPage.tsx` |
| `PipelineBoard` | `src/screens/student/overview/PipelineBoard.tsx` |
| `ActivityFeed` | `src/screens/student/overview/ActivityFeed.tsx` |

### Data Flow

**Data Consumed**
- `projectProgress`, `groupHealth`, `assignedMentor`, `nextDeadline`
- `pipelineStages[]`, `completedStages[]`
- `recentActivity[]`, `upcomingDeadlines[]`
- `currentUser`, `teamMembers[]`, `groupName`

**Data Produced**
- Navigation to other pages via deadline/button clicks (client-only).
- Pipeline drag-and-drop (cosmetic, no persistence).

### Backend API Required

```
GET /api/dashboard/student
  Header: Authorization: Bearer <token>
  Response: {
    projectProgress, groupHealth, assignedMentor, nextDeadline,
    completedPipelineStages, recentActivity, upcomingDeadlines,
    teamMembers, groupName
  }
```

> This is an aggregation endpoint: backend joins Group, Allocation, Milestone, AuditLog, Window tables.

### Cross-Module Links
- Aggregates data from all student sub-modules.

---

## 9. Mentor Module — Review Queue

### Components

| Component | File |
|-----------|------|
| `MentorReviewQueuePage` (orchestrator) | `src/screens/mentor/MentorReviewQueuePage.tsx` |
| `ReviewGroupList` | `src/screens/mentor/review/ReviewGroupList.tsx` |
| `ReviewDetail` | `src/screens/mentor/review/ReviewDetail.tsx` |

### Data Flow

**Data Consumed**
- `mentorGroups[]` — groups assigned to this mentor, each with:
  `{ id, projectId, name, status, members[], milestones[], topicVersions[], discussion[] }`
- `preselectedGroupId` prop — from `App.tsx` when navigating from Overview

**Data Produced**
- **Approve topic** — sets `topicVersions[0].status = 'approved'`
- **Request changes** — sets `status = 'changes_requested'`; stores feedback text
- **Post reply** — adds `DiscussionMessage` to discussion thread
- **Bulk approve/reject** — same actions on multiple groups at once

### Backend API Required

```
GET /api/mentor/groups
  Header: Authorization: Bearer <token>
  Response: { groups: MentorGroup[] }

GET /api/mentor/groups/:groupId/topic
  Header: Authorization: Bearer <token>
  Response: { versions: TopicVersion[], currentStatus: TopicStatus }

POST /api/mentor/groups/:groupId/topic/decision
  Header: Authorization: Bearer <token>
  Body: { decision: 'approved' | 'changes_requested', feedback?: string }
  Response: { version: TopicVersion }

POST /api/mentor/groups/:groupId/discussion
  Header: Authorization: Bearer <token>
  Body: { body: string }
  Response: { message: DiscussionMessage }

POST /api/mentor/bulk-decision
  Header: Authorization: Bearer <token>
  Body: { groupIds: string[], decision: 'approved' | 'changes_requested', feedback?: string }
  Response: { updated: number }
```

### Cross-Module Links
- `TopicStudioPage` — student-facing counterpart; same topic data.
- `MentorOverviewPage` pending count links here with `preselectedGroupId`.
- `MentorMyGroupsPage` "Review" button links here.
- After decision, `AdminPipelinePage` reflects updated `topicStatus`.

---

## 10. Mentor Module — Log Book

### Components

| Component | File |
|-----------|------|
| `MentorLogBookPage` (orchestrator) | `src/screens/mentor/MentorLogBookPage.tsx` |
| `LogBookGroupSelector` | `src/screens/mentor/logbook/LogBookGroupSelector.tsx` |
| `LogBookEntryList` + `LogBookEntryEditor` | `src/screens/mentor/logbook/LogBookEntryEditor.tsx` |
| `LogBookVersionHistory` | `src/screens/mentor/logbook/LogBookVersionHistory.tsx` |

### Data Flow

**Data Consumed**
- `mentorGroups[].logBook[]` — per-group log entries
- `mentorGroups[].milestones[]` — shown in the right-side milestone panel
- `preselectedGroupId` — from `App.tsx`

**Data Produced**
- **New session** — creates `LogBookEntry` with date, attendance, notes.
- **Edit entry** — previous content archived into `editHistory[]`.

**Edit History Rule**
- Each edit preserves the previous version with an `editedAt` timestamp.

### Backend API Required

```
GET /api/mentor/groups/:groupId/logbook
  Header: Authorization: Bearer <token>
  Response: { entries: LogBookEntry[] }

POST /api/mentor/groups/:groupId/logbook
  Header: Authorization: Bearer <token>
  Body: { date, time, attendance: [{ memberId, present }], pointsDiscussed, mentorSuggestions, remarks }
  Response: { entry: LogBookEntry }

PUT /api/mentor/groups/:groupId/logbook/:entryId
  Header: Authorization: Bearer <token>
  Body: { same fields as POST }
  Response: { entry: LogBookEntry }
  Note: Backend auto-archives previous values into editHistory.
```

### Cross-Module Links
- `LogBookPage` (student) reads the same entries — read-only.
- `LogBookVersionHistory` reads `group.milestones[]` — same data as `MilestonesPage`.
- `AdminAuditLogPage` records each log book create/edit.

---

## 11. Mentor Module — My Groups

### Components

| Component | File |
|-----------|------|
| `MentorMyGroupsPage` | `src/screens/mentor/MentorMyGroupsPage.tsx` |

### Data Flow

**Data Consumed**
- `mentorGroups[]` — group cards with name, members, status, milestone progress.

**Data Produced**
- "Review" button — navigates to `MentorReviewQueuePage` with `preselectedGroupId`.
- "Log Book" button — navigates to `MentorLogBookPage` with `preselectedGroupId`.

### Backend API Required

```
GET /api/mentor/groups
  (Same endpoint as Review Queue — reused for the card grid)
```

---

## 12. Mentor Module — Overview

### Components

| Component | File |
|-----------|------|
| `MentorOverviewPage` | `src/screens/mentor/MentorOverviewPage.tsx` |

### Data Flow

**Data Consumed**
- `mentorStats: { assignedGroups, pendingReviews, avgResponseTime, capacity }`
- `reviewWeekProgress: { reviewed, total }`
- `mentorGroups[]` — for the pending review card list

**Data Produced**
- Clicking a pending group navigates to Review Queue with `preselectedGroupId`.

### Backend API Required

```
GET /api/mentor/dashboard
  Header: Authorization: Bearer <token>
  Response: {
    stats: { assignedGroups, pendingReviews, avgResponseTime, capacity },
    weekProgress: { reviewed, total },
    groups: MentorGroup[]
  }
```

---

## 13. Mentor Module — Calendar

### Components

| Component | File |
|-----------|------|
| `MentorCalendarPage` | `src/screens/mentor/MentorCalendarPage.tsx` |

### Data Flow

**Data Consumed**
- `mentorCalendarEvents[]` — `{ day, title, type: 'review' | 'session' | 'deadline' }`
- `calendarLatestActivity[]` — recent group actions (sidebar list)

**Data Produced**
- None — read-only view.

### Backend API Required

```
GET /api/mentor/calendar?month=YYYY-MM
  Header: Authorization: Bearer <token>
  Response: { events: [{ day, title, type }], recentActivity: [{ group, action, time }] }
```

> Events are derived from: Window table (deadlines), LogBookEntry.date (sessions).

### Cross-Module Links
- Deadline events come from `AdminControlsPage` window settings.
- Session events come from `MentorLogBookPage` entry dates.

---

## 14. Admin Module — Overview

### Components

| Component | File |
|-----------|------|
| `AdminOverviewPage` | `src/screens/admin/AdminOverviewPage.tsx` |

### Data Flow

**Data Consumed**
- `adminGroups[]` — pipeline stage distribution for chart.
- `adminMentors[]` — load summary.
- Attention-needed: groups awaiting allocation or overdue.

**Data Produced**
- Navigation callbacks to `AdminPipelinePage` and `AdminAllocationPage`.

### Backend API Required

```
GET /api/admin/dashboard
  Header: Authorization: Bearer <token>
  Response: {
    stats: { totalGroups, awaitingAllocation, pendingTopics, githubConnected },
    pipelineDistribution: [{ stage, count }],
    attentionNeeded: AdminGroup[],
    mentorLoad: [{ mentorId, name, current, capacity }]
  }
```

---

## 15. Admin Module — Pipeline

### Components

| Component | File |
|-----------|------|
| `AdminPipelinePage` | `src/screens/admin/AdminPipelinePage.tsx` |

### Data Flow

**Data Consumed**
- `adminGroups[]` — all groups with full status fields.

**Data Produced**
- Search + filter (client-side).
- CSV export (client-side from filtered data).

### Backend API Required

```
GET /api/admin/groups
  Header: Authorization: Bearer <token>
  Query: ?search=&stage=&topicStatus=&elective=&page=1&limit=20
  Response: { groups: AdminGroup[], total: number }

GET /api/admin/groups/export.csv
  Header: Authorization: Bearer <token>
  Response: CSV file download
```

---

## 16. Admin Module — Allocation

### Components

| Component | File |
|-----------|------|
| `AdminAllocationPage` | `src/screens/admin/AdminAllocationPage.tsx` |

### Data Flow

**Data Consumed**
- `adminGroups[]` — unassigned groups (no `mentorId`).
- `adminMentors[]` — with `capacity` and `currentLoad`.
- `group.preferences[]` — ranked `{ mentorId, rank }` choices.
- `allocationHistory[]` — past round records.

**FCFS Algorithm (runs on backend)**
1. For each unassigned group, find its highest-ranked preference whose mentor has capacity.
2. Assign that mentor; increment their `currentLoad`.
3. If none satisfiable, mark group as `unassigned`.

**Data Produced**
- **Run Round** — `AllocationResult[]`: each group gets `{ status, matchedMentorId, matchedRank }`
- **Manual Assign** — admin override for one group.

### Backend API Required

```
POST /api/admin/allocation/run
  Header: Authorization: Bearer <token>
  Body: { round: 1 | 2 }
  Response: { results: AllocationResult[], historyEntry: AllocationHistoryEntry }

POST /api/admin/allocation/manual
  Header: Authorization: Bearer <token>
  Body: { groupId: string, mentorId: string }
  Response: { result: AllocationResult }

GET /api/admin/allocation/history
  Header: Authorization: Bearer <token>
  Response: { history: AllocationHistoryEntry[] }
```

### Cross-Module Links
- Reads preferences submitted via `MentorPreferencesPage`.
- Results update `adminGroups[].mentorId` — reflected in `AdminPipelinePage`.
- Triggers mentor-assignment notifications to students.
- `AdminControlsPage` controls when round windows are open.

---

## 17. Admin Module — Controls

### Components

| Component | File |
|-----------|------|
| `AdminControlsPage` | `src/screens/admin/AdminControlsPage.tsx` |

### Data Flow

**Data Consumed**
- `controlWindows: { registration, round1, round2 }` — each with `{ open, opensOn, closesOn }`
- `extensions[]` — past deadline extensions

**Data Produced**
- Update window dates.
- Grant a deadline extension to a specific group or all groups.

### Backend API Required

```
GET /api/admin/windows
  Header: Authorization: Bearer <token>
  Response: { windows: { registration, round1, round2 } }

PUT /api/admin/windows/:key
  Header: Authorization: Bearer <token>
  Body: { opensOn?, closesOn?, open? }
  Response: { window: Window }

POST /api/admin/extensions
  Header: Authorization: Bearer <token>
  Body: { groupId: string | 'all', offsetDays: number, reason: string }
  Response: { extension: Extension }

GET /api/admin/extensions
  Header: Authorization: Bearer <token>
  Response: { extensions: Extension[] }
```

### Cross-Module Links
- `MentorPreferencesPage` checks `round1`/`round2` windows to enable/disable submission.
- `GroupRegistrationPage` checks `registration` window.
- `AdminAllocationPage` checks round windows before running.
- `MentorCalendarPage` displays deadline events derived from window dates.

---

## 18. Admin Module — Audit Log

### Components

| Component | File |
|-----------|------|
| `AdminAuditLogPage` | `src/screens/admin/AdminAuditLogPage.tsx` |

### Data Flow

**Data Consumed**
- `auditEvents[]` — `{ id, timestamp, description, actor, group }`

**Data Produced**
- Filter (client-side search).
- CSV export.

### Backend API Required

```
GET /api/admin/audit
  Header: Authorization: Bearer <token>
  Query: ?search=&actor=&group=&page=1&limit=50
  Response: { events: AuditEvent[], total: number }

GET /api/admin/audit/export.csv
  Header: Authorization: Bearer <token>
  Response: CSV file
```

**What Triggers Audit Events (backend responsibility)**
- Group registration
- Mentor assignment (allocation or manual)
- Topic submission, approval, changes_requested
- Log book create/edit
- Milestone check-in
- Extension granted
- Window opened/closed

### Cross-Module Links
- Every mutation in every other module must write an `AuditEvent` on the backend.

---

## 19. Admin Module — Archive

### Components

| Component | File |
|-----------|------|
| `AdminArchivePage` | `src/screens/admin/AdminArchivePage.tsx` |

### Data Flow

**Data Consumed**
- `archiveEntries[]` — `{ id, year, title, group, elective, abstract, mentor, grade }`

**Data Produced**
- Search + year filter (client-side).

### Backend API Required

```
GET /api/admin/archive
  Header: Authorization: Bearer <token>
  Query: ?search=&year=&elective=
  Response: { entries: ArchiveEntry[] }

POST /api/admin/archive
  Header: Authorization: Bearer <token>
  Body: { year, title, group, elective, abstract, mentor, grade }
  Response: { entry: ArchiveEntry }
```

---

## 20. Admin Module — Mentors

### Components

| Component | File |
|-----------|------|
| `AdminMentorsPage` | `src/screens/admin/AdminMentorsPage.tsx` |

### Data Flow

**Data Consumed**
- `adminMentors[]` — `{ id, name, domain, email, capacity, currentLoad, avatarColor }`

**Data Produced**
- Add / Edit / Remove mentor records.

### Backend API Required

```
GET /api/admin/mentors
  Header: Authorization: Bearer <token>
  Response: { mentors: AdminMentor[] }

POST /api/admin/mentors
  Header: Authorization: Bearer <token>
  Body: { name, domain, email, capacity }
  Response: { mentor: AdminMentor }

PUT /api/admin/mentors/:mentorId
  Header: Authorization: Bearer <token>
  Body: { name?, domain?, email?, capacity? }
  Response: { mentor: AdminMentor }

DELETE /api/admin/mentors/:mentorId
  Header: Authorization: Bearer <token>
  Response: { success: boolean }
```

### Cross-Module Links
- `MentorPreferencesPage` reads this list for browsing and shortlisting.
- `AdminAllocationPage` uses mentor capacity from here.
- Adding a mentor must also provision their login credentials.

---

## 21. Shared Infrastructure

### Shell + Notification Bell

| Component | File | Provides |
|-----------|------|---------|
| `AppShell` | `src/components/shell/AppShell.tsx` | Sidebar, topbar, notifications, command palette, theme |
| `StudentShell` | `src/components/shell/StudentShell.tsx` | Student nav; wraps AppShell |
| `MentorShell` | `src/components/shell/MentorShell.tsx` | Mentor nav; wraps AppShell |
| `AdminShell` | `src/components/shell/AdminShell.tsx` | Admin nav; wraps AppShell |

The notification bell in `AppShell` requires:

```
GET /api/notifications
  Header: Authorization: Bearer <token>
  Response: { notifications: Notification[] }

POST /api/notifications/:id/read
  Header: Authorization: Bearer <token>
  Response: { notification: Notification }
```

### Reusable UI Library (no API calls needed)

| Component | Purpose |
|-----------|---------|
| `Card`, `CardHeader`, `CardBody` | Standard surface container |
| `Button` | Primary / secondary / danger variants |
| `Badge` | Status labels (color-coded) |
| `Avatar` | User initials circle |
| `Modal` | Generic dialog wrapper |
| `ConfirmDialog` | Confirm/cancel dialog for destructive actions |
| `PageHeader` | Standard h1 + subtitle block |
| `StatCard` | KPI card with icon, value, sublabel |
| `PageSkeleton` | Loading placeholder |
| `Toast` / `useToast` | In-app notifications |
| `EmptyState` | Empty list placeholder |

---

## 22. Data Entity Relationship Summary

```
User ─── has one ─── AuthSession (role: student | mentor | admin)
                           │
              ┌────────────┼──────────────────┐
              ▼            ▼                  ▼
           Student       Mentor            Admin
              │            │
              ▼            │
            Group ◄────────┘  (via Allocation)
              │
    ┌─────────┼────────────┬──────────────┐
    ▼         ▼            ▼              ▼
  Topic    LogBook    Milestone      GitHubLink
(versions + (entries +  (4 per group)
 discussion) editHistory)

Admin manages Mentor
Admin controls Window (registration, round1, round2)
Admin runs AllocationRound → Allocation (Group <-> Mentor)
Admin grants Extension (Group <-> Milestone deadline)
Admin reads AuditEvent (all mutations logged)
Admin manages Archive (past-year projects)
```

---

## 23. Backend Development Priority Order

Build and test in this order to respect data dependencies:

| Priority | Module | Reason |
|----------|--------|--------|
| 1 | **Auth** | Required by everything |
| 2 | **Admin — Mentors** | Mentors must exist before groups reference them |
| 3 | **Admin — Controls (Windows)** | Registration window must be open for students |
| 4 | **Student — Group Registration** | Groups must exist before preferences/topics |
| 5 | **Student — Mentor Preferences** | Needed before allocation can run |
| 6 | **Admin — Allocation** | Depends on groups + preferences |
| 7 | **Student — Topic Studio** | Depends on mentor assignment |
| 8 | **Mentor — Review Queue** | Depends on topic submissions |
| 9 | **Student — Milestones** | Depends on topic approval |
| 10 | **Mentor — Log Book** | Depends on assigned groups |
| 11 | **Student — GitHub Tracker** | Independent; any time after group creation |
| 12 | **Notifications** | Cross-cutting; add after core flows work |
| 13 | **Audit Log** | Cross-cutting; add alongside each module |
| 14 | **Admin — Pipeline / Archive** | Read aggregations; build last |
| 15 | **Dashboard (Overview pages)** | Aggregation endpoints; build last |
