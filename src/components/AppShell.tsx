import { type ReactNode, useState, useEffect, useRef } from 'react';
import { Target, Bell, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui';
import type { Notification } from '@/types';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AppShellUser = {
  name: string;
  email: string;
  role: string;
  avatarColor: string;
};

type AppShellProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  onExit: () => void;
  children: ReactNode;
  navItems: NavItem[];
  user: AppShellUser;
  notifications: Notification[];
  workspaceLabel: string;
  sidebarFooterText: string;
};

export function AppShell({
  currentPage,
  onNavigate,
  onExit,
  children,
  navItems,
  user,
  notifications: initialNotifications,
  workspaceLabel,
  sidebarFooterText,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileNavOpen(false);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-200/70 bg-white">
        <SidebarContent
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onExit={onExit}
          navItems={navItems}
          workspaceLabel={workspaceLabel}
          sidebarFooterText={sidebarFooterText}
        />
      </aside>

      {/* Sidebar - Mobile */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex w-64 flex-col bg-white animate-slide-in">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-3 text-ink-400 hover:text-ink-600"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onExit={onExit}
              navItems={navItems}
              workspaceLabel={workspaceLabel}
              sidebarFooterText={sidebarFooterText}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-ink-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden text-ink-600 hover:text-ink-900"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-ink-400">Final Year Project Management</p>
              <p className="text-sm font-display font-semibold text-ink-800">
                {navItems.find((n) => n.id === currentPage)?.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-ink-200 bg-white shadow-xl animate-scale-in">
                  <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                    <h4 className="font-display font-semibold text-ink-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-ink-400">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`flex w-full gap-3 border-b border-ink-50 px-4 py-3 text-left transition-colors hover:bg-ink-50 ${
                            !n.read ? 'bg-brand-50/40' : ''
                          }`}
                        >
                          <div
                            className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                              n.read ? 'bg-transparent' : 'bg-brand-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-800">{n.title}</p>
                            <p className="mt-0.5 text-xs text-ink-500 line-clamp-2">{n.body}</p>
                            <p className="mt-1 text-xs text-ink-400">{n.time}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-ink-100 transition-colors"
              >
                <Avatar name={user.name} color={user.avatarColor} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-ink-800">{user.name}</p>
                  <p className="text-xs text-ink-400">{user.role}</p>
                </div>
                <ChevronRight className="hidden sm:block h-4 w-4 rotate-90 text-ink-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-ink-200 bg-white shadow-xl animate-scale-in">
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{user.email}</p>
                    <p className="mt-1 text-xs font-medium text-brand-600">{user.role}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={onExit}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPage,
  onNavigate,
  onExit,
  navItems,
  workspaceLabel,
  sidebarFooterText,
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
  onExit: () => void;
  navItems: NavItem[];
  workspaceLabel: string;
  sidebarFooterText: string;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-ink-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-ink-900">FYPM Hub</p>
          <p className="text-xs text-ink-400">{workspaceLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-ink-400'}`} />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4 text-brand-500" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <div className="rounded-lg bg-ink-50 p-3">
          <p className="text-xs font-medium text-ink-500">{sidebarFooterText}</p>
        </div>
        <button
          onClick={onExit}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-700 transition-colors"
        >
          <LogOut className="h-5 w-5 text-ink-400" />
          Sign out
        </button>
      </div>
    </>
  );
}
