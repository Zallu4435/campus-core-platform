import React, { useState, useMemo, useRef, useCallback } from 'react';
import { FaClock, FaUsers, FaEye, FaFileAlt, FaCalendarAlt, FaFilter, FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';
import { useSessionManagement } from '../../../../application/hooks/useSessionManagement';
import { useQueryClient } from '@tanstack/react-query';
import SessionAttendanceViewModal from './SessionAttendanceViewModal'
import { Session, AttendanceInterval, AttendanceUser } from '../../../../domain/types/faculty/attendence';
import { VideoSession } from '../../../../application/services/session.service';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const SessionAttendancePage = () => {
  const queryClient = useQueryClient();

  const {
    sessions,
    isLoading: isLoadingSessions,
    error,
    useSessionAttendance,
    updateAttendanceStatus
  } = useSessionManagement();

  const sessionList = useMemo(() => Array.isArray(sessions) ? (sessions as VideoSession[]) : [], [sessions]);

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [attendanceDecisions, setAttendanceDecisions] = useState(new Map());
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!selectedSessionId && sessionList.length > 0) {
      const withAttendees = sessionList.find((s) => (s?.attendees ?? 0) > 0);
      const ongoing = sessionList.find((s) => s?.status === 'Ongoing');
      const ended = sessionList.find((s) => s?.status === 'Ended');
      const fallback = sessionList[0];
      const chosen = withAttendees || ongoing || ended || fallback;
      const chosenId = chosen?._id ?? chosen?.id;
      if (chosenId) setSelectedSessionId(chosenId);
    }
  }, [sessionList, selectedSessionId]);


  const filters = React.useMemo(() => ({
    search: searchTerm || undefined,
    decision: decisionFilter !== 'all' ? decisionFilter : undefined,
    attendanceLevel: attendanceFilter !== 'all' ? attendanceFilter : undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
  }), [searchTerm, decisionFilter, attendanceFilter, dateRange.start, dateRange.end]);

  const { data: currentAttendanceData = [], isLoading: isLoadingAttendance, refetch: refetchAttendance } = useSessionAttendance(selectedSessionId, filters);


  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);



  const currentSession = sessionList.find((s) => (s?._id ?? s?.id) === selectedSessionId) as Session | undefined;

  const calculateTotalTime = (
    intervals: AttendanceInterval[],
    sessionEndTime?: string
  ): number => {
    return intervals.reduce((total: number, interval: AttendanceInterval) => {
      if (!interval.joinedAt) return total;

      const joinTime = new Date(interval.joinedAt);
      const leaveTime = interval.leftAt
        ? new Date(interval.leftAt)
        : sessionEndTime
          ? new Date(sessionEndTime)
          : new Date();

      if (
        !isNaN(joinTime.getTime()) &&
        !isNaN(leaveTime.getTime()) &&
        leaveTime > joinTime
      ) {
        total += leaveTime.getTime() - joinTime.getTime();
      }

      return total;
    }, 0);
  };


  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };


  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };


  const calculateAttendancePercentage = (
    totalTimeMs: number,
    session?: Session
  ): number => {
    if (!session || !session.duration) return 0;
    const sessionDurationMs = session.duration
      ? Number(session.duration) * 60 * 1000
      : 2 * 60 * 60 * 1000;
    return Math.round((totalTimeMs / sessionDurationMs) * 100);
  };


  const processedAttendance = useMemo(() => {
    if (!currentSession) return [];
    return (currentAttendanceData || []).map((user: AttendanceUser) => {
      const totalTime = calculateTotalTime(user.intervals, currentSession?.endTime);
      const attendancePercentage = calculateAttendancePercentage(totalTime, currentSession);
      return {
        ...user,
        totalTime,
        formattedTime: formatDuration(totalTime),
        attendancePercentage,
        sessionData: currentSession,
        status: user.status
      };
    });
  }, [currentAttendanceData, currentSession]);

  const filteredSessions = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return sessionList;
    return sessionList.filter((session) => {
      const sessionDate = new Date(session.startTime);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }

      if (startDate && sessionDate < startDate) return false;
      if (endDate && sessionDate > endDate) return false;
      return true;
    });
  }, [dateRange, sessionList]);

  const debouncedSearch = useCallback((searchValue: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(() => {
      setSearchTerm(searchValue);
      setIsSearching(false);
    }, 500);
  }, [refetchAttendance]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setIsSearching(false);
      setSearchTerm(e.currentTarget.value);
    }
  }, [refetchAttendance]);

  const clearFilters = () => {
    setSearchTerm('');
    setAttendanceFilter('all');
    setDecisionFilter('all');
    setDateRange({ start: '', end: '' });
    setIsSearching(false);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const handleAttendanceDecision = async (userId: string, decision: string) => {
    setAttendanceDecisions(prev => new Map(prev.set(userId, decision)));
    const user = (currentAttendanceData || []).find((u: AttendanceUser) => u.id.toString() === userId.toString());
    const name = user?.username || '';
    if (selectedSessionId && userId) {
      try {
        await updateAttendanceStatus(selectedSessionId, userId, decision, name);
        await queryClient.invalidateQueries({ queryKey: ['sessionAttendance', selectedSessionId] });
      } catch (err) {
        console.error('Error updating attendance status:', err);
      }
    }
  };

  const handleViewIntervals = (user: AttendanceUser) => {
    setSelectedUser(user);
  };

  const closeIntervalModal = () => {
    setSelectedUser(null);
  };

  const getAttendanceRecommendation = (percentage: number) => {
    if (percentage >= 75) return 'approve';
    if (percentage >= 50) return 'review';
    return 'decline';
  };

  const getDecisionButtonStyle = (decision: string, currentDecision: string, userStatus?: string) => {
    if (userStatus === 'approved' || userStatus === 'approve') {
      if (decision === 'approve') return 'bg-green-600 text-white';
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
    if (userStatus === 'declined' || userStatus === 'decline') {
      if (decision === 'decline') return 'bg-red-600 text-white';
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
    if (decision === currentDecision) {
      if (decision === 'approve') return 'bg-green-600 text-white';
      if (decision === 'decline') return 'bg-red-600 text-white';
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  if (error) {
    const msg = error instanceof Error ? error.message : 'Failed to load sessions';
    return <ErrorMessage message={msg} />;
  }

  if (!selectedSessionId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a session</h2>
          <p className="text-gray-500">Please select a session from the dropdown to view attendance details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="inline-flex items-center space-x-3 bg-white/95 backdrop-blur-xl rounded-3xl px-8 py-6 shadow-2xl border border-pink-100">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-3xl"><FaFileAlt /></span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Session Attendance Management
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <FaFileAlt className="w-4 h-4" />
                  <span className="font-medium">{currentSession?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span>{currentSession?.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="w-4 h-4" />
                  <span>{currentSession?.startTime} - {currentSession?.endTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{processedAttendance.length}</div>
                <div className="text-sm text-gray-500">Total Attendees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentSession?.duration} minutes</div>
                <div className="text-sm text-gray-500">Session Duration</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Session
              </label>
              <select
                value={selectedSessionId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSelectedSessionId(e.target.value);
                  clearFilters();
                  setTimeout(() => {
                    if (searchInputRef.current) {
                      searchInputRef.current.focus();
                    }
                  }, 100);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                {filteredSessions.map((session: any) => {
                  const sid = session?._id ?? session?.id;
                  return (
                    <option key={sid} value={sid}>
                      {(session?.title || session?.name || 'Untitled')} - {new Date(session.startTime).toLocaleDateString()}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isSearching ? 'text-pink-500 animate-pulse' : 'text-gray-400'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name or email..."
                  defaultValue={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <FaFilter className="w-4 h-4" />
                Filters
                <FaChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-pink-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Attendance Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance Level
                  </label>
                  <select
                    value={attendanceFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAttendanceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="high">High (≥75%)</option>
                    <option value="medium">Medium (50-74%)</option>
                    <option value="low">Low (&lt;50%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision Status
                  </label>
                  <select
                    value={decisionFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDecisionFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="all">All Decisions</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => refetchAttendance && refetchAttendance()}
                  disabled={isLoadingAttendance}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSearch className="w-4 h-4" />
                  {isLoadingAttendance ? 'Loading...' : 'Apply Filters'}
                </button>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-pink-700 hover:text-pink-900 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
          <div className="p-6 border-b border-pink-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUsers className="w-5 h-5 text-pink-600" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Faculty Attendance Review</h2>
                <span className="text-sm text-gray-500 ml-2">Review and approve student attendance based on session time</span>
              </div>
              {processedAttendance.length === 0 && (
                <div className="text-sm text-gray-500">
                  No students found matching current filters
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            {(isLoadingSessions || isLoadingAttendance) && (
              <LoadingSpinner />
            )}
            <div className={(isLoadingSessions || isLoadingAttendance) ? 'pointer-events-none opacity-50' : ''}>
              {processedAttendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Spent
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sessions
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Faculty Decision
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-pink-100">
                      {processedAttendance.map((user: AttendanceUser & { totalTime: number; formattedTime: string; attendancePercentage: number; sessionData: Session, status?: string }) => (
                        <tr key={user.id} className="hover:bg-pink-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaClock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {user.formattedTime}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.intervals.length} session{user.intervals.length !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.status === 'approved' || user.status === 'approve' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">Approved</span>
                              ) : user.status === 'declined' || user.status === 'decline' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white">Declined</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white">Not updated</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAttendanceDecision(user.id.toString(), 'approve')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${getDecisionButtonStyle('approve', attendanceDecisions.get(user.id.toString()) || '', user.status)}`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAttendanceDecision(user.id.toString(), 'decline')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${getDecisionButtonStyle('decline', attendanceDecisions.get(user.id.toString()) || '', user.status)}`}
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleViewIntervals(user)}
                                className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-xs font-medium hover:bg-pink-100 transition-colors flex items-center gap-1"
                              >
                                <FaEye className="w-3 h-3" />
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-pink-200 mb-4">
                    <FaUsers className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                  <p className="text-gray-500 mb-4">
                    No students match your current filter criteria or this session has no attendees.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SessionAttendanceViewModal
        selectedUser={selectedUser}
        currentSession={currentSession}
        attendanceDecisions={attendanceDecisions}
        closeIntervalModal={closeIntervalModal}
        formatDuration={formatDuration}
        calculateTotalTime={calculateTotalTime}
        formatTime={formatTime}
        getAttendanceRecommendation={getAttendanceRecommendation}
      />
    </div>
  );
};

export default SessionAttendancePage;