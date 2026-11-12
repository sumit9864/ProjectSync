/**
 * db.ts — Persistent JSON file database
 * ──────────────────────────────────────
 * Single source of truth for ALL mock data.
 * Reads from / writes to `backend/data/db.json` so data survives hot-reloads.
 *
 * Usage:
 *   import { db, saveDb } from '../lib/db';
 *   db.groups.push(newGroup);
 *   saveDb();
 *
 * Reset:
 *   import { resetDb } from '../lib/db';
 *   resetDb(); // wipes back to factory defaults
 */

import fs   from 'fs';
import path from 'path';
import { getDefaults } from './db-defaults';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DbUser {
  id:       string;
  name:     string;
  email:    string;
  password: string;   // plaintext for Phase 2; bcrypt in Phase 3
  role:     'student' | 'mentor' | 'admin';
}

export interface DbMentor {
  id:          string;
  userId:      string;   // links to DbUser.id
  name:        string;
  email:       string;
  domain:      string;
  focus:       string;
  capacity:    number;
  currentLoad: number;
  bio:         string;
  pastProjects: string[];
  avatarColor:  string;
}

export interface DbGroupMember {
  id:         string;
  name:       string;
  rollNumber: string;
  email:      string;
  elective:   string;
}

export interface DbGroup {
  id:            string;
  projectId:     string;
  name:          string;
  leaderCrn:     string;
  electiveTwo:   string;
  electiveThree: string;
  members:       DbGroupMember[];
  mentorId:      string | null;
  registeredAt:  string;
  stage:         'registered' | 'mentor_assigned' | 'topic_approved' | 'github_connected';
  ownerUserId:   string;
}

export interface DbShortlistEntry   { mentorId: string; rank: number; }
export interface DbShortlistSubmission {
  round:       1 | 2;
  entries:     DbShortlistEntry[];
  submittedAt: string;
}

export interface DbTopicDraft {
  workingTitle:       string;
  existingWork:       string;
  problemIdentified:  string;
  proposedDifference: string;
  innovation:         string;
  feasibility:        string;
}
export interface DbTopicVersion {
  version:     number;
  submittedAt: string;
  status:      'pending' | 'approved' | 'changes_requested';
  feedback?:   string;
  fields:      DbTopicDraft;
}
export interface DbDiscussionMessage {
  id:          string;
  author:      string;
  role:        string;
  avatarColor: string;
  body:        string;
  time:        string;
}
export interface DbTopicData {
  draft:         DbTopicDraft;
  versions:      DbTopicVersion[];
  currentStatus: 'pending' | 'approved' | 'changes_requested' | null;
  discussion:    DbDiscussionMessage[];
}

export interface DbGitHubData {
  url:         string | null;
  lastUpdated: string | null;
  connected:   boolean;
}

export interface DbMilestone {
  id:           string;
  number:       number;
  title:        string;
  dueDate:      string;
  status:       'complete' | 'incomplete';
  checkInNote?: string;
  checkedInAt?: string;
}

export interface DbLogBookAttendee { name: string; present: boolean; }
export interface DbLogBookHistoryEntry {
  editedAt:          string;
  pointsDiscussed:   string;
  mentorSuggestions: string;
  remarks:           string;
}
export interface DbLogBookEntry {
  id:                string;
  entryNumber:       number;
  date:              string;
  lastEditedAt:      string;
  attendance:        DbLogBookAttendee[];
  pointsDiscussed:   string;
  mentorSuggestions: string;
  remarks:           string;
  editHistory?:      DbLogBookHistoryEntry[];
}

export interface DbNotification {
  id:    string;
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
  type:  'info' | 'success' | 'warning';
}

export interface DbAllocationResult {
  groupId:          string;
  groupName:        string;
  status:           'assigned' | 'unassigned';
  matchedMentorId?: string;
  matchedRank?:     number;
}
export interface DbAllocationHistoryEntry {
  id:              string;
  round:           1 | 2;
  ranAt:           string;
  results:         DbAllocationResult[];
  assignedCount:   number;
  unassignedCount: number;
}

export interface DbExtension {
  id:         string;
  groupId:    string | 'all';
  groupName:  string;
  offsetDays: number;
  reason:     string;
  grantedAt:  string;
  grantedBy:  string;
}

export interface DbControlWindow {
  open:     boolean;
  opensOn:  string;
  closesOn: string;
}

export interface DbAuditEvent {
  id:          string;
  timestamp:   string;
  description: string;
  actor:       string;
  group:       string;
}

export interface DbArchiveEntry {
  id:       string;
  year:     string;
  title:    string;
  group:    string;
  elective: string;
  abstract: string;
  mentor:   string;
  grade:    string;
}

export interface DbSchema {
  users:         DbUser[];
  mentors:       DbMentor[];
  groups:        DbGroup[];
  preferences:   Record<string, DbShortlistSubmission>;  // key: `${groupId}-${round}`
  topics:        Record<string, DbTopicData>;             // key: groupId
  github:        Record<string, DbGitHubData>;            // key: groupId
  milestones:    Record<string, DbMilestone[]>;           // key: groupId
  logbook:       Record<string, DbLogBookEntry[]>;        // key: groupId
  notifications: Record<string, DbNotification[]>;        // key: userId
  allocation:    DbAllocationHistoryEntry[];
  extensions:    DbExtension[];
  auditEvents:   DbAuditEvent[];
  archiveEntries: DbArchiveEntry[];
  windows: {
    registration: DbControlWindow;
    round1:       DbControlWindow;
    round2:       DbControlWindow;
  };
}

// ── File path ──────────────────────────────────────────────────────────────────
// Stored at backend/data/db.json — outside src/ so it isn't watched by tsx
const DATA_DIR  = path.join(__dirname, '..', '..', 'data');
const DB_FILE   = path.join(DATA_DIR, 'db.json');

// ── Bootstrap ──────────────────────────────────────────────────────────────────
function loadOrInit(): DbSchema {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const defaults = getDefaults();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DbSchema;
  } catch {
    console.warn('[db] db.json corrupted — resetting to defaults');
    const defaults = getDefaults();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  }
}

/** The live in-memory database. Mutate this object freely, then call saveDb(). */
export const db: DbSchema = loadOrInit();

/** Flush the in-memory database to disk. Call after every mutation. */
export function saveDb(): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

/**
 * Reset the entire database to factory defaults and flush to disk.
 * Called by the developer reset endpoint / script.
 */
export function resetDb(): void {
  const defaults = getDefaults();
  (Object.keys(defaults) as (keyof DbSchema)[]).forEach((key) => {
    (db as unknown as Record<string, unknown>)[key] = (defaults as unknown as Record<string, unknown>)[key];
  });
  saveDb();
  console.log('[db] Database reset to factory defaults.');
}
