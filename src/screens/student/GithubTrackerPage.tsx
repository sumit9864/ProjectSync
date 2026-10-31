import { useState, useEffect } from 'react';
import { Github, CheckCircle2, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Skeleton,
  PageHeader,
} from '@/components/ui/ui';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost } from '@/lib/apiClient';

type GitHubData = {
  connected: boolean;
  url: string | null;
  lastUpdated: string;
};

export function GithubTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [repo, setRepo] = useState<GitHubData>({ connected: false, url: null, lastUpdated: '' });
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    apiGet<GitHubData>('/api/github/mine')
      .then((data) => {
        setRepo(data);
        if (data.url) setUrl(data.url);
      })
      .catch(() => showToast('Failed to load GitHub data.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!url.trim()) {
      showToast('Please enter a repository URL.', 'error');
      return;
    }
    if (!/github\.com\/[\w-]+\/[\w.-]+/.test(url.trim())) {
      showToast('Enter a valid GitHub repository URL.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await apiPost<GitHubData>('/api/github/mine', { url: url.trim() });
      setRepo(updated);
      showToast('GitHub repository updated.', 'success');
    } catch {
      showToast('Failed to save repository URL.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="GitHub Tracker"
        subtitle="Connect your project repository so your mentor can track progress."
      />

      {/* Connection status */}
      <Card className={repo.connected ? 'border-emerald-200 dark:border-emerald-800/60' : ''}>
        <CardBody>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                repo.connected
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400'
              }`}
            >
              <Github className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-ink-900 dark:text-ink-100">
                  Repository
                </p>
                {repo.connected ? (
                  <Badge color="success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </Badge>
                ) : (
                  <Badge color="warning">Not connected</Badge>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
                <Clock className="h-3.5 w-3.5" />
                Last updated {repo.lastUpdated || 'never'}
              </p>
            </div>
            {repo.connected && repo.url && (
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors sm:flex dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                <ExternalLink className="h-4 w-4" />
                Open repo
              </a>
            )}
          </div>
        </CardBody>
      </Card>

      {/* URL form */}
      <Card>
        <CardHeader title="Repository URL" subtitle="Add or update your GitHub repository link" />
        <CardBody className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
              GitHub Repository URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/your-team/your-project"
                className="input-field flex-1"
              />
              <Button onClick={handleSave} disabled={saving} className="shrink-0">
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">
              Make sure your repository is public or your mentor has been added as a collaborator.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
