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
  Activity,
  ChevronDown,
  Filter,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, AnimatedNumber } from '@/components/ui';
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
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'at-risk' | 'week'>('all');
  const [draggedStage, setDraggedStage] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);

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
    <div className="dashboard-canvas motion-stagger flex flex-col gap-6">
      {/* Greeting */}
      <header className="dashboard-heading">
        <p className="section-kicker">Project command centre</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100 sm:text-3xl">
          Welcome back, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500 dark:text-ink-400">
          Here is a snapshot of where your final-year project stands and what deserves your attention next.
        </p>
      </header>

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="surface-glow">
          <CardHeader
            title="Project health"
            subtitle="A quick read on momentum, risk, and team capacity"
            action={<Badge color="success"><ShieldCheck className="h-3.5 w-3.5" /> On track</Badge>}
          />
          <CardBody>
            <div className="grid gap-5 sm:grid-cols-3">
              <HealthMetric label="Completion" value={projectProgress} suffix="%" tone="brand" />
              <HealthMetric label="Team activity" value={86} suffix="%" tone="emerald" />
              <HealthMetric label="Open blockers" value={1} suffix="" tone="amber" />
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50/70 px-3 py-2.5 text-sm text-brand-800 dark:bg-brand-950/30 dark:text-brand-200">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Momentum is strong. Keep the log book updated before your next review.</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Next best action" subtitle="Keep your project moving" />
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="next-action-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"><Activity className="h-5 w-5" /></div>
              <div>
                <p className="font-medium text-ink-900 dark:text-ink-100">Prepare your next review</p>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Review milestones and add one update to your activity log.</p>
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => onNavigate('milestones')}>Open milestones <ArrowRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <section className="flex flex-wrap items-end justify-between gap-3" aria-labelledby="workspace-heading">
        <div>
          <p className="section-kicker">Daily focus</p>
          <h2 id="workspace-heading" className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100">Your workspace</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">Filter your view by what needs attention.</p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Dashboard filters">
          <Filter className="h-4 w-4 text-ink-400" />
          {(['all', 'at-risk', 'week'] as const).map((filter) => (
            <button key={filter} type="button" onClick={() => setActiveFilter(filter)} aria-pressed={activeFilter === filter} className={`filter-chip focus-ring rounded-lg px-3 py-1.5 text-xs font-medium ${activeFilter === filter ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800'}`}>
              {filter === 'all' ? 'All work' : filter === 'at-risk' ? 'At risk' : 'Due this week'}
            </button>
          ))}
        </div>
      </section>

      {/* Next Up Callout */}
      <Card className="motion-lift overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 to-white dark:border-brand-800/60 dark:from-brand-950/40 dark:to-ink-900">
        <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge color="brand">Next up</Badge>
                <span className="text-xs text-ink-400 dark:text-ink-500">Stage {nextUpStage + 1} of 4</span>
              </div>
              <p className="mt-2 text-base font-medium text-ink-800 dark:text-ink-100">{nextUpInfo.message}</p>
            </div>
          </div>
          <Button onClick={() => onNavigate(nextUpInfo.page)} className="shrink-0">
            {nextUpInfo.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardBody>
      </Card>

      {/* Pipeline tracker */}
      <Card className="pipeline-card">
        <CardHeader title="Project Pipeline" subtitle="Track your progress through each stage" />
        <CardBody>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {pipelineStages.map((stage, idx) => {
              const done = completedStages.includes(stage.key);
              const isCurrent = !done && idx === completedStages.length;
              return (
                <div key={stage.key} className="flex items-center sm:flex-1">
                  <button
                    type="button"
                    draggable
                    aria-label={`Open details for ${stage.label}. Drag to reorder the pipeline.`}
                    aria-pressed={selectedStage === stage.key}
                    onClick={() => setSelectedStage(selectedStage === stage.key ? null : stage.key)}
                    onDragStart={() => setDraggedStage(stage.key)}
                    onDragOver={(event) => { event.preventDefault(); setDropStage(stage.key); }}
                    onDragLeave={() => setDropStage(null)}
                    onDrop={(event) => { event.preventDefault(); setDropStage(null); setDraggedStage(null); setSelectedStage(stage.key); }}
                    onDragEnd={() => { setDraggedStage(null); setDropStage(null); }}
                    className={`focus-ring pipeline-stage flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left sm:flex-1 ${isCurrent ? 'pipeline-stage--current' : ''} ${dropStage === stage.key && draggedStage !== stage.key ? 'drop-target' : ''} ${done ? 'bg-brand-50 dark:bg-brand-950/40' : isCurrent ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-ink-50 dark:bg-ink-800/50'}`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    ) : isCurrent ? (
                      <Clock className="pipeline-icon--current h-5 w-5 text-amber-500 dark:text-amber-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-ink-300 dark:text-ink-600" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${done ? 'text-brand-700 dark:text-brand-300' : isCurrent ? 'text-amber-700 dark:text-amber-400' : 'text-ink-400 dark:text-ink-500'}`}>
                        {stage.label}
                      </p>
                      <p className="text-xs text-ink-400 dark:text-ink-500">
                        {done ? 'Complete' : isCurrent ? 'In progress' : 'Pending'}
                      </p>
                      <span className="sr-only">Status is {done ? 'complete' : isCurrent ? 'in progress' : 'pending'}. Press Enter to open details.</span>
                    </div>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 shrink-0 transition-transform sm:hidden ${selectedStage === stage.key ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {idx < pipelineStages.length - 1 && (
                    <div className={`pipeline-connector ${isCurrent || (done && idx + 1 === completedStages.length) ? 'pipeline-connector--active' : ''} mx-1 hidden h-px flex-1 sm:block ${done ? 'bg-brand-300 dark:bg-brand-800' : 'bg-ink-200 dark:bg-ink-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
          {selectedStage && (
            <div className="mt-4 rounded-xl border border-brand-200/70 bg-brand-50/60 p-4 motion-page dark:border-brand-800/60 dark:bg-brand-950/25" role="status">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">{pipelineStages.find((stage) => stage.key === selectedStage)?.label}</p>
                  <p className="mt-1 text-sm text-brand-800/80 dark:text-brand-200/80">{completedStages.includes(selectedStage) ? 'This stage is complete. Review the activity log for the latest updates.' : 'This is your active focus. Complete the next milestone to keep the project on track.'}</p>
                </div>
                <Badge color={completedStages.includes(selectedStage) ? 'success' : 'warning'}>{completedStages.includes(selectedStage) ? 'Complete' : 'Focus'}</Badge>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="timeline-card">
        <CardHeader title="Project timeline" subtitle="The next moments that shape your delivery" action={<Badge color="info"><Clock className="h-3.5 w-3.5" /> Live plan</Badge>} />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-3">
            {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
              <button key={deadline.id} type="button" onClick={() => onNavigate(deadline.page as PageId)} className="timeline-item focus-ring group rounded-xl bg-ink-50/80 p-4 text-left transition-colors hover:bg-brand-50/70 dark:bg-ink-800/50 dark:hover:bg-brand-950/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700 dark:text-brand-300">{index === 0 ? 'Next' : `Step ${index + 1}`}</span>
                  <Badge color={deadline.daysLeft <= 7 ? 'warning' : 'neutral'}>{deadline.daysLeft}d</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-900 dark:text-ink-100">{deadline.title}</p>
                <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{deadline.date}</p>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700"><div className={`h-full rounded-full ${index === 0 ? 'w-3/4 bg-amber-500' : 'w-1/2 bg-brand-500'}`} /></div>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Activity + Deadlines */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="motion-lift">
          <CardHeader title="Recent Activity" subtitle="What has been happening in your project" />
          <CardBody className="p-0">
            <div className="divide-y divide-ink-50 dark:divide-ink-800">
              {recentActivity.map((item) => {
                const Icon = activityIcons[item.icon] ?? Bell;
                return (
                  <div key={item.id} className="activity-row flex items-start gap-3 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-700 dark:text-ink-300">
                        <span className="font-medium text-ink-900 dark:text-ink-100">{item.actor}</span> {item.action}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card className="motion-lift">
          <CardHeader title="Upcoming Deadlines" subtitle="Don't miss these dates" />
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
        <Card className="motion-lift">
          <CardHeader title="Team Roster" subtitle={`Members of "${groupName}"`} />
          <CardBody className="p-0">
            <div className="divide-y divide-ink-50 dark:divide-ink-800">
              {teamMembers.map((m) => (
                <div key={m.id} className="team-row flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={m.name} color="bg-brand-600" size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">
                      {m.name}
                      {m.email === currentUser.email && (
                        <span className="ml-2 text-xs font-normal text-brand-600 dark:text-brand-400">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-ink-400 dark:text-ink-500">{m.email}</p>
                  </div>
                  <Badge color="neutral">{m.rollNumber}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="motion-lift">
          <CardHeader title="Account" subtitle="Your profile information" />
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar name={currentUser.name} color={currentUser.avatarColor} size="lg" />
              <div>
                <p className="font-display text-lg font-bold text-ink-900 dark:text-ink-100">{currentUser.name}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{currentUser.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 rounded-xl bg-ink-50 p-4 dark:bg-ink-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400 dark:text-ink-500">Role</span>
                <Badge color="brand">{currentUser.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400 dark:text-ink-500">Roll Number</span>
                <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{currentUser.rollNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400 dark:text-ink-500">Elective</span>
                <span className="text-sm font-medium text-ink-700 dark:text-ink-200 text-right">
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

function HealthMetric({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  suffix: string;
  tone: 'brand' | 'emerald' | 'amber';
}) {
  const toneClass = tone === 'amber' ? 'bg-amber-500' : tone === 'emerald' ? 'bg-emerald-500' : 'bg-brand-600';
  const width = suffix === '%' ? value : value === 1 ? 24 : 72;
  return (
    <div className="health-metric">
      <div className="flex items-end justify-between gap-2">
        <span className="text-xs font-medium text-ink-500 dark:text-ink-400">{label}</span>
        <span className="tabular-nums font-display text-lg font-bold text-ink-900 dark:text-ink-100">{value}{suffix}</span>
      </div>
<div className="progress-track mt-2" aria-label={`${label}: ${value}${suffix}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={suffix === '%' ? 100 : 10}>
  <span className="sr-only">{label}: {value}{suffix}</span>
  <div className={`progress-fill h-full rounded-full ${toneClass}`} style={{ width: `${width}%` }} aria-hidden="true" />
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
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
  };
  return (
    <Card className="motion-lift">
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`stat-icon flex h-10 w-10 items-center justify-center rounded-lg ${accents[accent]}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-400 dark:text-ink-500">{label}</p>
            <p className="mt-0.5 truncate font-display text-lg font-bold text-ink-900 dark:text-ink-100">{/^\d+$/.test(value) ? <AnimatedNumber value={Number(value)} /> : value}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">{sublabel}</p>
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
