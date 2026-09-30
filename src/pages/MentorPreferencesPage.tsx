import { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Eye,
  GitCompare,
  Clock,
  CheckCircle2,
  Briefcase,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { mentors as allMentors } from '@/data/mockData';
import type { Mentor, ShortlistSubmission } from '@/types';

export function MentorPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState<1 | 2>(1);
  const [shortlist, setShortlist] = useState<string[]>(['mentor-1', 'mentor-2', 'mentor-5']);
  const [submission, setSubmission] = useState<ShortlistSubmission | null>({
    round: 1,
    entries: [
      { mentorId: 'mentor-1', rank: 1 },
      { mentorId: 'mentor-2', rank: 2 },
      { mentorId: 'mentor-5', rank: 3 },
    ],
    submittedAt: 'Sep 22, 2026 · 3:45 PM',
  });
  const [profileMentor, setProfileMentor] = useState<Mentor | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const isSubmitted = submission !== null && submission.round === round;

  const addToShortlist = (mentorId: string) => {
    if (shortlist.includes(mentorId)) return;
    if (shortlist.length >= 3) {
      showToast('Shortlist is full (3 max). Remove one to add another.', 'warning');
      return;
    }
    setShortlist((prev) => [...prev, mentorId]);
    setSubmission(null);
    showToast('Mentor added to shortlist.', 'success');
  };

  const removeFromShortlist = (mentorId: string) => {
    setShortlist((prev) => prev.filter((id) => id !== mentorId));
    setSubmission(null);
  };

  const moveRank = (mentorId: string, direction: 'up' | 'down') => {
    setShortlist((prev) => {
      const idx = prev.indexOf(mentorId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
    setSubmission(null);
  };

  const submitShortlist = () => {
    if (shortlist.length < 2) {
      showToast('You must rank at least 2 mentors.', 'error');
      return;
    }
    const now = new Date();
    setSubmission({
      round,
      entries: shortlist.map((mentorId, i) => ({ mentorId, rank: i + 1 })),
      submittedAt: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
        ' · ' +
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
    showToast(`Round ${round} preferences submitted.`, 'success');
  };

  const toggleCompare = (mentorId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(mentorId)) return prev.filter((id) => id !== mentorId);
      if (prev.length >= 2) {
        showToast('You can compare 2 mentors at a time.', 'info');
        return prev;
      }
      return [...prev, mentorId];
    });
  };

  const shortlistedMentors = shortlist
    .map((id) => allMentors.find((m) => m.id === id))
    .filter(Boolean) as Mentor[];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Mentor Preferences</h1>
        <p className="mt-1 text-sm text-ink-500">
          Browse available mentors, build your shortlist, and submit your ranked preferences.
        </p>
      </div>

      {/* Round Selector */}
      <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white p-1.5 shadow-card">
        {([1, 2] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRound(r)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              round === r
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-ink-600 hover:bg-ink-50'
            }`}
          >
            Round {r}
            {r === 1 && <span className="ml-2 text-xs opacity-80">Current</span>}
          </button>
        ))}
      </div>

      {/* Shortlist Panel */}
      <Card className={isSubmitted ? 'border-emerald-200' : ''}>
        <CardHeader
          title="Your Shortlist"
          subtitle={
            isSubmitted
              ? `Submitted for Round ${submission!.round} at ${submission!.submittedAt}`
              : `Rank ${shortlist.length} of 3 mentors (min 2 required)`
          }
          action={
            isSubmitted ? (
              <Badge color="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Submitted
              </Badge>
            ) : shortlist.length >= 2 ? (
              <Button size="sm" onClick={submitShortlist}>
                Submit preferences
              </Button>
            ) : undefined
          }
        />
        <CardBody>
          {shortlist.length === 0 ? (
            <EmptyState
              icon={<UserCheck className="h-7 w-7" />}
              title="No mentors shortlisted yet"
              message="Browse mentors below and add up to 3 to your shortlist, then rank them by preference."
            />
          ) : (
            <div className="space-y-3">
              {shortlistedMentors.map((mentor, idx) => (
                <div
                  key={mentor.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-200 p-3 transition-colors hover:border-brand-200"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                  <Avatar name={mentor.name} color={mentor.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800 truncate">{mentor.name}</p>
                    <p className="text-xs text-ink-500 truncate">{mentor.domain}</p>
                  </div>
                  {!isSubmitted && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveRank(mentor.id, 'up')}
                        disabled={idx === 0}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 disabled:opacity-30 transition-colors"
                        aria-label="Move up"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button
                        onClick={() => moveRank(mentor.id, 'down')}
                        disabled={idx === shortlist.length - 1}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 disabled:opacity-30 transition-colors"
                        aria-label="Move down"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <button
                        onClick={() => removeFromShortlist(mentor.id)}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        aria-label="Remove from shortlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!isSubmitted && shortlist.length < 3 && (
                <p className="text-xs text-ink-400">
                  You can add {3 - shortlist.length} more mentor{3 - shortlist.length > 1 ? 's' : ''} from the list below.
                </p>
              )}
              {isSubmitted && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                  <Clock className="h-4 w-4 shrink-0" />
                  Submitted at {submission!.submittedAt}. You can revise and resubmit until the deadline.
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Compare bar */}
      {compareIds.length > 0 && (
        <Card className="border-brand-200 bg-brand-50/40">
          <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <GitCompare className="h-5 w-5 text-brand-600" />
              <p className="text-sm text-ink-700">
                {compareIds.length} mentor{compareIds.length > 1 ? 's' : ''} selected for comparison
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCompareIds([])}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setCompareOpen(true)}
                disabled={compareIds.length !== 2}
              >
                Compare side-by-side
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Mentor List */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Available Mentors</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {allMentors.map((mentor) => {
            const inShortlist = shortlist.includes(mentor.id);
            const inCompare = compareIds.includes(mentor.id);
            const full = mentor.currentLoad >= mentor.capacity;
            return (
              <Card key={mentor.id} className="transition-shadow hover:shadow-cardhover">
                <CardBody>
                  <div className="flex items-start gap-3">
                    <Avatar name={mentor.name} color={mentor.avatarColor} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display font-semibold text-ink-900">{mentor.name}</p>
                          <p className="text-xs text-ink-500">{mentor.domain}</p>
                        </div>
                        {full && <Badge color="error">Full</Badge>}
                      </div>
                      <p className="mt-2 text-sm text-ink-600">{mentor.focus}</p>

                      {/* Capacity indicator */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-400">Current load</span>
                          <span className={`font-medium ${full ? 'text-rose-600' : 'text-ink-600'}`}>
                            {mentor.currentLoad}/{mentor.capacity}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              full ? 'bg-rose-400' : mentor.currentLoad >= mentor.capacity - 1 ? 'bg-amber-400' : 'bg-brand-500'
                            }`}
                            style={{ width: `${(mentor.currentLoad / mentor.capacity) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setProfileMentor(mentor)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Profile
                        </Button>
                        <Button
                          variant={inShortlist ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => (inShortlist ? removeFromShortlist(mentor.id) : addToShortlist(mentor.id))}
                          disabled={full && !inShortlist}
                        >
                          {inShortlist ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Shortlisted
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Add to shortlist
                            </>
                          )}
                        </Button>
                        <button
                          onClick={() => toggleCompare(mentor.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            inCompare
                              ? 'bg-brand-100 text-brand-700'
                              : 'text-ink-500 hover:bg-ink-100'
                          }`}
                        >
                          <GitCompare className="h-3.5 w-3.5" />
                          {inCompare ? 'Selected' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        open={profileMentor !== null}
        onClose={() => setProfileMentor(null)}
        title="Mentor Profile"
        maxWidth="max-w-lg"
      >
        {profileMentor && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <Avatar name={profileMentor.name} color={profileMentor.avatarColor} size="lg" />
              <div>
                <p className="font-display text-lg font-bold text-ink-900">{profileMentor.name}</p>
                <p className="text-sm text-brand-600">{profileMentor.domain}</p>
                <p className="mt-1 text-sm text-ink-600">{profileMentor.focus}</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-ink-600">{profileMentor.bio}</p>

            <div className="flex items-center gap-3 rounded-lg bg-ink-50 px-4 py-3">
              <Briefcase className="h-5 w-5 text-ink-500" />
              <div>
                <p className="text-xs text-ink-400">Capacity</p>
                <p className="text-sm font-medium text-ink-700">
                  {profileMentor.currentLoad} / {profileMentor.capacity} groups
                </p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-ink-700">Past Projects Guided</p>
              </div>
              <ul className="space-y-2">
                {profileMentor.pastProjects.map((project, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-ink-100 px-3 py-2.5 text-sm text-ink-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {project}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
              <Button variant="secondary" onClick={() => setProfileMentor(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  addToShortlist(profileMentor.id);
                  setProfileMentor(null);
                }}
                disabled={
                  shortlist.includes(profileMentor.id) ||
                  shortlist.length >= 3 ||
                  profileMentor.currentLoad >= profileMentor.capacity
                }
              >
                <Plus className="h-4 w-4" />
                {shortlist.includes(profileMentor.id) ? 'Already shortlisted' : 'Add to shortlist'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Compare Modal */}
      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Compare Mentors"
        maxWidth="max-w-3xl"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {compareIds.map((id) => {
            const mentor = allMentors.find((m) => m.id === id);
            if (!mentor) return null;
            return (
              <div key={id} className="rounded-xl border border-ink-200 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={mentor.name} color={mentor.avatarColor} size="md" />
                  <div>
                    <p className="font-display font-semibold text-ink-900">{mentor.name}</p>
                    <p className="text-xs text-brand-600">{mentor.domain}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink-600">{mentor.focus}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-400">Load</span>
                      <span className="font-medium text-ink-600">
                        {mentor.currentLoad}/{mentor.capacity}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(mentor.currentLoad / mentor.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink-400">Past projects</p>
                    <p className="text-sm text-ink-600">{mentor.pastProjects.length} guided</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => {
                    addToShortlist(mentor.id);
                  }}
                  disabled={shortlist.includes(mentor.id) || shortlist.length >= 3}
                >
                  {shortlist.includes(mentor.id) ? 'Already shortlisted' : 'Add to shortlist'}
                </Button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
