import { useState, useEffect, useRef } from 'react';
import { FaBell, FaSearch, FaBars, FaTimes, FaCog, FaQuestionCircle, FaSignOutAlt, FaUserAlt, FaExchangeAlt, FaChalkboardTeacher, FaTachometerAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePreferences } from '../../../application/context/PreferencesContext';
import { useNotificationManagement } from '../../../application/hooks/useNotificationManagement';
import NotificationModal from '../common/NotificationModal';
import { DropdownAction, HeaderProps, searchableItems } from '../../../shared/utils/header.tsx';
import type { SearchResult } from '../../../shared/utils/header.tsx';


export default function Header({ mobileMenuOpen, setMobileMenuOpen, onLogout, userName, profilePicture }: HeaderProps) {
  const dashboardTabs = ['Dashboard', 'Academics', 'Financial', 'Communication', 'Campus Life'];
  const canvasTabs = ['Dashboard', 'Diploma Course', 'Chat', 'Video Class', 'Materials', 'Assignments'];
  const location = useLocation();
  const navigate = useNavigate();
  const { styles, theme } = usePreferences();
  const { notifications } = useNotificationManagement();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCanvas = location.pathname.includes('/canvas');
  const tabs = isCanvas ? canvasTabs : dashboardTabs;
  const portalName = 'VAGO';

  const getTabPath = (tab: string) => {
    if (!isCanvas) {
      switch (tab) {
        case 'Dashboard': return '/dashboard';
        case 'Academics': return '/dashboard/academics';
        case 'Financial': return '/dashboard/financial';
        case 'Communication': return '/dashboard/communication';
        case 'Campus Life': return '/dashboard/campus-life';
        default: return '';
      }
    } else {
      switch (tab) {
        case 'Dashboard': return '/canvas';
        case 'Diploma Course': return '/canvas/diploma-course';
        case 'Chat': return '/canvas/chat';
        case 'Video Class': return '/canvas/video-class';
        case 'Materials': return '/canvas/materials';
        case 'Assignments': return '/canvas/assignments';
        case 'Sessions': return '/canvas/sessions';
        default: return '';
      }
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = searchableItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearchDropdownOpen(true);
      setFocusedResultIndex(-1);
    } else {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    }
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchDropdownOpen(false);
    setFocusedResultIndex(-1);
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
      setIsSearchDropdownOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setFocusedResultIndex(-1);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleDropdownAction = (action: DropdownAction) => {
    setIsProfileDropdownOpen(false);
    if (action === 'logout') {
      onLogout();
    } else if (action === 'settings') {
      navigate('/settings');
    } else if (action === 'help') {
      navigate('/help');
    }
  };

  const handlePortalToggle = () => {
    if (isCanvas) {
      navigate('/dashboard');
    } else {
      navigate('/canvas');
    }
  };

  const unreadCount = notifications.filter(n => !(n).isRead).length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setFocusedResultIndex(-1);
      }

      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`relative z-[9998] ${styles.backgroundSecondary} shadow-2xl border-b ${styles.borderSecondary}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br ${styles.orb.secondary} rounded-full blur-xl animate-pulse`}></div>
        <div className={`absolute top-8 right-16 w-16 h-16 bg-gradient-to-br ${styles.orb.primary} rounded-full blur-lg animate-pulse delay-700`}></div>
        <div className={`absolute bottom-4 left-1/3 w-20 h-20 bg-gradient-to-br ${styles.orb.secondary} rounded-full blur-xl animate-pulse delay-1000`}></div>
      </div>

      <div className={`absolute inset-0 bg-gradient-to-r ${styles.accent} opacity-20 backdrop-blur-md`}></div>

      <div className="container mx-auto py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-3 group">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-all duration-300`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <img src="/images/university-logo.png" alt="VAGO Logo" className="w-8 h-8 object-contain relative z-10" />
              </div>
              <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            <div className="hidden md:block">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                {portalName}
              </h1>
              <div className={`h-0.5 w-0 bg-gradient-to-r ${styles.accent} group-hover:w-full transition-all duration-500`}></div>
            </div>
          </div>

          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-3 rounded-xl ${styles.card.background} backdrop-blur-md ${styles.card.hover} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen
              ? <FaTimes className={`${styles.icon.primary}`} size={20} />
              : <FaBars className={`${styles.icon.primary}`} size={20} />}
          </button>

          <div className="relative group md:hidden flex-1 mx-2">
            <button
              onClick={handlePortalToggle}
              className={`relative w-full px-4 py-3 rounded-xl ${styles.card.background} backdrop-blur-md ${styles.card.hover} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2`}
              aria-label={`Switch to ${isCanvas ? 'Dashboard' : 'Canvas'}`}
            >
              <div className={`p-1.5 rounded-xl bg-gradient-to-br ${isCanvas ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-indigo-500'} shadow-lg`}>
                {isCanvas ? (
                  <FaTachometerAlt className="text-white w-4 h-4" />
                ) : (
                  <FaChalkboardTeacher className="text-white w-4 h-4" />
                )}
              </div>
              <span className={`text-sm font-medium ${styles.textPrimary}`}>
                {isCanvas ? 'Dashboard' : 'Canvas'}
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group" ref={searchRef}>
              <div className={`absolute -inset-1 bg-gradient-to-r ${styles.orb.primary} rounded-full blur opacity-25 group-hover:opacity-75 transition-opacity duration-300`}></div>
              <div className={`relative ${styles.card.background} backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border ${styles.border}`}>
                <div className="flex items-center space-x-3">
                  <FaSearch className={`${styles.icon.primary} group-hover:scale-110 transition-transform duration-200`} size={18} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0 && searchResults.length > 0) {
                        setIsSearchDropdownOpen(true);
                      }
                    }}
                    className={`bg-transparent ${styles.textPrimary} placeholder-${styles.textSecondary.replace('text-', '')} focus:outline-none w-64 font-medium`}
                    aria-label="Search"
                  />
                </div>
              </div>

              {/* Search Results Dropdown */}
              {isSearchDropdownOpen && (
                <div className={`absolute top-full left-0 right-0 mt-2 ${styles.card.background} backdrop-blur-xl rounded-2xl shadow-2xl z-50 border ${styles.border} max-h-96 overflow-y-auto`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary} opacity-50`}></div>
                  <div className="relative z-10 p-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <button
                          key={result.id}
                          onClick={() => handleSearchResultSelect(result)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${index === focusedResultIndex
                            ? `${styles.button.primary} shadow-lg`
                            : `${styles.textPrimary} ${styles.card.hover}`
                            }`}
                          onMouseEnter={() => setFocusedResultIndex(index)}
                        >
                          <div className={`p-2 rounded-lg ${styles.button.secondary} group-hover:scale-110 transition-transform duration-200`}>
                            {result.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{result.title}</div>
                            <div className={`text-sm ${styles.textSecondary}`}>{result.category}</div>
                          </div>
                          <div className={`w-2 h-2 bg-gradient-to-br ${styles.accent} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200`}></div>
                        </button>
                      ))
                    ) : (
                      <div className="flex items-center justify-center px-4 py-8">
                        <div className="text-center">
                          <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${styles.button.secondary} flex items-center justify-center`}>
                            <FaSearch className={`${styles.icon.primary} opacity-50`} size={20} />
                          </div>
                          <p className={`${styles.textSecondary} font-medium`}>No results found</p>
                          <p className={`${styles.textSecondary} text-sm mt-1`}>Try searching with different keywords</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-r ${isCanvas ? 'from-purple-400 to-blue-400' : 'from-blue-400 to-indigo-400'} rounded-2xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-300`}></div>
              <button
                onClick={handlePortalToggle}
                className={`relative ${styles.card.background} backdrop-blur-xl rounded-2xl px-6 py-3 shadow-lg border ${styles.border} ${styles.card.hover} transition-all duration-300 hover:shadow-xl transform hover:scale-105 group`}
                aria-label={`Switch to ${isCanvas ? 'Dashboard' : 'Canvas'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${isCanvas ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-indigo-500'} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    {isCanvas ? (
                      <FaTachometerAlt className="text-white w-4 h-4" />
                    ) : (
                      <FaChalkboardTeacher className="text-white w-4 h-4" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${styles.textPrimary} group-hover:scale-105 transition-transform duration-200`}>
                      {isCanvas ? 'Go to Dashboard' : 'Go to Canvas'}
                    </span>
                    <FaExchangeAlt className={`${styles.icon.primary} w-3 h-3 group-hover:rotate-180 transition-transform duration-300`} />
                  </div>
                </div>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${isCanvas ? 'from-purple-500/10 to-blue-500/10' : 'from-blue-500/10 to-indigo-500/10'} opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            <div className="relative group">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`relative p-3 rounded-xl ${styles.card.background} backdrop-blur-md ${styles.card.hover} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                aria-label="Notifications"
              >
                <FaBell className={`${styles.icon.primary} group-hover:scale-110 transition-transform duration-200`} size={20} />
                {unreadCount > 0 && (
                  <div className={`absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg animate-pulse`}>
                    {unreadCount}
                  </div>
                )}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${styles.orb.primary} opacity-0 group-hover:opacity-10 transition-all duration-300`}></div>
              </button>

              <NotificationModal
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
              />
            </div>

            <div className="relative md:hidden">
              <button
                onClick={toggleProfileDropdown}
                className={`relative p-3 rounded-xl ${styles.card.background} backdrop-blur-md ${styles.card.hover} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                aria-label="User Profile"
              >
                <div className="relative">
                  <div className={`bg-gradient-to-br ${styles.accent} rounded-full w-6 h-6 flex items-center justify-center shadow-lg`}>
                    {profilePicture ? (
                      <img src={profilePicture} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FaUserAlt className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className={`absolute -inset-0.5 bg-gradient-to-br ${styles.orb.primary} rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div ref={profileDropdownRef} className={`absolute right-0 mt-3 w-64 ${styles.card.background} backdrop-blur-xl rounded-2xl shadow-2xl z-50 border ${styles.border}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary} opacity-50`}></div>
                  <div className="relative z-10">
                    <div className={`px-4 py-3 border-b ${styles.borderSecondary}`}>
                      <p className={`text-sm ${styles.textSecondary}`}>Signed in as</p>
                      <p className={`font-medium ${styles.textPrimary}`}>{userName || 'John Doe'}</p>
                    </div>
                    <ul className="py-2">
                      <li>
                        <button
                          onMouseDown={() => handleDropdownAction('settings')}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${styles.textPrimary} ${styles.card.hover} transition-all duration-200 group`}
                        >
                          <div className={`p-1.5 rounded-lg ${styles.button.secondary}`}>
                            <FaCog className={`${styles.icon.primary}`} size={14} />
                          </div>
                          <span className="font-medium">Settings</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onMouseDown={() => handleDropdownAction('help')}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${styles.textPrimary} ${styles.card.hover} transition-all duration-200 group`}
                        >
                          <div className={`p-1.5 rounded-lg ${styles.button.secondary}`}>
                            <FaQuestionCircle className={`${styles.icon.primary}`} size={14} />
                          </div>
                          <span className="font-medium">Help & Support</span>
                        </button>
                      </li>
                      <li className={`border-t ${styles.borderSecondary} mt-2 pt-2`}>
                        <button
                          onClick={() => handleDropdownAction('logout')}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${styles.status.error} ${styles.card.hover} transition-all duration-200 group`}
                        >
                          <div className={`p-1.5 rounded-lg bg-opacity-10`} style={{ backgroundColor: styles.status.error.replace('text-', 'bg-') + '/10' }}>
                            <FaSignOutAlt className={`${styles.status.error}`} size={14} />
                          </div>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="relative hidden md:block">
              <button
                onClick={toggleProfileDropdown}
                className={`flex items-center space-x-3 ${styles.card.background} backdrop-blur-xl rounded-2xl px-4 py-2 ${styles.card.hover} transition-all duration-300 shadow-lg hover:shadow-xl group border ${styles.border}`}
                aria-label="User Profile"
              >
                <div className="relative">
                  <div className={`bg-gradient-to-br ${styles.accent} rounded-full w-10 h-10 flex items-center justify-center shadow-lg`}>
                    {profilePicture ? (
                      <img src={profilePicture} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FaUserAlt className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className={`absolute -inset-0.5 bg-gradient-to-br ${styles.orb.primary} rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
                <span className={`${styles.textPrimary} font-medium group-hover:scale-105 transition-transform duration-200`}>{userName || 'John Doe'}</span>
                <div className={`w-2 h-2 bg-gradient-to-br ${styles.accent} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200`}></div>
              </button>

              {isProfileDropdownOpen && (
                <div ref={profileDropdownRef} className={`absolute right-0 mt-3 w-56 ${styles.card.background} backdrop-blur-xl rounded-2xl shadow-2xl z-50 border ${styles.border}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary} opacity-50`}></div>
                  <div className="relative z-10">
                    <div className={`px-4 py-3 border-b ${styles.borderSecondary}`}>
                      <p className={`text-sm ${styles.textSecondary}`}>Signed in as</p>
                      <p className={`font-medium ${styles.textPrimary}`}>{userName || 'John Doe'}</p>
                    </div>
                    <ul className="py-2">
                      <li>
                        <button
                          onMouseDown={() => handleDropdownAction('settings')}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${styles.textPrimary} ${styles.card.hover} transition-all duration-200 group`}
                        >
                          <div className={`p-1.5 rounded-lg ${styles.button.secondary}`}>
                            <FaCog className={`${styles.icon.primary}`} size={14} />
                          </div>
                          <span className="font-medium">Settings</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onMouseDown={() => handleDropdownAction('help')}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${styles.textPrimary} ${styles.card.hover} transition-all duration-200 group`}
                        >
                          <div className={`p-1.5 rounded-lg ${styles.button.secondary}`}>
                            <FaQuestionCircle className={`${styles.icon.primary}`} size={14} />
                          </div>
                          <span className="font-medium">Help & Support</span>
                        </button>
                      </li>
                      <li className={`border-t ${styles.borderSecondary} mt-2 pt-2`}>
                        <button
                          onClick={() => handleDropdownAction('logout')}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${styles.status.error} ${styles.card.hover} transition-all duration-200 group`}
                        >
                          <div className={`p-1.5 rounded-lg bg-opacity-10`} style={{ backgroundColor: styles.status.error.replace('text-', 'bg-') + '/10' }}>
                            <FaSignOutAlt className={`${styles.status.error}`} size={14} />
                          </div>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="hidden md:block mt-6">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${styles.accent} opacity-20 rounded-2xl blur-sm`}></div>
            <ul className={`relative flex space-x-8 ${styles.card.background} backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border ${styles.border}`}>
              {tabs.map((tab) => {
                const isActive = location.pathname === getTabPath(tab);
                return (
                  <li key={tab} className="relative">
                    <button
                      onClick={() => {
                        if (!isCanvas) {
                          switch (tab) {
                            case 'Dashboard':
                              navigate('/dashboard');
                              break;
                            case 'Academics':
                              navigate('/dashboard/academics');
                              break;
                            case 'Financial':
                              navigate('/dashboard/financial');
                              break;
                            case 'Communication':
                              navigate('/dashboard/communication');
                              break;
                            case 'Campus Life':
                              navigate('/dashboard/campus-life');
                              break;
                            default:
                              break;
                          }
                        } else {
                          switch (tab) {
                            case 'Dashboard':
                              navigate('/canvas');
                              break;
                            case 'Diploma Course':
                              navigate('/canvas/diploma-course');
                              break;
                            case 'Chat':
                              navigate('/canvas/chat');
                              break;
                            case 'Video Class':
                              navigate('/canvas/video-class');
                              break;
                            case 'Materials':
                              navigate('/canvas/materials');
                              break;
                            case 'Assignments':
                              navigate('/canvas/assignments');
                              break;
                            case 'Sessions':
                              navigate('/canvas/sessions');
                              break;
                            default:
                              break;
                          }
                        }
                      }}
                      className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isActive
                        ? `${styles.button.primary} shadow-lg transform scale-105`
                        : `${styles.textPrimary} ${styles.card.hover}`
                        }`}
                    >
                      {isActive && (
                        <div className={`absolute -inset-1 bg-gradient-to-r ${styles.orb.primary} rounded-xl blur opacity-75`}></div>
                      )}
                      <span className="relative z-10">{tab}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className={`md:hidden absolute top-full left-0 w-full ${styles.card.background} backdrop-blur-xl rounded-2xl shadow-2xl z-[9999] border ${styles.border} mt-3`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary} opacity-50`}></div>
            <div className="relative z-10 p-6">
              {/* Mobile Search Bar */}
              <div className="mb-6">
                <div className="relative group">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${styles.orb.primary} rounded-full blur opacity-25 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  <div className={`relative ${styles.card.background} backdrop-blur-xl rounded-full px-4 py-3 shadow-lg border ${styles.border}`}>
                    <div className="flex items-center space-x-3">
                      <FaSearch className={`${styles.icon.primary} group-hover:scale-110 transition-transform duration-200`} size={18} />
                      <input
                        type="text"
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => {
                          if (searchQuery.trim().length > 0 && searchResults.length > 0) {
                            setIsSearchDropdownOpen(true);
                          }
                        }}
                        className={`bg-transparent ${styles.textPrimary} placeholder-${styles.textSecondary.replace('text-', '')} focus:outline-none w-full font-medium`}
                        aria-label="Search"
                      />
                    </div>
                  </div>

                  {/* Mobile Search Results Dropdown */}
                  {isSearchDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-2 ${styles.card.background} backdrop-blur-xl rounded-2xl shadow-2xl z-50 border ${styles.border} max-h-96 overflow-y-auto`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary} opacity-50`}></div>
                      <div className="relative z-10 p-2">
                        {searchResults.length > 0 ? (
                          searchResults.map((result, index) => (
                            <button
                              key={result.id}
                              onClick={() => {
                                handleSearchResultSelect(result);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${index === focusedResultIndex
                                ? `${styles.button.primary} shadow-lg`
                                : `${styles.textPrimary} ${styles.card.hover}`
                                }`}
                              onMouseEnter={() => setFocusedResultIndex(index)}
                            >
                              <div className={`p-2 rounded-lg ${styles.button.secondary} group-hover:scale-110 transition-transform duration-200`}>
                                {result.icon}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium">{result.title}</div>
                                <div className={`text-sm ${styles.textSecondary}`}>{result.category}</div>
                              </div>
                              <div className={`w-2 h-2 bg-gradient-to-br ${styles.accent} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200`}></div>
                            </button>
                          ))
                        ) : (
                          <div className="flex items-center justify-center px-4 py-8">
                            <div className="text-center">
                              <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${styles.button.secondary} flex items-center justify-center`}>
                                <FaSearch className={`${styles.icon.primary} opacity-50`} size={20} />
                              </div>
                              <p className={`${styles.textSecondary} font-medium`}>No results found</p>
                              <p className={`${styles.textSecondary} text-sm mt-1`}>Try searching with different keywords</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {tabs.map((tab) => {
                  const isActive = location.pathname === getTabPath(tab);
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (!isCanvas) {
                          switch (tab) {
                            case 'Dashboard':
                              navigate('/dashboard');
                              break;
                            case 'Academics':
                              navigate('/dashboard/academics');
                              break;
                            case 'Financial':
                              navigate('/dashboard/financial');
                              break;
                            case 'Communication':
                              navigate('/dashboard/communication');
                              break;
                            case 'Campus Life':
                              navigate('/dashboard/campus-life');
                              break;
                            default:
                              break;
                          }
                        } else {
                          switch (tab) {
                            case 'Dashboard':
                              navigate('/canvas');
                              break;
                            case 'Diploma Course':
                              navigate('/canvas/diploma-course');
                              break;
                            case 'Chat':
                              navigate('/canvas/chat');
                              break;
                            case 'Video Class':
                              navigate('/canvas/video-class');
                              break;
                            case 'Materials':
                              navigate('/canvas/materials');
                              break;
                            case 'Assignments':
                              navigate('/canvas/assignments');
                              break;
                            case 'Sessions':
                              navigate('/canvas/sessions');
                              break;
                            default:
                              break;
                          }
                        }
                      }}
                      className={`w-full text-left px-5 py-3 rounded-xl font-medium transition-all duration-300 ${isActive
                        ? `${styles.button.primary} shadow-lg transform scale-105`
                        : `${styles.textPrimary} ${styles.card.hover}`
                        }`}
                    >
                      {isActive && (
                        <div className={`absolute -inset-1 bg-gradient-to-r ${styles.orb.primary} rounded-xl blur opacity-75`}></div>
                      )}
                      <span className="relative z-10">{tab}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}