/**
 * MOCK DATA — Demo Users
 * ----------------------------
 * This file contains static demo users for testing.
 * When the backend is ready, these will be replaced by real auth logic.
 */
import type { AuthRole } from '@/types';

export type DemoUser = {
  email: string;
  password: string;
  name: string;
  role: AuthRole;
};

export const demoUsers: DemoUser[] = [
  {
    email: 'admin@university.edu',
    password: 'password',
    name: 'Dr. Priya Krishnan',
    role: 'admin',
  },
  {
    email: 'mentor@university.edu',
    password: 'password',
    name: 'Dr. Eliza Mathews',
    role: 'mentor',
  },
  {
    email: 'student@university.edu',
    password: 'password',
    name: 'Aarav Sharma',
    role: 'student',
  },
];
