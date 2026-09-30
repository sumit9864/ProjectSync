import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Clock, CalendarClock } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { milestones as initialMilestones } from '@/data/mockData';
import type { Milestone } from '@/types';

export function MilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [checkInMilestone, setCheckInMilestone] = useState<Milestone | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const completed = milestones.filter((m) => m.status === 'complete').length;
  const total = milestones.length;
  const progress = Math.round((completed / total) * 100);

  const handleCheckIn = () => {
    if (!checkInMilestone || !note.trim()) {
      showToast('Please add a note for your check-in.', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === checkInMilestone.id
            ? {
                ...m,
                status: 'complete',
                checkInNote: note.trim(),
                checkedInAt:
                  now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                  ' · ' +
                  now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              }
            : m
        )
      );
      setSaving(false);
      setCheckInMilestone(null);
      setNote('');
      showToast(`Milestone "${checkInMilestone.title}" checked in.`, 'success');
    }, 600);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Milestones</h1>
        <p className="mt-1 text-sm text-ink-500">
          Track your project milestones and check in as you complete each one.
        </p>
      </div>

      {/* Progress summary */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">Overall progress</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink-900">
                {completed} of {total} complete
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <span className="font-display text-lg font-bold text-brand-600">{progress}%</span>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Milestone list */}
      <Card>
        <CardHeader title="Milestone Checklist" subtitle="Complete each milestone by its due date" />
        <CardBody className="p-0">
          {milestones.length === 0 ? (
            <EmptyState
              icon={<Target className="h-7 w-7" />}
              title="No milestones yet"
              message="Your milestones will appear here once they are set up by your mentor."
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {milestones.map((m) => {
                const isComplete = m.status === 'complete';
                const isExpanded = expandedId === m.id;
                return (
                  <div key={m.id} className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      {/* Number / status */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isComplete
                            ? 'bg-brand-600 text-white'
                            : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="font-display font-bold">{m.number}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p
                            className={`text-sm font-semibold ${
                              isComplete ? 'text-ink-500 line-through' : 'text-ink-900'
                            }`}
                          >
                            {m.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-ink-400">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Due {m.dueDate}
                            </span>
                          </div>
                        </div>

                        {isComplete ? (
                          <div className="mt-2">
                            <Badge color="success">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </Badge>
                            {m.checkInNote && (
                              <button
                                onClick={() =>
                                  setExpandedId(isExpanded ? null : m.id)
                                }
                                className="ml-2 text-xs font-medium text-brand-600 hover:text-brand-700"
                              >
                                {isExpanded ? 'Hide note' : 'Show note'}
                              </button>
                            )}
                            {isExpanded && m.checkInNote && (
                              <div className="mt-2 rounded-lg bg-brand-50/60 px-3.5 py-2.5">
                                <p className="text-xs font-medium text-ink-400">
                                  Checked in {m.checkedInAt}
                                </p>
                                <p className="mt-1 text-sm text-ink-600">{m.checkInNote}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge color="warning">
                              <Clock className="h-3.5 w-3.5" />
                              Pending
                            </Badge>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setCheckInMilestone(m);
                                setNote('');
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Check in
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Check-in Modal */}
      <Modal
        open={checkInMilestone !== null}
        onClose={() => {
          setCheckInMilestone(null);
          setNote('');
        }}
        title="Milestone Check-In"
        maxWidth="max-w-md"
      >
        {checkInMilestone && (
          <div className="space-y-4">
            <div className="rounded-lg bg-ink-50 px-4 py-3">
              <p className="text-xs text-ink-400">Milestone {checkInMilestone.number}</p>
              <p className="mt-0.5 font-display font-semibold text-ink-800">
                {checkInMilestone.title}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                Check-in note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="What did you accomplish for this milestone? Any notes for your mentor?"
                className="input-field resize-none text-sm"
              />
              <p className="mt-2 text-xs text-ink-400">
                This note will be visible to your mentor in the log book.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setCheckInMilestone(null);
                  setNote('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCheckIn} disabled={saving || !note.trim()}>
                {saving ? 'Saving...' : 'Confirm check-in'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
