import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Activity } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge, Skeleton, EmptyState } from '@/components/ui';
import { mentorCalendarEvents, calendarLatestActivity } from '@/data/mentorData';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const eventTypeConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  review: { label: 'Review', color: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/60', dot: 'bg-amber-400' },
  session: { label: 'Session', color: 'text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/60', dot: 'bg-sky-400' },
  deadline: { label: 'Deadline', color: 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/60', dot: 'bg-rose-400' },
};

export function MentorCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 rounded-md" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const eventsByDay = new Map<number, typeof mentorCalendarEvents>();
  mentorCalendarEvents.forEach((e) => {
    const existing = eventsByDay.get(e.day) ?? [];
    existing.push(e);
    eventsByDay.set(e.day, [...existing, e]);
  });

  const today = 27; // Mock "today" is Sep 27
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Calendar</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Upcoming deadlines, review sessions, and mentoring meetings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={`${monthNames[month]} ${year}`}
              subtitle="Scheduled events and deadlines"
              action={
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              }
            />
            <CardBody>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="pb-2 text-center text-xs font-semibold uppercase text-ink-400 dark:text-ink-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, idx) => {
                  if (day === null) {
                    return <div key={idx} className="min-h-[72px] rounded-lg" />;
                  }
                  const dayEvents = eventsByDay.get(day) ?? [];
                  const isToday = day === today;
                  return (
                    <div
                      key={idx}
                      className={`min-h-[72px] rounded-lg border p-1.5 transition-colors ${
                        isToday
                          ? 'border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/30'
                          : 'border-ink-100 hover:border-ink-200 dark:border-ink-800 dark:hover:border-ink-700'
                      }`}
                    >
                      <div
                        className={`mb-1 text-xs font-semibold ${
                          isToday ? 'text-brand-600 dark:text-brand-400' : 'text-ink-500 dark:text-ink-400'
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((e, i) => {
                          const config = eventTypeConfig[e.type];
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium ${config.color}`}
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
                              <span className="truncate">{e.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <p className="text-[10px] text-ink-400 dark:text-ink-500">
                            +{dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-3 dark:border-ink-800">
                {Object.entries(eventTypeConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                    <span className="text-xs text-ink-500 dark:text-ink-400">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Latest activity side panel */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-0">
            <CardHeader title="Latest Activity" subtitle="Across all your groups" />
            <CardBody className="p-0">
              {calendarLatestActivity.length === 0 ? (
                <EmptyState
                  icon={<Activity className="h-7 w-7" />}
                  title="No recent activity"
                  message="Activity from your groups will appear here."
                />
              ) : (
                <div className="divide-y divide-ink-50 dark:divide-ink-800">
                  {calendarLatestActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-700 dark:text-ink-300">
                          <span className="font-semibold text-ink-900 dark:text-ink-100">{item.group}</span>{' '}
                          {item.action}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Upcoming events list */}
          <Card className="mt-4">
            <CardHeader title="Upcoming Events" subtitle="Next 30 days" />
            <CardBody className="p-0">
              <div className="divide-y divide-ink-50">
                {mentorCalendarEvents.slice(0, 5).map((e, i) => {
                  const config = eventTypeConfig[e.type];
                  return (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-700 truncate dark:text-ink-300">
                          {e.title}
                        </p>
                        <p className="text-xs text-ink-400 dark:text-ink-500">
                          {monthNames[month]} {e.day}, {year}
                        </p>
                      </div>
                      <Badge
                        color={
                          e.type === 'deadline' ? 'error' : e.type === 'session' ? 'info' : 'warning'
                        }
                      >
                        {config.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
