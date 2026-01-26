import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdEvent,
  MdGroups,
  MdSportsSoccer,
  MdMessage,
  MdBook,
  MdNotifications,
  MdFolder,
  MdArticle,
  MdHelpCenter,
  MdLogout,
  MdPayment,
  MdSettings
} from 'react-icons/md';
import { IoSearchOutline as Search } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { RootState } from '../../../appStore/store';
import { useLogout } from '../../../application/hooks/useAuthQueries';

const sidebarItems = [
  { name: 'Dashboard', path: '/admin', icon: <MdDashboard size={20} /> },
  { name: 'User', path: '/admin/user', icon: <MdPeople size={20} /> },
  { name: 'Faculty', path: '/admin/faculty', icon: <MdSchool size={20} /> },
  { name: 'Diploma Courses', path: '/admin/diploma-courses', icon: <MdSchool size={20} /> },
  { name: 'Events', path: '/admin/events', icon: <MdEvent size={20} /> },
  { name: 'Clubs', path: '/admin/clubs', icon: <MdGroups size={20} /> },
  { name: 'Sports', path: '/admin/sports', icon: <MdSportsSoccer size={20} /> },
  { name: 'Communication Tool', path: '/admin/communication', icon: <MdMessage size={20} /> },
  { name: 'Course Management', path: '/admin/course-management', icon: <MdBook size={20} /> },
  { name: 'Notification System', path: '/admin/notifications', icon: <MdNotifications size={20} /> },
  { name: 'Material', path: '/admin/material', icon: <MdFolder size={20} /> },
  { name: 'Content', path: '/admin/content', icon: <MdArticle size={20} /> },
  { name: 'Site Management', path: '/admin/site-management', icon: <MdSettings size={20} /> },
  { name: 'Enquiry', path: '/admin/enquiry', icon: <MdHelpCenter size={20} /> },
  { name: 'Payment', path: '/admin/payment', icon: <MdPayment size={20} /> },
];

