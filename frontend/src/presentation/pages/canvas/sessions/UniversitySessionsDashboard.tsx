import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../appStore/store';
import { FaFilter } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { User } from '../../../../domain/types/auth/Login';
import { Session, UserAccess } from '../../../../domain/types/canvas/session';
import { SessionStats } from './components/SessionStats';
import { SessionFilters } from './components/SessionFilters';
import { SessionCard } from './components/SessionCard';
import { SessionHeader } from './components/SessionHeader';
import { calculateSessionStats } from './utils/sessionUtils';
import { useUniversitySessionManagement } from '../../../../application/hooks/useUniversitySessionManagement';

const UniversitySessionsDashboard = () => {
  const { styles } = usePreferences();
  const {
    sessions,
    watchedCount,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    isLoading,
    isFetching,
    error
  } = useUniversitySessionManagement({ status: 'all', instructor: 'all' }, '');
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = useSelector((state: RootState) => state.auth.user) as User | null;

  const [userAccess, setUserAccess] = useState<UserAccess>({
    isEnrolled: true,
    watchedSessions: [] as string[],
    likedSessions: [] as string[],
    userName: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'Student',
    userRole: user?.role || 'Student'
  });

  // Keep userName and userRole in sync with auth state if it changes
  useEffect(() => {
    if (user) {
      setUserAccess(prev => ({
        ...prev,
        userName: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : prev.userName,
        userRole: user.role || prev.userRole
      }));
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleEnrollment = (isEnrolled: boolean) => {
    setUserAccess(prev => ({ ...prev, isEnrolled }));
  };

  const handleToggleWatched = (sessionId: string) => {
    setUserAccess(prev => ({
      ...prev,
      watchedSessions: prev.watchedSessions.includes(sessionId)
        ? prev.watchedSessions.filter(id => id !== sessionId)
        : [...prev.watchedSessions, sessionId]
    }));
  };

  const uniqueInstructors = [...new Set((sessions as Session[]).map(s => s.instructor).filter(Boolean))] as string[];
  const sessionStats = { ...calculateSessionStats(sessions, userAccess.watchedSessions), watchedCount };

  const handleJoinSessionClick = async (sessionId: string, _userId: string) => {
    const sessionToJoin = (sessions as Session[]).find((s: Session) => (s.id || s._id) === sessionId);
    if (sessionToJoin) {
      const idToUse = sessionToJoin.id || sessionToJoin._id;
      if (!idToUse || idToUse === 'undefined') {
        console.error('Session ID is invalid:', idToUse);
        return { success: false, error: 'Invalid session ID' };
      }
      navigate(`/faculty/video-conference/${idToUse}`, {
        state: {
          session: sessionToJoin,
          faculty: user,
          isHost: false
        }
      });
    }
    return { success: true };
  };

  return (
    <div className={`min-h-screen bg-transparent`}>
      <SessionHeader
        userName={userAccess.userName}
        currentTime={currentTime}
        isEnrolled={userAccess.isEnrolled}
        sessionCount={sessions.length}
        styles={styles}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className={`shadow-sm ${styles.card.background} rounded-3xl border ${styles.border} overflow-hidden p-4 sm:p-8`}>
          <div className="space-y-8">
            <SessionStats stats={sessionStats} styles={styles} />

            <SessionFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={() => setFilters({ status: 'all', instructor: 'all' })}
              uniqueInstructors={uniqueInstructors}
              userAccess={userAccess}
              onToggleEnrollment={handleToggleEnrollment}
              styles={styles}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            <div className="relative space-y-6">
              {isLoading ? (
                <div className={`${styles.card.background} rounded-2xl border ${styles.border} text-center py-20`}>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className={`${styles.textSecondary}`}>Loading sessions...</p>
                </div>
              ) : error ? (
                <div className={`${styles.card.background} rounded-2xl border ${styles.border} text-center py-20`}>
                  <div className={`w-16 h-16 ${styles.status.error} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <FaFilter className={`w-8 h-8 text-white`} />
                  </div>
                  <h3 className={`text-xl font-semibold ${styles.textPrimary} mb-2`}>Error Loading Sessions</h3>
                  <p className={`${styles.textSecondary}`}>Failed to load sessions. Please try again.</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className={`${styles.card.background} rounded-2xl border ${styles.border} text-center py-20`}>
                  <div className={`w-16 h-16 ${styles.backgroundSecondary} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <FaFilter className={`w-8 h-8 ${styles.icon.secondary}`} />
                  </div>
                  <h3 className={`text-xl font-semibold ${styles.textPrimary} mb-2`}>No Sessions Found</h3>
                  <p className={`${styles.textSecondary}`}>Try adjusting your filters to see more sessions.</p>
                </div>
              ) : (
                <>
                  {isFetching && !isLoading && (
                    <div className="absolute top-0 right-0 z-20 flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Refreshing</span>
                    </div>
                  )}
                  <div className={`grid grid-cols-1 gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                    {sessions.map((session: Session, index: number) => (
                      <SessionCard
                        key={session.id || session._id || index}
                        session={session as any}
                        index={index}
                        userAccess={userAccess}
                        styles={styles}
                        onToggleWatched={handleToggleWatched}
                        onJoinSession={handleJoinSessionClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversitySessionsDashboard;