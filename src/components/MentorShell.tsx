import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { AppShell, type NavItem } from '@/components/AppShell';
import { mentorUser, mentorNotifications } from '@/data/mentorData';
import type { ThemeMode } from '@/hooks/useTheme';

export type MentorPageId =
  | 'overview'
  | 'review'
  | 'groups'
  | 'logbook'
  | 'calendar';

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'review', label: 'Review Queue', icon: ClipboardCheck },
  { id: 'groups', label: 'My Groups', icon: Users },
  { id: 'logbook', label: 'Log Book', icon: BookOpen },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

type MentorShellProps = {
  currentPage: MentorPageId;
  onNavigate: (page: MentorPageId) => void;
  onExit: () => void;
  children: ReactNode;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

export function MentorShell({ currentPage, onNavigate, onExit, children, theme, onToggleTheme }: MentorShellProps) {
  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={(page) => onNavigate(page as MentorPageId)}
      onExit={onExit}
      navItems={navItems}
      user={mentorUser}
      notifications={mentorNotifications}
      workspaceLabel="Mentor Workspace"
      sidebarFooterText="Stay on top of your reviews and mentoring sessions."
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      {children}
    </AppShell>
  );
}