const groupedItems = [
  { category: 'Main', items: [sidebarItems[0]] },
  { category: 'People', items: [sidebarItems[1], sidebarItems[2]] },
  { category: 'Content', items: [sidebarItems[11], sidebarItems[10], sidebarItems[12]] },
  { category: 'Education', items: [sidebarItems[3], sidebarItems[8]] },
  { category: 'Activities', items: [sidebarItems[4], sidebarItems[5], sidebarItems[6]] },
  { category: 'Communication', items: [sidebarItems[7], sidebarItems[9], sidebarItems[13]] },
  { category: 'Payment', items: [sidebarItems[14]] },
];

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    groupedItems.map(group => group.category)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { mutate: logoutMutation } = useLogout();

  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const handleLogout = () => {
    logoutMutation();
  };

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth > 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredGroupedItems = groupedItems
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(group => group.items.length > 0 || collapsed);

  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      Main: 'from-purple-500 to-blue-500',
      People: 'from-blue-500 to-indigo-500',
      Content: 'from-fuchsia-500 to-pink-500',
      Education: 'from-violet-500 to-purple-500',
      Activities: 'from-cyan-500 to-blue-500',
      Communication: 'from-purple-500 to-fuchsia-500',
      Payment: 'from-indigo-500 to-blue-500',
    };
    return gradients[category] || 'from-purple-500 to-blue-500';
  };

  return (
    <>
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <button
          onClick={toggleMobileSidebar}
          className="p-3 rounded-full bg-gray-800/80 backdrop-blur-sm text-purple-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 hover:text-purple-100 transition-all duration-300 border border-purple-600/30"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-gray-900/90 backdrop-blur-lg border-r border-purple-600/30 shadow-2xl shadow-purple-600/10 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white flex items-center justify-between h-20 px-4 relative overflow-hidden border-b border-purple-600/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-purple-400/40 blur-sm"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `floatingMist ${3 + Math.random() * 4}s ease-in-out infinite ${i * 0.3}s`,
                  }}
                />
              ))}
              <div className="absolute -bottom-10 left-1/2 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2" />
            </div>

            {!collapsed && (
              <div className="relative z-10 flex items-center">
                <div className="h-10 w-10 rounded-md bg-purple-600/30 flex items-center justify-center shadow-inner shadow-purple-300/20 border border-purple-600/40">
                  <MdDashboard size={24} className="text-purple-100" />
                </div>
                <h2 className="text-xl font-bold tracking-tight ml-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-blue-100">
                  Admin Portal
                </h2>
              </div>
            )}

            <button
              onClick={toggleSidebar}
              className="relative z-10 p-2 rounded-full bg-purple-600/30 text-purple-100 hover:bg-purple-600/40 hidden lg:flex items-center justify-center transition-all duration-200 border border-purple-600/40"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
            </button>
          </div>

          {!collapsed && (
            <div className="px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 rounded-xl bg-gray-800/60 border border-purple-600/30 focus:border-purple-600/60 focus:ring-2 focus:ring-purple-600/20 transition-all outline-none text-sm text-purple-200 placeholder-gray-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-purple-300" />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-2 px-2 scroll-smooth custom-scrollbar">
            <nav className="space-y-1">
              {filteredGroupedItems.map((group) => (
                <div key={group.category} className="mb-4">
                  {!collapsed && (
                    <div
                      className="flex items-center justify-between px-4 py-2 text-xs font-semibold cursor-pointer group mb-2"
                      onClick={() => toggleCategory(group.category)}
                    >
                      <span className={`bg-gradient-to-r ${getCategoryGradient(group.category)} bg-clip-text text-transparent uppercase tracking-wider`}>
                        {group.category}
                      </span>
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 bg-gray-800/60 border border-purple-600/30
                          ${expandedCategories.includes(group.category) ? 'bg-purple-900/30' : 'bg-gray-800/60'}`}
                      >
                        <svg
                          className={`h-3.5 w-3.5 text-purple-300 transition-transform ${expandedCategories.includes(group.category) ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {collapsed && <div className="my-3 border-t border-purple-600/30 mx-2" />}
                  <div className={`space-y-1 ${!collapsed && !expandedCategories.includes(group.category) ? 'hidden' : ''}`}>
                    {group.items.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/admin'}
                        className={({ isActive }) =>
                          `flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl transition-all duration-300 relative
                          ${isActive
                            ? 'bg-gradient-to-r from-purple-600/50 to-blue-600/30 text-purple-100 font-medium border border-purple-600/30 shadow-lg shadow-purple-600/10'
                            : 'text-purple-200 border border-transparent hover:border-purple-600/20 hover:bg-purple-900/30'}`
                        }
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => window.innerWidth < 1024 && setMobileOpen(false)}
                      >
                        {({ isActive }) => (
                          <>
                            <div className={`flex items-center ${!collapsed ? 'w-full' : ''}`}>
                              <div
                                className={`relative flex-shrink-0 p-1.5 rounded-lg transition-all duration-300
                                  ${hoveredItem === item.name ? 'text-purple-300 transform scale-110' : 'text-purple-400'}`}
                              >
                                {hoveredItem === item.name && (
                                  <span className="absolute inset-0 bg-purple-600/20 rounded-lg blur-md shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                                )}
                                <span className="relative z-10">{item.icon}</span>
                              </div>
                              {!collapsed && (
                                <span className={`ml-3 text-sm transition-all duration-200 ${hoveredItem === item.name ? 'font-medium' : ''}`}>
                                  {item.name}
                                </span>
                              )}
                            </div>
                            {!collapsed && isActive && (
                              <div className="inline-flex h-2 w-2 rounded-full bg-purple-400" />
                            )}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-md transform -translate-y-1/2 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-purple-600/30 bg-gradient-to-b from-gray-900/0 to-purple-900/40 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 left-1/2 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2" />
            </div>
            <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center justify-between'} relative z-10`}>
              <div className={`flex items-center ${collapsed ? 'flex-col' : ''}`}>
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-2 ring-purple-600/30">
                    <span className="text-sm font-bold text-white">
                      {(user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || '')}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-gray-900" />
                </div>
                {!collapsed && (
                  <div className="ml-3">
                    <p className="font-medium text-purple-100">{fullName}</p>
                    <p className="text-xs text-purple-300">{user?.email}</p>
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className={`p-2 rounded-lg text-purple-300 hover:bg-purple-900/30 hover:text-purple-100 transition-colors border border-transparent hover:border-purple-600/20 ${collapsed ? 'mt-2' : ''}`}>
                <MdLogout size={collapsed ? 18 : 20} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes floatingMist {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-10px) translateX(5px);
            opacity: 0.6;
          }
        }
        @keyframes pulse {
          0% {
            opacity: 0.3;
            transform: translateY(-50%) scale(0.8);
          }
          100% {
            opacity: 0.7;
            transform: translateY(-50%) scale(1.2);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.3);
        }
      `}} />
    </>
  );
};

export default Sidebar;