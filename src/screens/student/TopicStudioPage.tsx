import { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Badge, PageHeader, Skeleton } from '@/components/ui/ui';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import type { TopicStatus, TopicVersion, DiscussionMessage } from '@/types';
import type { TopicDraft } from './topic/TopicForm';
import { TopicForm } from './topic/TopicForm';
import { TopicDiscussion } from './topic/TopicDiscussion';
import { TopicVersionHistory } from './topic/TopicVersionHistory';

const emptyDraft: TopicDraft = {
  workingTitle: '',
  existingWork: '',
  problemIdentified: '',
  proposedDifference: '',
  innovation: '',
  feasibility: '',
};

type TopicData = {
  draft: TopicDraft | null;
  versions: TopicVersion[];
  currentStatus: TopicStatus | null;
  discussion: DiscussionMessage[];
};

export function TopicStudioPage() {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<TopicDraft>(emptyDraft);
  const [savedDraft, setSavedDraft] = useState<TopicDraft>(emptyDraft);
  const [currentStatus, setCurrentStatus] = useState<TopicStatus>('changes_requested');
  const [isApproved, setIsApproved] = useState(false);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [reply, setReply] = useState('');
  const [versions, setVersions] = useState<TopicVersion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiGet<TopicData>('/api/topics/mine')
      .then((data) => {
        if (data.draft) {
          setDraft(data.draft);
          setSavedDraft(data.draft);
        }
        setVersions(data.versions ?? []);
        setMessages(data.discussion ?? []);
        if (data.currentStatus) {
          setCurrentStatus(data.currentStatus);
          setIsApproved(data.currentStatus === 'approved');
        }
      })
      .catch(() => showToast('Failed to load topic data.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  // Auto-save draft every 2s after edits
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await apiPut('/api/topics/draft', { draft });
        setSavedDraft(draft);
        showToast('All changes saved', 'success');
      } catch {
        showToast('Failed to auto-save draft.', 'error');
      }
    }, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const updateField = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { version } = await apiPost<{ version: TopicVersion }>('/api/topics/submit', { draft });
      setVersions((prev) => [version, ...prev]);
      setCurrentStatus('pending');
      setSavedDraft(draft);
      showToast(`Topic v${version.version} submitted for review.`, 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to submit topic.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      const { message } = await apiPost<{ message: DiscussionMessage }>('/api/topics/discussion', { body: reply.trim() });
      setMessages((prev) => [...prev, message]);
      setReply('');
      showToast('Reply posted.', 'success');
    } catch {
      showToast('Failed to post reply.', 'error');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Topic Studio"
          subtitle="Define, refine, and submit your project topic for mentor approval."
        />
        {isApproved && (
          <Badge color="success">
            <Lock className="h-3.5 w-3.5" />
            Approved (read-only)
          </Badge>
        )}
      </div>

      <TopicForm
        draft={draft}
        savedDraft={savedDraft}
        isApproved={isApproved}
        currentStatus={currentStatus}
        versions={versions}
        submitting={submitting}
        hasUnsavedChanges={hasUnsavedChanges}
        onUpdateField={updateField}
        onRevert={() => {
          setDraft(savedDraft);
          showToast('Reverted to last saved version.', 'info');
        }}
        onSubmit={handleSubmit}
      />

      <TopicVersionHistory versions={versions} />

      <TopicDiscussion
        messages={messages}
        reply={reply}
        mentorName="Your Mentor"
        currentUser={{ name: 'You', avatarColor: 'bg-brand-600' }}
        onReplyChange={setReply}
        onPostReply={handleReply}
      />
    </div>
  );
}
