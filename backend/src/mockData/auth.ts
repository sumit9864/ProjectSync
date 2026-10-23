/**
 * mockData/auth.ts
 * ─────────────────
 * Hardcoded demo users. Migrated from src/data/demoUsers.ts.
 * In Phase 3 this file is deleted; users are looked up from the DB.
 */

export interface DemoUser {
  id:       string;
  name:     string;
  email:    string;
  password: string;  // plaintext for mock only — bcrypt in Phase 3
  role:     'student' | 'mentor' | 'admin';
}

export const demoUsers: DemoUser[] = [
  {
    id:       'user-student-1',
    name:     'Aarav Sharma',
    email:    'student@university.edu',
    password: 'password',
    role:     'student',
  },
  {
    id:       'user-mentor-1',
    name:     'Dr. Eliza Mathews',
    email:    'mentor@university.edu',
    password: 'password',
    role:     'mentor',
  },
  {
    id:       'user-admin-1',
    name:     'Dr. Priya Krishnan',
    email:    'admin@university.edu',
    password: 'password',
    role:     'admin',
  },
];
