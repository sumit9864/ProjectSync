export type AuthRole = 'student' | 'mentor' | 'admin';

export type AuthSession = {
  email: string;
  name: string;
  role: AuthRole;
};
