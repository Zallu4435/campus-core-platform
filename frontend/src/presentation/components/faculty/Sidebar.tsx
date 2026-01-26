import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  LuList, LuClock, LuCalendar, LuBookOpen, LuSettings,
  LuLogOut, LuGraduationCap, LuChevronRight, LuStar, LuTrendingUp,
  LuAward, LuFileText
} from 'react-icons/lu';
import { useLogout } from '../../../application/hooks/useAuthQueries';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  facultyName: string;
  department: string;
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | 'logout' | null>(null);
  const navigate = useNavigate();
  const { mutate: logoutMutation } = useLogout();

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  const navItems = [
    {
      title: 'Dashboard',
      icon: <LuList size={20} />,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Overview & Analytics',
      path: '/faculty'
    },
    {
      title: 'My Sessions',
      icon: <LuClock size={20} />,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Manage Classes',
      path: '/faculty/sessions'
    },
    {
      title: 'Assignments',
      icon: <LuFileText size={20} />,
      gradient: 'from-amber-500 to-orange-500',
      description: 'Manage Assignments',
      path: '/faculty/assignments'
    },
    {
      title: 'Attendance',
      icon: <LuCalendar size={20} />,
      gradient: 'from-green-500 to-emerald-500',
      description: 'Track Presence',
      path: '/faculty/attendance'
    },
    {
      title: 'Attendance Summary',
      icon: <LuBookOpen size={20} />,
      gradient: 'from-indigo-500 to-blue-500',
      description: 'Reports & Data',
      path: '/faculty/attendance-summary'
    },
    {
      title: 'Settings',
      icon: <LuSettings size={20} />,
      gradient: 'from-gray-500 to-slate-500',
      description: 'Preferences',
      path: '/faculty/settings'
    },
  ];

  const achievements = [
    { title: 'Excellent Teacher', icon: <LuAward size={16} />, color: 'text-yellow-400' },
    { title: 'Perfect Attendance', icon: <LuTrendingUp size={16} />, color: 'text-green-400' },
    { title: 'Student Favorite', icon: <LuStar size={16} />, color: 'text-pink-400' },
    { title: 'Innovation Award', icon: <LuGraduationCap size={16} />, color: 'text-purple-400' },
  ];

  const handleNavigation = (path: string, title: string) => {
    setActiveTab(title);
    navigate(path);
  };

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-24' : 'w-72'} transition-all duration-300 ease-in-out z-30`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-95"></div>

      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative h-full flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                  <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-8 w-8 rounded-lg flex items-center justify-center">
                    <LuGraduationCap size={20} className="text-white" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-white">EduDashboard</h1>
                  <p className="text-indigo-200 text-xs font-medium">Faculty Portal</p>
                </div>
              )}
            </div>
            <button
              onClick={handleCollapse}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/70 hover:text-white"
            >
              <LuChevronRight
                size={16}
                className={`transform transition-all duration-300 ease-in-out ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!isCollapsed && (
            <p className="text-indigo-300 text-xs uppercase font-bold tracking-wider mb-4 px-2">
              Main Menu
            </p>
          )}
          <nav>
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(item.path, item.title)}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group relative flex items-center w-full text-left px-4 py-4 rounded-2xl transition-all duration-200 ${activeTab === item.title
                        ? `bg-gradient-to-r ${item.gradient} text-white font-bold shadow-lg`
                        : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <div className="relative z-10 flex items-center w-full">
                      <span className="mr-3">
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <div className="flex-1">
                          <span className="block font-medium">{item.title}</span>
                          <span className="text-xs opacity-70">{item.description}</span>
                        </div>
                      )}
                      {!isCollapsed && activeTab === item.title && (
                        <LuChevronRight size={16} className="ml-auto" />
                      )}
                    </div>

                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && hoveredItem === index && (
                      <div className="absolute left-full ml-4 px-4 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap z-50">
                        {item.title}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-r-black/90 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Achievement Badge */}
          {!isCollapsed && (
            <div className="mt-6">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-500/30">
                <div className="flex items-center space-x-2 mb-2">
                  <LuStar size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">Achievement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`${achievements[0].color}`}>
                    {achievements[0].icon}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {achievements[0].title}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => logoutMutation()}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="group flex items-center w-full text-left px-4 py-4 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
          >
            <span className="mr-3">
              <LuLogOut size={20} />
            </span>
            {!isCollapsed && <span className="font-medium">Log Out</span>}

            {/* Tooltip for collapsed mode */}
            {isCollapsed && hoveredItem === 'logout' && (
              <div className="absolute left-full ml-4 px-4 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap z-50">
                Log Out
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-r-black/90 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  facultyName: PropTypes.string.isRequired,
  department: PropTypes.string.isRequired,
  onCollapse: PropTypes.func
};

