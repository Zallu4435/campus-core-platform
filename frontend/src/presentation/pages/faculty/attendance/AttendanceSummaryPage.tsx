import React, { useState, useMemo, useEffect } from 'react';
import {
  FaClock,
  FaUsers,
  FaEye,
  FaFileAlt,
  FaCalendarAlt,
  FaStopwatch,
  FaSearch,
  FaCheckCircle,
  FaPercentage,
  FaUserGraduate,
  FaClock as FaTimeIcon,
  FaArrowLeft,
  FaUser
} from 'react-icons/fa';
import { useSessionManagement } from '../../../../application/hooks/useSessionManagement';
import { AttendanceInterval, AttendanceUser, Session, StudentAttendanceData } from '../../../../domain/types/faculty/attendence';
import { VideoSession } from '../../../../application/services/session.service';
import { formatTime } from '../../../../shared/utils/dateUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const AttendanceSummaryPage = () => {
  const {
    sessions,
    isLoading: isLoadingSessions,
    useSessionAttendance
  } = useSessionManagement();

  const sessionList = useMemo(() => Array.isArray(sessions) ? (sessions as VideoSession[]) : [], [sessions]);

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [, setDateRange] = useState({ start: '', end: '' });
  const [, setSelectedUser] = useState<AttendanceUser | null>(null);
  const [viewMode, setViewMode] = useState<'students' | 'details'>('students');
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendanceData | null>(null);
  const [selectedSessionForIntervals, setSelectedSessionForIntervals] = useState<StudentAttendanceData['sessionDetails'][number] | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  React.useEffect(() => {
    if (!selectedSessionId && sessionList.length > 0) {
      const first = sessionList[0];
      const firstId = first?._id ?? first?.id;
      if (firstId) setSelectedSessionId(firstId);
    }
  }, [sessionList, selectedSessionId]);

  const { data: currentAttendanceData = [] } = useSessionAttendance(selectedSessionId, { search: debouncedSearchTerm });

  const currentSession = sessionList.find((s) => (s?._id ?? s?.id) === selectedSessionId) as Session | undefined;

  const sessionAttendanceQueries: { sessionId: string, query: ReturnType<typeof useSessionAttendance> }[] = Array.isArray(sessions) ? sessions.map((session: VideoSession) => {
    const sid = session?._id ?? session?.id;
    return {
      sessionId: sid,
      query: useSessionAttendance(sid, { search: debouncedSearchTerm })
    };
  }) : [];

  const isLoadingAttendanceAllSessions = sessionAttendanceQueries.some((q) => q.query.isLoading);

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
    let data = (currentAttendanceData || [])
      .filter((user: AttendanceUser) =>
        user.status === 'approved' || user.status === 'approve'
      )
      .map((user: AttendanceUser) => {
        const totalTime = calculateTotalTime(user.intervals, currentSession?.endTime);
        const attendancePercentage = calculateAttendancePercentage(totalTime, currentSession);
        return {
          ...user,
          totalTime,
          formattedTime: formatDuration(totalTime),
          attendancePercentage,
          sessionData: currentSession
        };
      });
    return data;
  }, [currentAttendanceData, currentSession]);

  const summaryStats = useMemo(() => {
    if (!processedAttendance.length) return null;

    const totalUsers = processedAttendance.length;
    const avgAttendance = processedAttendance.reduce((sum: number, user: AttendanceUser & { attendancePercentage: number }) => sum + user.attendancePercentage, 0) / totalUsers;
    const highAttendance = processedAttendance.filter((user: AttendanceUser & { attendancePercentage: number }) => user.attendancePercentage >= 75).length;
    const totalTimeSpent = processedAttendance.reduce((sum: number, user: AttendanceUser & { totalTime: number }) => sum + user.totalTime, 0);

    return {
      totalUsers,
      avgAttendance: Math.round(avgAttendance),
      highAttendance,
      totalTimeSpent: formatDuration(totalTimeSpent),
      attendanceDistribution: {
        high: processedAttendance.filter((user: AttendanceUser & { attendancePercentage: number }) => user.attendancePercentage >= 75).length,
        medium: processedAttendance.filter((user: AttendanceUser & { attendancePercentage: number }) => user.attendancePercentage >= 50 && user.attendancePercentage < 75).length,
        low: processedAttendance.filter((user: AttendanceUser & { attendancePercentage: number }) => user.attendancePercentage < 50).length
      }
    };
  }, [processedAttendance]);


  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  const closeIntervalModal = () => {
    setSelectedUser(null);
    setSelectedSessionForIntervals(null);
  };

  const handleViewSessionIntervals = (session: StudentAttendanceData['sessionDetails'][number]) => {
    setSelectedSessionForIntervals(session);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    if (status === 'approved' || status === 'approve') return 'text-green-600 bg-green-100';
    if (status === 'declined' || status === 'decline') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };


  const studentsAttendanceData = useMemo(() => {
    const studentMap = new Map<string, StudentAttendanceData>();

    sessionAttendanceQueries.forEach(({ sessionId, query }) => {
      const session = sessionList.find((s) => s._id === sessionId);
      if (!session || !query.data) return;

      const attendanceData = query.data as AttendanceUser[];

      attendanceData.forEach((user: AttendanceUser) => {
        const studentId = user.id.toString();
        const totalTime = calculateTotalTime(user.intervals, session?.endTime);
        const attendancePercentage = calculateAttendancePercentage(totalTime, session as Session);

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            studentId,
            studentName: user.username,
            studentEmail: user.email,
            totalSessions: 0,
            totalTimeSpent: 0,
            averageAttendance: 0,
            approvedSessions: 0,
            declinedSessions: 0,
            pendingSessions: 0,
            sessionDetails: []
          });
        }

        const studentData = studentMap.get(studentId)!;
        studentData.totalSessions++;
        studentData.totalTimeSpent += totalTime;

        if (user.status === 'approved' || user.status === 'approve') {
          studentData.approvedSessions++;
        } else if (user.status === 'declined' || user.status === 'decline') {
          studentData.declinedSessions++;
        } else {
          studentData.pendingSessions++;
        }

        studentData.sessionDetails.push({
          sessionId,
          sessionTitle: (session as any).title || (session as any).name || 'Untitled Session',
          sessionDate: (session as any).startTime ? new Date((session as any).startTime).toLocaleDateString() : 'N/A',
          timeSpent: totalTime,
          attendancePercentage,
          status: user.status || 'pending',
          intervals: user.intervals
        });
      });
    });

    studentMap.forEach(student => {
      student.averageAttendance = Math.round(
        student.sessionDetails.reduce((sum, session) => sum + session.attendancePercentage, 0) / student.sessionDetails.length
      );
    });

    return Array.from(studentMap.values());
  }, [sessionAttendanceQueries, sessions]);

  const filteredStudents = useMemo(() => {
    return studentsAttendanceData;
  }, [studentsAttendanceData]);

  const handleStudentClick = (student: StudentAttendanceData) => {
    setSelectedStudent(student);
    setViewMode('details');
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setViewMode('students');
  };

  if (viewMode === 'details' && selectedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="inline-flex items-center space-x-3 bg-white/95 backdrop-blur-xl rounded-3xl px-8 py-6 shadow-2xl border border-pink-100">
              <button
                onClick={handleBackToStudents}
                className="p-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {selectedStudent.studentName}'s Attendance Details
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaUser className="w-4 h-4" />
                    <span>{selectedStudent.studentEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>{selectedStudent.totalSessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPercentage className="w-4 h-4" />
                    <span>{selectedStudent.averageAttendance}% average</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalSessions}</p>
                </div>
                <FaCalendarAlt className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.averageAttendance}%</p>
                </div>
                <FaPercentage className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Sessions</p>
                  <p className="text-2xl font-bold text-yellow-600">{selectedStudent.approvedSessions}</p>
                </div>
                <FaCheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Time</p>
                  <p className="text-2xl font-bold text-purple-600">{formatDuration(selectedStudent.totalTimeSpent)}</p>
                </div>
                <FaTimeIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <FaFileAlt className="w-5 h-5 text-pink-600" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Session Attendance Details</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-100">
                  {selectedStudent.sessionDetails.map((session, index) => (
                    <tr key={index} className="hover:bg-pink-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{session.sessionTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{session.sessionDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaStopwatch className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{formatDuration(session.timeSpent)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(session.attendancePercentage)}`}>{session.attendancePercentage}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>{session.status === 'approved' || session.status === 'approve' ? 'Approved' : session.status === 'declined' || session.status === 'decline' ? 'Declined' : 'Pending'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewSessionIntervals(session)}
                          className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-xs font-medium hover:bg-pink-100 transition-colors flex items-center gap-1"
                        >
                          <FaEye className="w-3 h-3" />
                          View Intervals
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedSessionForIntervals && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-pink-100">
              <div className="p-6 border-b border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Session Intervals for {selectedStudent?.studentName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedSessionForIntervals.sessionTitle} - {selectedSessionForIntervals.sessionDate}</p>
                    <p className="text-sm text-gray-500 mt-1">Total time: {formatDuration(selectedSessionForIntervals.timeSpent)} ({selectedSessionForIntervals.attendancePercentage}% attendance)</p>
                  </div>
                  <button
                    onClick={closeIntervalModal}
                    className="text-gray-400 hover:text-pink-500 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto bg-white/80">
                <div className="space-y-4">
                  {selectedSessionForIntervals.intervals.map((interval: AttendanceInterval, index: number) => {
                    let intervalDuration = 0;
                    if (interval.joinedAt) {
                      const joinTime = new Date(interval.joinedAt);
                      let leaveTime: Date;
                      if (interval.leftAt) {
                        leaveTime = new Date(interval.leftAt);
                      } else {
                        leaveTime = new Date();
                      }
                      if (!isNaN(joinTime.getTime()) && !isNaN(leaveTime.getTime()) && leaveTime > joinTime) {
                        intervalDuration = leaveTime.getTime() - joinTime.getTime();
                      }
                    }
                    return (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-pink-100 shadow flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow">{index + 1}</div>
                          <div>
                            <div className="text-base font-semibold text-gray-900">Interval {index + 1}</div>
                            <div className="text-xs text-gray-500">{interval.joinedAt ? formatTime(interval.joinedAt) : 'Invalid'} - {interval.leftAt ? formatTime(interval.leftAt) : 'Now'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            <FaClock className="w-3 h-3 mr-1" />
                            {formatDuration(intervalDuration)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Duration</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="inline-flex items-center space-x-3 bg-white/95 backdrop-blur-xl rounded-3xl px-8 py-6 shadow-2xl border border-pink-100">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-3xl"><FaUsers /></span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Student Attendance Summary</h1>
              <p className="text-gray-600">Click on a student to view their detailed attendance across all sessions</p>
            </div>
          </div>
        </div>

        {summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{summaryStats.totalUsers}</p>
                </div>
                <FaUserGraduate className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                  <p className="text-2xl font-bold text-green-600">{summaryStats.avgAttendance}%</p>
                </div>
                <FaPercentage className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Attendance</p>
                  <p className="text-2xl font-bold text-yellow-600">{summaryStats.highAttendance}</p>
                </div>
                <FaCheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Time</p>
                  <p className="text-2xl font-bold text-purple-600">{summaryStats.totalTimeSpent}</p>
                </div>
                <FaTimeIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
          <div className="p-6 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <FaUsers className="w-5 h-5 text-pink-600" />
              <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Students</h2>
              <span className="text-sm text-gray-500 ml-2">Click on a student to view their attendance details</span>
            </div>
          </div>

          <div className="relative">
            {(isLoadingSessions || isLoadingAttendanceAllSessions) && (
              <LoadingSpinner />
            )}
            <div className={(isLoadingSessions || isLoadingAttendanceAllSessions) ? 'pointer-events-none opacity-50' : ''}>
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sessions</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Attendance</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Sessions</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-pink-100">
                      {filteredStudents.map((student) => (
                        <tr key={student.studentId} className="hover:bg-pink-50 transition-colors cursor-pointer" onClick={() => handleStudentClick(student)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">{student.studentName.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{student.studentEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.totalSessions}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(student.averageAttendance)}`}>{student.averageAttendance}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.approvedSessions}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaStopwatch className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{formatDuration(student.totalTimeSpent)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStudentClick(student);
                              }}
                              className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-xs font-medium hover:bg-pink-100 transition-colors flex items-center gap-1"
                            >
                              <FaEye className="w-3 h-3" />
                              View Details
                            </button>
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
                  <p className="text-gray-500 mb-4">No students match your search criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryPage; 