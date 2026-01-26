import { Routes, Route, Navigate } from 'react-router-dom';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import WelcomeBanner from './WelcomeBanner';
import Announcements from './Announcements';
import Deadlines from './Deadlines';
import QuickLinks from './QuickLinks';
import ScheduledClasses from './ScheduledClasses';
import NewEvents from './NewEvents';
import Calendar from './Calendar';
import Academics from '../Academics/Academics';
import CampusLife from '../CampusLife/CampusLife';
import Communication from '../Communication/Communication';
import Financial from '../Financial/Financial';
import { useStudentDashboard } from '../../../../application/hooks/useStudentDashboard';

export default function StudentDashboard() {
  const { styles } = usePreferences();
  const {
    announcements,
    deadlines,
    classes,
    newEvents,
    calendarDays,
    isLoading,
    hasError,
    dashboardError,
    studentInfo
  } = useStudentDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (hasError) return <div>Error: {dashboardError ? String(dashboardError) : 'Failed to load dashboard data.'}</div>;

  return (
    <div className={`flex flex-col ${styles.textPrimary}`}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <WelcomeBanner studentInfo={studentInfo} />
              <div className="px-2 sm:px-4 md:px-4 py-4 sm:py-6 md:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-4 md:gap-6 h-full">
                  <Announcements announcements={announcements} />
                  <Deadlines deadlines={deadlines} />
                  <QuickLinks />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-4 md:gap-6 mt-8 sm:mt-4 md:mt-6 h-full">
                  <ScheduledClasses classes={classes} />
                  <NewEvents events={newEvents} />
                  <Calendar calendarDays={calendarDays ?? {}} />
                </div>
              </div>
            </>
          }
        />
        <Route path="academics" element={<Academics />} />
        <Route path="financial" element={<Financial />} />
        <Route path="communication" element={<Communication />} />
        <Route path="campus-life" element={<CampusLife />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}