import { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Save,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Avatar, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  topicDraft,
  topicVersions,
  discussionMessages as initialMessages,
  currentUser,
  assignedMentor,
} from '@/data/mockData';
import type { TopicStatus } from '@/types';

const statusConfig: Record<string, { label: string; color: 'warning' | 'success' | 'error'; icon: typeof Clock }> = {
  pending: { label: 'Waiting on mentor review', color: 'warning', icon: Clock },
  approved: { label: 'Topic approved', color: 'success', icon: CheckCircle2 },
  changes_requested: { label: 'Changes requested by mentor', color: 'error', icon: AlertCircle },
};

export function TopicStudioPage() {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(topicDraft);
  const [savedDraft, setSavedDraft] = useState(topicDraft);
  const [isApproved] = useState(false);
  const [currentStatus] = useState<TopicStatus>('changes_requested');
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState('');
  const [versions, setVersions] = useState(topicVersions);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  // Auto-save indicator
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSavedDraft(draft);
      showToast('All changes saved', 'success');
    }, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const newVersion = {
        version: versions.length + 1,
        submittedAt:
          now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' · ' +
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        status: 'pending' as TopicStatus,
      };
      setVersions((prev) => [newVersion, ...prev]);
      setSubmitting(false);
      showToast('Topic v' + newVersion.version + ' submitted for review.', 'success');
    }, 800);
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        author: currentUser.name,
        role: 'Student',
        avatarColor: currentUser.avatarColor,
        body: reply.trim(),
        time:
          now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' · ' +
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      },
    ]);
    setReply('');
    showToast('Reply posted.', 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const statusInfo = statusConfig[currentStatus];
  const StatusIcon = statusInfo.icon;

  const fields: { key: keyof typeof draft; label: string; placeholder: string; rows: number }[] = [
    {
      key: 'workingTitle',
      label: 'Working Title',
      placeholder: 'A concise title for your project',
      rows: 1,
    },
    {
      key: 'existingWork',
      label: 'Existing Work',
      placeholder: 'What has already been done in this area?',
      rows: 3,
    },
    {
      key: 'problemIdentified',
      label: 'Problem Identified',
      placeholder: 'What specific problem are you solving?',
      rows: 3,
    },
    {
      key: 'proposedDifference',
      label: 'Proposed Difference',
      placeholder: 'How is your approach different from existing work?',
      rows: 3,
    },
    {
      key: 'innovation',
      label: 'Innovation',
      placeholder: 'What is the novel contribution?',
      rows: 3,
    },
    {
      key: 'feasibility',
      label: 'Feasibility',
      placeholder: 'Why is this achievable in the given timeline?',
      rows: 3,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Topic Studio</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Define, refine, and submit your project topic for mentor approval.
          </p>
        </div>
        {isApproved && (
          <Badge color="success">
            <Lock className="h-3.5 w-3.5" />
            Approved (read-only)
          </Badge>
        )}
      </div>

      {/* Decision status callout */}
      <Card
        className={
          statusInfo.color === 'warning'
            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/30'
            : statusInfo.color === 'success'
            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
            : 'border-rose-200 bg-rose-50/50 dark:border-rose-800/60 dark:bg-rose-950/30'
        }
      >
        <CardBody className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              statusInfo.color === 'warning'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                : statusInfo.color === 'success'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            <StatusIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-ink-900 dark:text-ink-100">{statusInfo.label}</p>
            {currentStatus === 'changes_requested' && versions[0]?.feedback && (
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                <span className="font-medium">Mentor feedback:</span> {versions[0].feedback}
              </p>
            )}
            {currentStatus === 'approved' && (
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                Your topic is approved. You can no longer edit it.
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Topic form */}
      <Card>
        <CardHeader
          title="Topic Details"
          subtitle={`Current draft — version ${versions.length + 1}`}
          action={
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse-dot" />
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All changes saved
                </span>
              )}
            </div>
          }
        />
        <CardBody className="space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                {field.label}
              </label>
              {field.rows === 1 ? (
                <input
                  type="text"
                  value={draft[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  disabled={isApproved}
                  placeholder={field.placeholder}
                  className="input-field disabled:bg-ink-50 disabled:text-ink-500 dark:disabled:bg-ink-800/50 dark:disabled:text-ink-500"
                />
              ) : (
                <textarea
                  value={draft[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  disabled={isApproved}
                  rows={field.rows}
                  placeholder={field.placeholder}
                  className="input-field resize-none disabled:bg-ink-50 disabled:text-ink-500 dark:disabled:bg-ink-800/50 dark:disabled:text-ink-500"
                />
              )}
            </div>
          ))}

          {!isApproved && (
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(savedDraft);
                  showToast('Reverted to last saved version.', 'info');
                }}
                disabled={!hasUnsavedChanges}
              >
                Revert
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || hasUnsavedChanges}>
                {submitting ? (
                  <>
                    <Save className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for review
                  </>
                )}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Version history */}
      <Card>
        <CardHeader title="Version History" subtitle="All past submissions and their status" />
        <CardBody className="p-0">
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            {versions.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-400 dark:text-ink-500">
                No submissions yet. Submit your topic for review to see versions here.
              </p>
            ) : (
              versions.map((v) => {
                const vStatus = statusConfig[v.status];
                return (
                  <div key={v.version} className="flex items-start gap-3 px-5 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                      v{v.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge color={vStatus.color}>{vStatus.label}</Badge>
                        <span className="text-xs text-ink-400 dark:text-ink-500">{v.submittedAt}</span>
                      </div>
                      {v.feedback && (
                        <p className="mt-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600 dark:bg-ink-800/50 dark:text-ink-300">
                          {v.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

      {/* Discussion thread */}
      <Card>
        <CardHeader
          title="Discussion"
          subtitle={`Conversation with ${assignedMentor.name}`}
          action={
            <Badge color="brand">
              <MessageSquare className="h-3.5 w-3.5" />
              {messages.length} messages
            </Badge>
          }
        />
        <CardBody className="space-y-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <Avatar name={msg.author} color={msg.avatarColor} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{msg.author}</span>
                    <Badge color={msg.role === 'Mentor' ? 'brand' : 'neutral'}>{msg.role}</Badge>
                    <span className="text-xs text-ink-400 dark:text-ink-500">{msg.time}</span>
                  </div>
                  <p className="mt-1.5 rounded-lg bg-ink-50 px-3.5 py-2.5 text-sm text-ink-700 leading-relaxed dark:bg-ink-800/50 dark:text-ink-300">
                    {msg.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
            <div className="flex items-start gap-3">
              <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
              <div className="flex-1">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Write a reply..."
                  className="input-field resize-none text-sm"
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={handleReply} disabled={!reply.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    Post reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
