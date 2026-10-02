import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Lightbulb,
  Github,
  Target,
  BookOpen,
} from 'lucide-react';
import { AppShell, type NavItem } from '@/components/AppShell';
import { currentUser, notifications } from '@/data/mockData';
import type { ThemeMode } from '@/hooks/useTheme';

export type StudentPageId =
  | 'overview'
  | 'group'
  | 'preferences'
  | 'topic'
  | 'github'
  | 'milestones'
  | 'logbook';

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'group', label: 'Group Registration', icon: Users },
  { id: 'preferences', label: 'Mentor Preferences', icon: UserCheck },
  { id: 'topic', label: 'Topic Studio', icon: Lightbulb },
  { id: 'github', label: 'GitHub Tracker', icon: Github },
  { id: 'milestones', label: 'Milestones', icon: Target },
  { id: 'logbook', label: 'Log Book', icon: BookOpen },
];

type StudentShellProps = {
  currentPage: StudentPageId;
  onNavigate: (page: StudentPageId) => void;
  onExit: () => void;
  children: ReactNode;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

export function StudentShell({ currentPage, onNavigate, onExit, children, theme, onToggleTheme }: StudentShellProps) {
  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={(page) => onNavigate(page as StudentPageId)}
      onExit={onExit}
      navItems={navItems}
      user={currentUser}
      notifications={notifications}
      workspaceLabel="Student Workspace"
      sidebarFooterText="Need help? Check the Log Book or contact your mentor."
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      {children}
    </AppShell>
  );
}
