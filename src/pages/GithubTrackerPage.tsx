import { useState, useEffect } from 'react';
import { Github, CheckCircle2, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { githubRepo } from '@/data/mockData';

export function GithubTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState(githubRepo.url);
  const [repo, setRepo] = useState(githubRepo);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleSave = () => {
    if (!url.trim()) {
      showToast('Please enter a repository URL.', 'error');
      return;
    }
    if (!/github\.com\/[\w-]+\/[\w.-]+/.test(url.trim())) {
      showToast('Enter a valid GitHub repository URL.', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      setRepo({
        url: url.trim(),
        lastUpdated:
          now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' · ' +
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        connected: true,
      });
      setSaving(false);
      showToast('GitHub repository updated.', 'success');
    }, 800);
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
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">GitHub Tracker</h1>
        <p className="mt-1 text-sm text-ink-500">
          Connect your project repository so your mentor can track progress.
        </p>
      </div>

      {/* Connection status */}
      <Card className={repo.connected ? 'border-emerald-200' : ''}>
        <CardBody>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                repo.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-ink-100 text-ink-500'
              }`}
            >
              <Github className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-ink-900">Repository</p>
                {repo.connected ? (
                  <Badge color="success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </Badge>
                ) : (
                  <Badge color="warning">Not connected</Badge>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                <Clock className="h-3.5 w-3.5" />
                Last updated {repo.lastUpdated}
              </p>
            </div>
            {repo.connected && (
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors sm:flex"
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
        <CardHeader
          title="Repository URL"
          subtitle="Add or update your GitHub repository link"
        />
        <CardBody className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
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
            <p className="mt-2 text-xs text-ink-400">
              Make sure your repository is public or your mentor has been added as a collaborator.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
