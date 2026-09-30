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
import { AppShell, type NavItem } from '@/components/AppShell';
import { adminUser, adminNotifications } from '@/data/adminData';

export type AdminPageId =
  | 'overview'
  | 'pipeline'
  | 'allocation'
  | 'controls'
  | 'audit'
  | 'archive'
  | 'mentors';

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'allocation', label: 'Allocation', icon: Users },
  { id: 'controls', label: 'Controls', icon: Settings },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'mentors', label: 'Mentors', icon: UserPlus },
];

type AdminShellProps = {
  currentPage: AdminPageId;
  onNavigate: (page: AdminPageId) => void;
  onExit: () => void;
  children: ReactNode;
};

export function AdminShell({ currentPage, onNavigate, onExit, children }: AdminShellProps) {
  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={(page) => onNavigate(page as AdminPageId)}
      onExit={onExit}
      navItems={navItems}
      user={adminUser}
      notifications={adminNotifications}
      workspaceLabel="Admin Workspace"
      sidebarFooterText="Program-wide oversight for final-year projects."
    >
      {children}
    </AppShell>
  );
}
