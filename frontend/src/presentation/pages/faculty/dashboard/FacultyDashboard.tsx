import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers, HiDocumentText,
  HiPlay, HiPlus,
  HiClock, HiExclamationCircle,
} from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useFacultyDashboard } from '../../../../application/hooks/useFacultyDashboard';
import StatsCard from './components/StatsCard';
import ChartCard from './components/ChartCard';
import ActionCard from './components/ActionCard';
import InfoCard from './components/InfoCard';
import StatusCard from './components/StatusCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import Toast from './components/Toast';



const FacultyDashboard: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const navigate = useNavigate();

  const {
    stats,
    weeklyAttendance,
    assignmentPerformance,
    sessionDistribution,
    recentActivities,
    isLoading,
    hasError
  } = useFacultyDashboard();

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'Session Start':
          navigate('/faculty/sessions');
          break;

        case 'Assignment Creation':
          navigate('/faculty/assignments');
          break;

        case 'Attendance Management':
          navigate('/faculty/attendance');
          break;

        case 'Report Export':
          showToast('Report export functionality coming soon!');
          break;

        default:
          showToast(`${action} initiated successfully!`);
      }
    } catch (error) {
      showToast(`Error: ${error}`, 'error');
    }
  };

  if (hasError) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HiExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard data.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)]?.map((_, i) => (
                <LoadingSkeleton key={i} className="h-32 rounded-3xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)]?.map((_, i) => (
                <LoadingSkeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100">
                <StatsCard
                  title="Total Sessions"
                  value={stats?.totalSessions || 0}
                  icon={HiClock}
                  color="blue"
                />
              </div>
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100">
                <StatsCard
                  title="Total Assignments"
                  value={stats?.totalAssignments || 0}
                  icon={HiDocumentText}
                  color="green"
                />
              </div>
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100">
                <StatsCard
                  title="Total Attendance"
                  value={stats?.totalAttendance || 0}
                  icon={HiUsers}
                  color="orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100">
                <ChartCard title={<span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-lg font-semibold">Weekly Attendance Trend</span>}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={Array.isArray(weeklyAttendance) ? weeklyAttendance : []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100">
                <ChartCard title={<span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-lg font-semibold">Assignment Performance</span>}>
                  <ResponsiveContainer width="100%" height={200}>
                    {Array.isArray(assignmentPerformance) && assignmentPerformance.length > 0 ? (
                      <BarChart data={assignmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="assignment" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#10B981" />
                      </BarChart>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <HiDocumentText className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">No assignment data available</p>
                          <p className="text-xs">Create and publish assignments to see performance data</p>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100">
                <ChartCard title={<span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-lg font-semibold">Session Distribution</span>}>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={Array.isArray(sessionDistribution) ? sessionDistribution : []}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(Array.isArray(sessionDistribution) ? sessionDistribution : [])?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ActionCard
                title="Start Session"
                description="Begin a new teaching session"
                icon={HiPlay}
                onClick={() => handleAction('Session Start')}
                color="blue"
              />
              <ActionCard
                title="Create Assignment"
                description="Add new assignment for students"
                icon={HiPlus}
                onClick={() => handleAction('Assignment Creation')}
                color="green"
              />
              <ActionCard
                title="Attendance"
                description="View and manage student attendance"
                icon={HiUsers}
                onClick={() => handleAction('Attendance Management')}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100">
                <InfoCard title={<span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-lg font-semibold">Recent Activity</span>} expandable={true}>
                  <div className="space-y-3">
                    {(Array.isArray(recentActivities) ? recentActivities : [])?.map((activity) => (
                      <StatusCard
                        key={activity.id}
                        title={activity.type.charAt(0).toUpperCase() + activity.type?.slice(1)}
                        status={activity.type === 'system' ? 'warning' : 'success'}
                        message={activity.message}
                        timestamp={activity.time}
                      />
                    ))}
                  </div>
                </InfoCard>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;