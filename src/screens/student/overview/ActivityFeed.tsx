import { Badge, Button, Card, CardBody } from '@/components/ui/ui';
import { ArrowRight, Bell, CalendarClock } from 'lucide-react';
import type { StudentPageId as PageId } from '@/components/shell/StudentShell';

type ActivityItem = {
  id: string;
  icon: string;
  actor: string;
  action: string;
  time: string;
};

type DeadlineItem = {
  id: string;
  title: string;
  date: string;
  daysLeft: number;
  page: string;
};

type ActivityFeedProps = {
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
  activityIcons: Record<string, React.ElementType>;
  onNavigate: (page: PageId) => void;
};

/**
 * Two-column card row: Recent Activity feed (left) + Upcoming Deadlines list (right).
 */
export function ActivityFeed({
  recentActivity,
  upcomingDeadlines,
  activityIcons,
  onNavigate,
}: ActivityFeedProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Recent activity */}
      <Card className="motion-lift">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-50 dark:border-ink-800">
          <div>
            <p className="font-display font-semibold text-ink-900 dark:text-ink-100">
              Recent Activity
            </p>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
              What has been happening in your project
            </p>
          </div>
        </div>
        <CardBody className="p-0">
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            {recentActivity.map((item) => {
              const Icon = activityIcons[item.icon] ?? Bell;
              return (
                <div key={item.id} className="activity-row flex items-start gap-3 px-5 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-700 dark:text-ink-300">
                      <span className="font-medium text-ink-900 dark:text-ink-100">
                        {item.actor}
                      </span>{' '}
                      {item.action}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Upcoming deadlines */}
      <Card className="motion-lift">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-50 dark:border-ink-800">
          <div>
            <p className="font-display font-semibold text-ink-900 dark:text-ink-100">
              Upcoming Deadlines
            </p>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">Don't miss these dates</p>
          </div>
        </div>
        <CardBody className="p-0">
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            {upcomingDeadlines.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-label={`Open ${d.title}, due ${d.date}`}
                onClick={() => onNavigate(d.page as PageId)}
                className="deadline-row focus-ring flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{d.title}</p>
                    <p className="text-xs text-ink-400 dark:text-ink-500">{d.date}</p>
                  </div>
                </div>
                <Badge color={d.daysLeft <= 7 ? 'warning' : 'neutral'}>{d.daysLeft}d left</Badge>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
