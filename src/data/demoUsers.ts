export type AuthRole = 'student' | 'mentor' | 'admin';

export type DemoUser = {
  email: string;
  password: string;
  name: string;
  role: AuthRole;
};

export const demoUsers: DemoUser[] = [
  {
    email: 'aarav.sharma@university.edu',
    password: 'Student@123',
    name: 'Aarav Sharma',
    role: 'student',
  },
  {
    email: 'eliza.mathews@university.edu',
    password: 'Mentor@123',
    name: 'Dr. Eliza Mathews',
    role: 'mentor',
  },
  {
    email: 'priya.krishnan@university.edu',
    password: 'Admin@123',
    name: 'Dr. Priya Krishnan',
    role: 'admin',
  },
];
