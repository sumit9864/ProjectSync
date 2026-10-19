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
    email: 'coordinator@projectsync.edu',
    password: 'Coordinator@123',
    name: 'Project Coordinator',
    role: 'admin',
  },
  {
    email: 'guide@projectsync.edu',
    password: 'Guide@123',
    name: 'Project Guide',
    role: 'mentor',
  },
  {
    email: 'leader@projectsync.edu',
    password: 'Leader@123',
    name: 'Team Leader',
    role: 'student',
  },
];
