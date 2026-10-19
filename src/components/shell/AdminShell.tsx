import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Settings,
  ScrollText,
  Archive,
  UserPlus,
} from 'lucide-react';
import { AppShell, type NavItem, type AppShellUser } from '@/components/shell/AppShell';
import type { ThemeMode } from '@/hooks/useTheme';
import type { Notification } from '@/types';

export type AdminPageId =
  'overview' | 'pipeline' | 'allocation' | 'controls' | 'audit' | 'archive' | 'mentors';

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'controls', label: 'Controls', icon: Settings },
  { id: 'allocation', label: 'Results', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
  { id: 'archive', label: 'Project List', icon: Archive },
  { id: 'mentors', label: 'Mentors', icon: UserPlus },
];

type AdminShellProps = {
  currentPage: AdminPageId;
  onNavigate: (page: AdminPageId) => void;
  onExit: () => void;
  children: ReactNode;
  theme: ThemeMode;
  onToggleTheme: () => void;
  user: AppShellUser;
  notifications: Notification[];
};

export function AdminShell({
  currentPage,
  onNavigate,
  onExit,
  children,
  theme,
  onToggleTheme,
  user,
  notifications,
}: AdminShellProps) {
  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={(page) => onNavigate(page as AdminPageId)}
      onExit={onExit}
      navItems={navItems}
      user={user}
      notifications={notifications}
      workspaceLabel="Admin Workspace"
      sidebarFooterText="Program-wide oversight for final-year projects."
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      {children}
    </AppShell>
  );
}
