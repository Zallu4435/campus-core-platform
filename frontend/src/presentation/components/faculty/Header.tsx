import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBell, LuLogOut, LuSearch, LuUser, LuUsers, LuBookOpen, LuCalendar, LuX } from 'react-icons/lu';
import NotificationModal from '../common/NotificationModal';
import { useNotificationManagement } from '../../../application/hooks/useNotificationManagement';
import { HeaderProps, SearchResult, facultySearchItems } from '../../../shared/utils/facultyHeader';

export default function Header({ currentDate, facultyName, onLogout, setActiveTab, profilePicture }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  const { notifications } = useNotificationManagement();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = facultySearchItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
      setFocusedResultIndex(-1);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    // Update sidebar active tab based on the destination
    if (setActiveTab) {
      const pathToTabMap: { [key: string]: string } = {
        '/faculty': 'Dashboard',
        '/faculty/sessions': 'My Sessions',
        '/faculty/assignments': 'Assignments',
        '/faculty/attendance': 'Attendance',
        '/faculty/attendance-summary': 'Attendance Summary',
        '/faculty/settings': 'Settings',
        '/faculty/attendance/summary': 'Attendance Summary',
        '/faculty/assignments/grading': 'Assignments',
        '/faculty/sessions/records': 'My Sessions',
        '/faculty/students': 'Dashboard',
        '/faculty/students/progress': 'Dashboard',
        '/faculty/courses': 'Dashboard',
        '/faculty/courses/materials': 'Dashboard',
        '/faculty/reports': 'Dashboard',
        '/faculty/grades': 'Dashboard'
      };

      const targetTab = pathToTabMap[result.path];
      if (targetTab) {
        setActiveTab(targetTab);
      }
    }

    navigate(result.path);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setFocusedResultIndex(-1);
    setSearchFocused(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedResultIndex(prev =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedResultIndex(prev =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedResultIndex >= 0 && searchResults[focusedResultIndex]) {
        handleSearchResultSelect(searchResults[focusedResultIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchQuery('');
      setSearchResults([]);
      setFocusedResultIndex(-1);
      setSearchFocused(false);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setSearchFocused(false);
      setShowSearchResults(false);
    }, 200);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl h-20 px-8 flex justify-between items-center shadow-lg shadow-indigo-100/50 fixed top-0 left-72 w-[calc(100%-18rem)] z-50 border-b border-white/20">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 opacity-60"></div>

      <div className="relative z-10 flex items-center space-x-6">
        <div className="relative">
          <div className="relative">
            <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <img src="/images/university-logo.png" alt="VAGO Logo" className="w-8 h-8 object-contain" />
              VAGO Faculty
            </h2>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-indigo-600 font-medium">{currentDate}</p>
              <div className="h-4 w-px bg-gradient-to-b from-indigo-300 to-purple-300"></div>
              <p className="text-sm text-gray-600 font-mono">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex justify-center max-w-2xl mx-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search faculty features..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={handleSearchBlur}
            onKeyDown={handleSearchKeyDown}
            className="bg-white/90 backdrop-blur-sm rounded-full pl-12 pr-6 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-lg border border-white/50"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <LuSearch size={18} className={`transition-colors duration-200 ${searchFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-h-96 overflow-y-auto z-50">
              <div className="p-2">
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchResultSelect(result)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${index === focusedResultIndex
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'
                      : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                      }`}
                    onMouseEnter={() => setFocusedResultIndex(index)}
                  >
                    <div className={`p-2 rounded-lg ${index === focusedResultIndex
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      } transition-all duration-200`}>
                      {result.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-800">{result.title}</div>
                      <div className="text-sm text-gray-500">{result.description}</div>
                      <div className="text-xs text-indigo-600 font-medium mt-1">{result.category}</div>
                    </div>
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {showSearchResults && searchQuery.trim().length > 0 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 z-50">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <LuSearch className="text-gray-400" size={20} />
                </div>
                <p className="text-gray-500 font-medium">No results found</p>
                <p className="text-gray-400 text-sm mt-1">Try searching with different keywords</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {searchFocused && searchQuery.trim().length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 z-50">
              <p className="text-sm text-gray-500 mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <LuUsers className="w-4 h-4" />, label: 'Attendance', path: '/faculty/attendance' },
                  { icon: <LuBookOpen className="w-4 h-4" />, label: 'Assignments', path: '/faculty/assignments' },
                  { icon: <LuCalendar className="w-4 h-4" />, label: 'Sessions', path: '/faculty/sessions' },
                  { icon: <LuX className="w-4 h-4" />, label: 'Reports', path: '/faculty/reports' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setSearchFocused(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-sm text-indigo-700 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Notifications and Profile */}
      <div className="relative z-10 flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all duration-200 shadow-lg border border-white/50"
          >
            <LuBell size={20} className="text-pink-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-black text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationModal
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full pl-2 pr-6 py-2 hover:bg-white transition-all duration-200 shadow-lg border border-white/50"
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt={facultyName} className="w-full h-full object-cover" />
                ) : (
                  getInitials(facultyName)
                )}
              </div>
            </div>
            <div className="text-left">
              <span className="text-gray-800 font-semibold block">{facultyName}</span>
              <span className="text-xs text-gray-500">Faculty</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(facultyName)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{facultyName}</p>
                    <p className="text-sm text-gray-500">Faculty Member</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {[
                  { icon: <LuUser size={16} />, label: 'My Profile', color: 'text-indigo-600', action: () => navigate('/faculty/settings') },
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="flex items-center space-x-3 w-full px-3 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-200"
                  >
                    <span className={`${item.color}`}>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <LuLogOut size={16} />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
