import { useEffect, useState } from 'react';
import {
  TrendingUp,
  CalendarClock,
  UserCheck,
  Heart,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
  ListChecks,
  Users,
  Bell,
  Lightbulb,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton } from '@/components/ui';
import type { StudentPageId as PageId } from '@/components/StudentShell';
import {
  projectProgress,
  groupHealth,
  assignedMentor,
  nextDeadline,
  pipelineStages,
  completedStages,
  recentActivity,
  upcomingDeadlines,
  currentUser,
  teamMembers,
  groupName,
} from '@/data/mockData';
import { Avatar } from '@/components/ui';

const activityIcons: Record<string, typeof CheckCircle2> = {
  'user-check': UserCheck,
  edit: Edit3,
  list: ListChecks,
  'check-circle': CheckCircle2,
  users: Users,
};

export function OverviewPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <OverviewSkeleton />;

  const nextUpStage = completedStages.length;
  const nextUp = pipelineStages[nextUpStage] ?? pipelineStages[pipelineStages.length - 1];

  const nextUpMessages: Record<string, { message: string; page: PageId; cta: string }> = {
    registered: {
      message: 'Your group is registered. Now rank your preferred mentors for Round 1.',
      page: 'preferences',
      cta: 'Choose mentors',
    },
    mentor_assigned: {
      message: 'Your mentor has been assigned. Shape your project topic for approval.',
      page: 'topic',
      cta: 'Open Topic Studio',
    },
    topic_approved: {
      message: 'Your topic is approved. Connect your GitHub repository to proceed.',
      page: 'github',
      cta: 'Connect GitHub',
    },
    github_connected: {
      message: 'You are all set. Track your milestones and keep your log book updated.',
      page: 'milestones',
      cta: 'View milestones',
    },
  };

  const nextUpInfo = nextUpMessages[nextUp.key] ?? nextUpMessages.registered;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Welcome back, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Here is a snapshot of where your final-year project stands.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Project Progress"
          value={`${projectProgress}%`}
          sublabel="On track"
          accent="brand"
        />
        <StatCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Next Deadline"
          value={nextDeadline.date}
          sublabel={`${nextDeadline.daysLeft} days left`}
          accent="amber"
        />
        <StatCard
          icon={<UserCheck className="h-5 w-5" />}
          label="Assigned Mentor"
          value={assignedMentor.name}
          sublabel={assignedMentor.domain}
          accent="sky"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Group Health"
          value={groupHealth}
          sublabel="3 of 3 members active"
          accent="emerald"
        />
      </div>

      {/* Next Up Callout */}
      <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 to-white">
        <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge color="brand">Next up</Badge>
                <span className="text-xs text-ink-400">Stage {nextUpStage + 1} of 4</span>
              </div>
              <p className="mt-2 text-base font-medium text-ink-800">{nextUpInfo.message}</p>
            </div>
          </div>
          <Button onClick={() => onNavigate(nextUpInfo.page)} className="shrink-0">
            {nextUpInfo.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardBody>
      </Card>

      {/* Pipeline tracker */}
      <Card>
        <CardHeader title="Project Pipeline" subtitle="Track your progress through each stage" />
        <CardBody>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {pipelineStages.map((stage, idx) => {
              const done = completedStages.includes(stage.key);
              const isCurrent = !done && idx === completedStages.length;
              return (
                <div key={stage.key} className="flex items-center sm:flex-1">
                  <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors sm:flex-1 ${done ? 'bg-brand-50' : isCurrent ? 'bg-amber-50' : 'bg-ink-50'}`}>
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-brand-600" />
                    ) : isCurrent ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-ink-300" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${done ? 'text-brand-700' : isCurrent ? 'text-amber-700' : 'text-ink-400'}`}>
                        {stage.label}
                      </p>
                      <p className="text-xs text-ink-400">
                        {done ? 'Complete' : isCurrent ? 'In progress' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  {idx < pipelineStages.length - 1 && (
                    <div className={`hidden sm:block h-px flex-1 mx-1 ${done ? 'bg-brand-300' : 'bg-ink-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Activity + Deadlines */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Activity" subtitle="What has been happening in your project" />
          <CardBody className="p-0">
            <div className="divide-y divide-ink-50">
              {recentActivity.map((item) => {
                const Icon = activityIcons[item.icon] ?? Bell;
                return (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-700">
                        <span className="font-medium text-ink-900">{item.actor}</span> {item.action}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Upcoming Deadlines" subtitle="Don't miss these dates" />
          <CardBody className="p-0">
            <div className="divide-y divide-ink-50">
              {upcomingDeadlines.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onNavigate(d.page as PageId)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-ink-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-800">{d.title}</p>
                      <p className="text-xs text-ink-400">{d.date}</p>
                    </div>
                  </div>
                  <Badge color={d.daysLeft <= 7 ? 'warning' : 'neutral'}>
                    {d.daysLeft}d left
                  </Badge>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Team Roster + Account */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Team Roster" subtitle={`Members of "${groupName}"`} />
          <CardBody className="p-0">
            <div className="divide-y divide-ink-50">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={m.name} color="bg-brand-600" size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">
                      {m.name}
                      {m.email === currentUser.email && (
                        <span className="ml-2 text-xs font-normal text-brand-600">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-ink-400">{m.email}</p>
                  </div>
                  <Badge color="neutral">{m.rollNumber}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Account" subtitle="Your profile information" />
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar name={currentUser.name} color={currentUser.avatarColor} size="lg" />
              <div>
                <p className="font-display text-lg font-bold text-ink-900">{currentUser.name}</p>
                <p className="text-sm text-ink-500">{currentUser.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 rounded-xl bg-ink-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">Role</span>
                <Badge color="brand">{currentUser.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">Roll Number</span>
                <span className="text-sm font-medium text-ink-700">{currentUser.rollNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">Elective</span>
                <span className="text-sm font-medium text-ink-700 text-right">
                  {currentUser.elective}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  accent: 'brand' | 'amber' | 'sky' | 'emerald';
}) {
  const accents: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card className="transition-shadow hover:shadow-cardhover">
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accents[accent]}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-400">{label}</p>
            <p className="mt-0.5 truncate font-display text-lg font-bold text-ink-900">{value}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400">{sublabel}</p>
      </CardBody>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardBody>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-5 w-24" />
                </div>
              </div>
              <Skeleton className="mt-3 h-3 w-28" />
            </CardBody>
          </Card>
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
