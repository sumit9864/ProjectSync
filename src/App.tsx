import { useState } from 'react';
import { StudentShell, type StudentPageId } from '@/components/StudentShell';
import { MentorShell, type MentorPageId } from '@/components/MentorShell';
import { AdminShell, type AdminPageId } from '@/components/AdminShell';
import { AuthScreen } from '@/components/AuthScreen';
import { ToastProvider } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { OverviewPage } from '@/pages/OverviewPage';
import { GroupRegistrationPage } from '@/pages/GroupRegistrationPage';
import { MentorPreferencesPage } from '@/pages/MentorPreferencesPage';
import { TopicStudioPage } from '@/pages/TopicStudioPage';
import { GithubTrackerPage } from '@/pages/GithubTrackerPage';
import { MilestonesPage } from '@/pages/MilestonesPage';
import { LogBookPage } from '@/pages/LogBookPage';
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminPipelinePage } from '@/pages/admin/AdminPipelinePage';
import { AdminAllocationPage } from '@/pages/admin/AdminAllocationPage';
import { AdminControlsPage } from '@/pages/admin/AdminControlsPage';
import { AdminAuditLogPage } from '@/pages/admin/AdminAuditLogPage';
import { AdminArchivePage } from '@/pages/admin/AdminArchivePage';
import { AdminMentorsPage } from '@/pages/admin/AdminMentorsPage';
import { MentorOverviewPage } from '@/pages/mentor/MentorOverviewPage';
import { MentorReviewQueuePage } from '@/pages/mentor/MentorReviewQueuePage';
import { MentorMyGroupsPage } from '@/pages/mentor/MentorMyGroupsPage';
import { MentorLogBookPage } from '@/pages/mentor/MentorLogBookPage';
import { MentorCalendarPage } from '@/pages/mentor/MentorCalendarPage';

function App() {
  const { session, signIn, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [studentPage, setStudentPage] = useState<StudentPageId>('overview');
  const [mentorPage, setMentorPage] = useState<MentorPageId>('overview');
  const [reviewGroupId, setReviewGroupId] = useState<string | null>(null);
  const [logBookGroupId, setLogBookGroupId] = useState<string | null>(null);
  const [adminPage, setAdminPage] = useState<AdminPageId>('overview');
  const [hasAllocationResults, setHasAllocationResults] = useState(false);

  const handleExit = () => {
    signOut();
    setStudentPage('overview');
    setMentorPage('overview');
    setReviewGroupId(null);
    setLogBookGroupId(null);
    setAdminPage('overview');
  };

  if (!session) {
    return (
      <ToastProvider>
        <AuthScreen onSignIn={signIn} theme={theme} onToggleTheme={toggleTheme} />
      </ToastProvider>
    );
  }

  if (session.role === 'admin') {
    return (
      <ToastProvider>
        <AdminShell
          currentPage={adminPage}
          onNavigate={setAdminPage}
          onExit={handleExit}
          theme={theme}
          onToggleTheme={toggleTheme}
        >
          {adminPage === 'overview' && <AdminOverviewPage onNavigate={setAdminPage} />}
          {adminPage === 'pipeline' && <AdminPipelinePage />}
          {adminPage === 'allocation' && <AdminAllocationPage onRoundRun={() => setHasAllocationResults(true)} />}
          {adminPage === 'controls' && <AdminControlsPage hasResults={hasAllocationResults} onViewResults={() => setAdminPage('allocation')} />}
          {adminPage === 'audit' && <AdminAuditLogPage />}
          {adminPage === 'archive' && <AdminArchivePage />}
          {adminPage === 'mentors' && <AdminMentorsPage />}
        </AdminShell>
      </ToastProvider>
    );
  }

  if (session.role === 'student') {
    return (
      <ToastProvider>
        <StudentShell
          currentPage={studentPage}
          onNavigate={setStudentPage}
          onExit={handleExit}
          theme={theme}
          onToggleTheme={toggleTheme}
        >
          {studentPage === 'overview' && <OverviewPage onNavigate={setStudentPage} />}
          {studentPage === 'group' && <GroupRegistrationPage />}
          {studentPage === 'preferences' && <MentorPreferencesPage />}
          {studentPage === 'topic' && <TopicStudioPage />}
          {studentPage === 'github' && <GithubTrackerPage />}
          {studentPage === 'milestones' && <MilestonesPage />}
          {studentPage === 'logbook' && <LogBookPage />}
        </StudentShell>
      </ToastProvider>
    );
  }

  // session.role === 'mentor'
  const openReviewForGroup = (groupId: string) => {
    setReviewGroupId(groupId);
    setMentorPage('review');
  };

  const openLogBookForGroup = (groupId: string) => {
    setLogBookGroupId(groupId);
    setMentorPage('logbook');
  };

  return (
    <ToastProvider>
      <MentorShell
        currentPage={mentorPage}
        onNavigate={(page) => {
          setMentorPage(page);
          if (page !== 'review') setReviewGroupId(null);
          if (page !== 'logbook') setLogBookGroupId(null);
        }}
        onExit={handleExit}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        {mentorPage === 'overview' && (
          <MentorOverviewPage
            onNavigate={setMentorPage}
            onOpenReview={openReviewForGroup}
          />
        )}
        {mentorPage === 'review' && (
          <MentorReviewQueuePage
            preselectedGroupId={reviewGroupId}
            onNavigateToLogBook={openLogBookForGroup}
          />
        )}
        {mentorPage === 'groups' && (
          <MentorMyGroupsPage
            onOpenReview={openReviewForGroup}
            onOpenLogBook={openLogBookForGroup}
          />
        )}
        {mentorPage === 'logbook' && (
          <MentorLogBookPage preselectedGroupId={logBookGroupId} />
        )}
        {mentorPage === 'calendar' && <MentorCalendarPage />}
      </MentorShell>
    </ToastProvider>
  );
}

export default App;
