import { useState } from 'react';
import { StudentShell, type StudentPageId } from '@/components/StudentShell';
import { MentorShell, type MentorPageId } from '@/components/MentorShell';
import { Landing, type Role } from '@/components/Landing';
import { ToastProvider } from '@/components/Toast';
import { OverviewPage } from '@/pages/OverviewPage';
import { GroupRegistrationPage } from '@/pages/GroupRegistrationPage';
import { MentorPreferencesPage } from '@/pages/MentorPreferencesPage';
import { TopicStudioPage } from '@/pages/TopicStudioPage';
import { GithubTrackerPage } from '@/pages/GithubTrackerPage';
import { MilestonesPage } from '@/pages/MilestonesPage';
import { LogBookPage } from '@/pages/LogBookPage';
import { AdminPlaceholder } from '@/pages/AdminPlaceholder';
import { MentorOverviewPage } from '@/pages/mentor/MentorOverviewPage';
import { MentorReviewQueuePage } from '@/pages/mentor/MentorReviewQueuePage';
import { MentorMyGroupsPage } from '@/pages/mentor/MentorMyGroupsPage';
import { MentorLogBookPage } from '@/pages/mentor/MentorLogBookPage';
import { MentorCalendarPage } from '@/pages/mentor/MentorCalendarPage';

function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [studentPage, setStudentPage] = useState<StudentPageId>('overview');
  const [mentorPage, setMentorPage] = useState<MentorPageId>('overview');
  const [reviewGroupId, setReviewGroupId] = useState<string | null>(null);
  const [logBookGroupId, setLogBookGroupId] = useState<string | null>(null);

  const handleExit = () => {
    setRole(null);
    setStudentPage('overview');
    setMentorPage('overview');
    setReviewGroupId(null);
    setLogBookGroupId(null);
  };

  if (!role) {
    return (
      <ToastProvider>
        <Landing onSelect={setRole} />
      </ToastProvider>
    );
  }

  if (role === 'admin') {
    return (
      <ToastProvider>
        <AdminPlaceholder onExit={handleExit} />
      </ToastProvider>
    );
  }

  if (role === 'student') {
    return (
      <ToastProvider>
        <StudentShell
          currentPage={studentPage}
          onNavigate={setStudentPage}
          onExit={handleExit}
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

  // role === 'mentor'
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
            onNavigate={setMentorPage}
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
