'use client';

import { useState } from 'react';
import { StudentShell, type StudentPageId } from '@/components/shell/StudentShell';
import { MentorShell, type MentorPageId } from '@/components/shell/MentorShell';
import { AdminShell, type AdminPageId } from '@/components/shell/AdminShell';
import { AuthScreen } from '@/components/AuthScreen';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { currentUser, notifications as studentNotifications } from '@/data/mockData';
import { mentorUser, mentorNotifications } from '@/data/mentorData';
import { adminUser, adminNotifications } from '@/data/adminData';
import { OverviewPage } from '@/screens/student/OverviewPage';
import { GroupRegistrationPage } from '@/screens/student/GroupRegistrationPage';
import { MentorPreferencesPage } from '@/screens/student/MentorPreferencesPage';
import { TopicStudioPage } from '@/screens/student/TopicStudioPage';
import { GithubTrackerPage } from '@/screens/student/GithubTrackerPage';
import { MilestonesPage } from '@/screens/student/MilestonesPage';
import { LogBookPage } from '@/screens/student/LogBookPage';
import { AdminOverviewPage } from '@/screens/admin/AdminOverviewPage';
import { AdminPipelinePage } from '@/screens/admin/AdminPipelinePage';
import { AdminAllocationPage } from '@/screens/admin/AdminAllocationPage';
import { AdminControlsPage } from '@/screens/admin/AdminControlsPage';
import { AdminAuditLogPage } from '@/screens/admin/AdminAuditLogPage';
import { AdminArchivePage } from '@/screens/admin/AdminArchivePage';
import { AdminMentorsPage } from '@/screens/admin/AdminMentorsPage';
import { MentorOverviewPage } from '@/screens/mentor/MentorOverviewPage';
import { MentorReviewQueuePage } from '@/screens/mentor/MentorReviewQueuePage';
import { MentorMyGroupsPage } from '@/screens/mentor/MentorMyGroupsPage';
import { MentorLogBookPage } from '@/screens/mentor/MentorLogBookPage';
import { MentorCalendarPage } from '@/screens/mentor/MentorCalendarPage';

function App() {
  const { session, signIn, signOut, hydrated: authHydrated } = useAuth();
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

  if (!authHydrated) {
    return null;
  }

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
          user={adminUser}
          notifications={adminNotifications}
        >
          {adminPage === 'overview' && <AdminOverviewPage onNavigate={setAdminPage} />}
          {adminPage === 'pipeline' && <AdminPipelinePage />}
          {adminPage === 'allocation' && (
            <AdminAllocationPage onRoundRun={() => setHasAllocationResults(true)} />
          )}
          {adminPage === 'controls' && (
            <AdminControlsPage
              hasResults={hasAllocationResults}
              onViewResults={() => setAdminPage('allocation')}
            />
          )}
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
          user={currentUser}
          notifications={studentNotifications}
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
        user={mentorUser}
        notifications={mentorNotifications}
      >
        {mentorPage === 'overview' && (
          <MentorOverviewPage onNavigate={setMentorPage} onOpenReview={openReviewForGroup} />
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
        {mentorPage === 'logbook' && <MentorLogBookPage preselectedGroupId={logBookGroupId} />}
        {mentorPage === 'calendar' && <MentorCalendarPage />}
      </MentorShell>
    </ToastProvider>
  );
}

export default App;
