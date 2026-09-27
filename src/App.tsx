import { useState } from 'react';
import { AppShell, type PageId } from '@/components/AppShell';
import { Landing } from '@/components/Landing';
import { ToastProvider } from '@/components/Toast';
import { OverviewPage } from '@/pages/OverviewPage';
import { GroupRegistrationPage } from '@/pages/GroupRegistrationPage';
import { MentorPreferencesPage } from '@/pages/MentorPreferencesPage';
import { TopicStudioPage } from '@/pages/TopicStudioPage';
import { GithubTrackerPage } from '@/pages/GithubTrackerPage';
import { MilestonesPage } from '@/pages/MilestonesPage';
import { LogBookPage } from '@/pages/LogBookPage';

function App() {
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState<PageId>('overview');

  if (!entered) {
    return (
      <ToastProvider>
        <Landing onEnter={() => setEntered(true)} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppShell currentPage={page} onNavigate={setPage} onExit={() => setEntered(false)}>
        {page === 'overview' && <OverviewPage onNavigate={setPage} />}
        {page === 'group' && <GroupRegistrationPage />}
        {page === 'preferences' && <MentorPreferencesPage />}
        {page === 'topic' && <TopicStudioPage />}
        {page === 'github' && <GithubTrackerPage />}
        {page === 'milestones' && <MilestonesPage />}
        {page === 'logbook' && <LogBookPage />}
      </AppShell>
    </ToastProvider>
  );
}

export default App;
