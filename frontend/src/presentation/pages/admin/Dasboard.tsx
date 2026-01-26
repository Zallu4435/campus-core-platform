import { useState, useEffect } from 'react';
import { useAdminDashboard } from '../../../application/hooks/useAdminDashboard';
import StatsCard from '../../components/admin/dashboard/StatsCard';
import GlassPanel from '../../components/admin/dashboard/GlassPanel';
import PerformanceMatrix from '../../components/admin/dashboard/PerformanceMatrix';
import RecentActivities from '../../components/admin/dashboard/RecentActivities';
import SystemAlerts from '../../components/admin/dashboard/SystemAlerts';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import {
  HiUsers as HiUsersIcon,
  HiBookOpen as HiBookOpenIcon,
  HiClock as HiClockIcon,
  HiBell as HiBellIcon,
  HiTrendingUp as HiTrendingUpIcon,
  HiCheckCircle as HiCheckCircleIcon,
  HiExclamationCircle as HiExclamationCircleIcon,
  HiLightningBolt as HiLightningBoltIcon,
  HiSparkles as HiSparklesIcon,
} from 'react-icons/hi';
import {
  GiOnTarget as GiOnTargetIcon,
  GiTwoCoins as GiTwoCoinsIcon
} from 'react-icons/gi';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    metrics,
    userGrowth,
    revenue,
    performance,
    activities,
    alerts,
    isLoading: hookLoading,
    error,
    refreshDashboard,
    dismissAlert,
  } = useAdminDashboard();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const userGrowthData = userGrowth || [];
  const revenueData = revenue || [];
  const performanceData = performance || [];
  const activitiesData = activities || [];
  const alertsData = alerts || [];

  const safeUserGrowthData = Array.isArray(userGrowthData) ? userGrowthData : [];
  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
  const safePerformanceData = Array.isArray(performanceData) ? performanceData : [];
  const safeActivitiesData = Array.isArray(activitiesData) ? activitiesData : [];
  const safeAlertsData = Array.isArray(alertsData) ? alertsData : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <HiCheckCircleIcon className="h-5 w-5 text-emerald-400 mt-0.5" />;
      case 'warning': return <HiExclamationCircleIcon className="h-5 w-5 text-amber-400 mt-0.5" />;
      case 'error': return <HiExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5" />;
      default: return <HiBellIcon className="h-5 w-5 text-blue-400 mt-0.5" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-900/30';
      case 'warning': return 'bg-amber-900/30';
      case 'error': return 'bg-red-900/30';
      default: return 'bg-blue-900/30';
    }
  };

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-emerald-400';
      case 'warning': return 'border-amber-400';
      case 'error': return 'border-red-400';
      default: return 'border-blue-400';
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-200';
      case 'warning': return 'text-amber-200';
      case 'error': return 'text-red-200';
      default: return 'text-blue-200';
    }
  };

  const getAlertSubtextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-300';
      case 'warning': return 'text-amber-300';
      case 'error': return 'text-red-300';
      default: return 'text-blue-300';
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshDashboard();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  };


  if (loading || hookLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message || 'Error loading dashboard'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/10 blur-md"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingMist ${Math.random() * 15 + 20}s ease-in-out infinite ${Math.random() * 5
                }s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 mt-2">Welcome back! Here's what's happening at your institution.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-purple-500/20 hover:bg-gray-700/50 transition-colors">
                  <HiSparklesIcon className="h-5 w-5 text-purple-400" />
                </div>
              </button>
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-500/20">
                  <p className="text-sm font-medium text-gray-300">Current Time</p>
                  <p className="text-lg font-bold text-white">{currentTime.toLocaleTimeString()}</p>
                  <p className="text-sm text-gray-400">{currentTime.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={metrics ? formatNumber(metrics.totalUsers) : '0'}
            subtitle="Students & Faculty"
            trend="+5%"
            icon={HiUsersIcon}
            bgGradient="bg-gradient-to-br from-purple-600 to-purple-800"
            iconBg="bg-gradient-to-br from-purple-600 to-purple-800"
            trendUp={true}
            delay={0}
            loading={loading}
          />
          <StatsCard
            title="Total Revenue"
            value={metrics ? formatCurrency(metrics.totalRevenue) : '₹0'}
            subtitle="This month"
            trend="+12%"
            icon={GiTwoCoinsIcon}
            bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
            iconBg="bg-gradient-to-br from-emerald-600 to-emerald-800"
            trendUp={true}
            delay={100}
            loading={loading}
          />
          <StatsCard
            title="Active Courses"
            value={metrics ? formatNumber(metrics.activeCourses) : '0'}
            subtitle="Currently running"
            trend="+3"
            icon={HiBookOpenIcon}
            bgGradient="bg-gradient-to-br from-blue-600 to-blue-800"
            iconBg="bg-gradient-to-br from-blue-600 to-blue-800"
            trendUp={true}
            delay={200}
            loading={loading}
          />
          <StatsCard
            title="Pending Approvals"
            value={metrics ? formatNumber(metrics.pendingApprovals) : '0'}
            subtitle="Requires attention"
            trend="-2"
            icon={HiClockIcon}
            bgGradient="bg-gradient-to-br from-amber-600 to-orange-700"
            iconBg="bg-gradient-to-br from-amber-600 to-orange-700"
            trendUp={false}
            delay={300}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassPanel title="User Growth & Targets" icon={HiTrendingUpIcon}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={safeUserGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    color: '#F9FAFB'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fill="url(#colorUsers)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10B981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassPanel>

          <GlassPanel title="Revenue Breakdown" icon={GiTwoCoinsIcon}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="tuition" stackId="a" fill="#8B5CF6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="fees" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="other" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassPanel>
        </div>

        <div className="mb-8">
          <GlassPanel title="Module Performance Metrics" icon={GiOnTargetIcon}>
            <PerformanceMatrix performanceData={safePerformanceData} />
          </GlassPanel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassPanel title="Recent Activities" icon={HiLightningBoltIcon}>
            <RecentActivities activitiesData={safeActivitiesData} />
          </GlassPanel>

          <GlassPanel title="System Alerts" icon={HiBellIcon}>
            <SystemAlerts
              alertsData={safeAlertsData}
              getAlertIcon={getAlertIcon}
              getAlertBgColor={getAlertBgColor}
              getAlertBorderColor={getAlertBorderColor}
              getAlertTextColor={getAlertTextColor}
              getAlertSubtextColor={getAlertSubtextColor}
              dismissAlert={handleDismissAlert}
            />
          </GlassPanel>
        </div>
      </div>

      <style>{`
        @keyframes floatingMist {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(15px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;