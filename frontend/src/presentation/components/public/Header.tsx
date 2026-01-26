import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MdDashboard } from 'react-icons/md';
import { IoSchool } from 'react-icons/io5';
import { FaUserGraduate, FaUserCircle, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import { IoMdArrowDropdown } from 'react-icons/io';

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  layoutType?: 'public' | 'ug' | 'department';
  hideNavLinks?: boolean;
  hideSettings?: boolean;
  profilePicture?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userName = '',
  onLogout,
  isAuthenticated = false,
  layoutType = 'public',
  hideNavLinks = false,
  hideSettings = false,
  profilePicture,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, []);

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const loginRoute = layoutType === 'ug' ? '/ug/login' : layoutType === 'department' ? `/departments/computer-science/login` : '/login';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-400 shadow-lg border-b-4 border-cyan-300">
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-10 py-3 md:py-4">
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mr-2 sm:mr-3 md:mr-4 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-cyan-300">
            <img src="/images/university-logo.png" alt="VAGO Logo" className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 object-contain" />
          </div>
          <span className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold tracking-widest drop-shadow-lg">VAGO</span>
        </Link>

        <div className="hidden md:flex gap-2 lg:gap-4 items-center">
          {!hideNavLinks && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center bg-white/20 px-3 lg:px-4 py-2 rounded-lg text-white font-semibold hover:bg-white/30 transition shadow text-sm lg:text-base"
              >
                <MdDashboard className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
              <Link
                to="/canvas"
                className="flex items-center bg-white/20 px-3 lg:px-4 py-2 rounded-lg text-white font-semibold hover:bg-white/30 transition shadow text-sm lg:text-base"
              >
                <IoSchool className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Canvas</span>
              </Link>
              <Link
                to="/faculty"
                className="flex items-center bg-white/20 px-3 lg:px-4 py-2 rounded-lg text-white font-semibold hover:bg-white/30 transition shadow text-sm lg:text-base"
              >
                <FaUserGraduate className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Faculty</span>
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <div className="relative ml-2 lg:ml-4" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center bg-white/30 px-3 lg:px-4 py-2 rounded-lg text-white font-semibold hover:bg-white/40 transition shadow text-sm lg:text-base"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={userName}
                    className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                )}
                <span className="hidden sm:inline">{userName || 'User'}</span>
                <IoMdArrowDropdown className="w-4 h-4 lg:w-5 lg:h-5 ml-1" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 lg:w-52 bg-gradient-to-br from-cyan-700 to-blue-600 rounded-xl shadow-2xl py-2 z-50 border border-cyan-300/30 backdrop-blur-sm">
                  {!hideSettings && (
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-3 text-white hover:bg-white/20 transition-colors"
                    >
                      <FaCog className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-cyan-200" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  )}
                  <button
                    onMouseDown={() => {
                      setShowProfileMenu(false);
                      onLogout && onLogout();
                    }}
                    className="flex items-center w-full px-4 py-3 text-white hover:bg-white/20 transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-cyan-200" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to={loginRoute}
              state={{ fromLayout: layoutType }}
              className="flex items-center bg-white/30 px-3 lg:px-4 py-2 rounded-lg text-white font-semibold hover:bg-white/40 transition shadow ml-2 lg:ml-4 text-sm lg:text-base"
            >
              <FiLogIn className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center">
          {isAuthenticated && (
            <div className="relative mr-3" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center bg-white/30 px-3 py-2 rounded-lg text-white font-semibold hover:bg-white/40 transition shadow"
              >
                <FaUserCircle className="w-4 h-4 mr-1" />
                <IoMdArrowDropdown className="w-4 h-4 ml-1" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-cyan-700 to-blue-600 rounded-xl shadow-2xl py-2 z-50 border border-cyan-300/30 backdrop-blur-sm">
                  {!hideSettings && (
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-3 text-white hover:bg-white/20 transition-colors"
                    >
                      <FaCog className="w-4 h-4 mr-3 text-cyan-200" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  )}
                  <button
                    onMouseDown={() => {
                      setShowProfileMenu(false);
                      onLogout && onLogout();
                    }}
                    className="flex items-center w-full px-4 py-3 text-white hover:bg-white/20 transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-3 text-cyan-200" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <Link
              to={loginRoute}
              state={{ fromLayout: layoutType }}
              className="flex items-center bg-white/30 px-3 py-2 rounded-lg text-white font-semibold hover:bg-white/40 transition shadow mr-3"
            >
              <FiLogIn className="w-4 h-4 mr-1" />
              <span className="text-sm">Login</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center bg-white/20 px-3 py-2 rounded-lg text-white hover:bg-white/30 transition shadow"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-gradient-to-br from-cyan-700 to-blue-600 border-t border-cyan-300/30 shadow-lg"
        >
          <div className="px-4 py-3 space-y-2">
            {!hideNavLinks && (
              <>
                <Link
                  to="/dashboard"
                  onClick={handleMobileLinkClick}
                  className="flex items-center bg-white/20 px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/30 transition shadow"
                >
                  <MdDashboard className="w-5 h-5 mr-3" />
                  Dashboard
                </Link>
                <Link
                  to="/canvas"
                  onClick={handleMobileLinkClick}
                  className="flex items-center bg-white/20 px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/30 transition shadow"
                >
                  <IoSchool className="w-5 h-5 mr-3" />
                  Canvas
                </Link>
                <Link
                  to="/faculty"
                  onClick={handleMobileLinkClick}
                  className="flex items-center bg-white/20 px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/30 transition shadow"
                >
                  <FaUserGraduate className="w-5 h-5 mr-3" />
                  Faculty
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};