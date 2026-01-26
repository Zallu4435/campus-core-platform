import { useState } from 'react';
import {
  FaGraduationCap,
  FaCreditCard,
  FaShieldAlt,
  FaArrowLeft,
  FaHome,
} from 'react-icons/fa';
import {
  FiDownload,
  FiBell,
  FiHelpCircle,
  FiSettings,
} from 'react-icons/fi';
import ProfileSettings from './ProfileSettings';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../appStore/store';
import { useNavigate } from 'react-router-dom';
import { useLogout, useLogoutAll } from '../../../../application/hooks/useAuthQueries';
import PreferenceSettings from './PreferenceSettings';

const UniversityDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const { mutate: logoutMutation } = useLogout();
  const { mutate: logoutAllMutation } = useLogoutAll();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    logoutMutation();
  };

  const handleLogoutAll = () => {
    logoutAllMutation();
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'preferences':
        return <PreferenceSettings />
      case 'academic':
        return (
          <div className="flex-1 p-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-slate-50"></div>
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaGraduationCap className="w-10 h-10 text-sky-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Academic Settings
                </h2>
                <p className="text-slate-600 text-lg mb-6">Customize your learning experience</p>
                <div className="px-6 py-2 bg-sky-100 rounded-full text-sky-700 text-sm font-medium inline-block">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        );
      case 'offline':
        return (
          <div className="flex-1 p-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-slate-50"></div>
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiDownload className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Offline Learning
                </h2>
                <p className="text-slate-600 text-lg mb-6">Download content for offline access</p>
                <div className="px-6 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium inline-block">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="flex-1 p-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-slate-50"></div>
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBell className="w-10 h-10 text-amber-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Notifications
                </h2>
                <p className="text-slate-600 text-lg mb-6">Manage your notification preferences</p>
                <div className="px-6 py-2 bg-amber-100 rounded-full text-amber-700 text-sm font-medium inline-block">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        );
      case 'financial':
        return (
          <div className="flex-1 p-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-slate-50"></div>
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCreditCard className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Financial Info
                </h2>
                <p className="text-slate-600 text-lg mb-6">Manage payments and billing</p>
                <div className="px-6 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium inline-block">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="flex-1 p-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-slate-50"></div>
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaShieldAlt className="w-10 h-10 text-red-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Security
                </h2>
                <p className="text-slate-600 text-lg mb-6">Protect your account and data</p>
                <div className="px-6 py-2 bg-red-100 rounded-full text-red-700 text-sm font-medium inline-block">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="flex-1 p-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-slate-50"></div>
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiHelpCircle className="w-10 h-10 text-indigo-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Support
                </h2>
                <p className="text-slate-600 text-lg mb-6">Get help when you need it</p>
                <div className="px-6 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium inline-block">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-full mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleBackToDashboard}
                className="group flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-lg text-slate-700 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow border border-slate-200 hover:border-slate-300"
              >
                <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <FaHome className="w-4 h-4" />
                <span className="font-medium text-sm">Dashboard</span>
              </button>

              <div className="h-6 w-px bg-slate-200"></div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                  <FiSettings className="w-4 h-4 text-sky-600" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">
                  Settings
                </h1>
              </div>
            </div>

            <div className="flex items-center">
              <div className="px-3 py-1.5 bg-sky-50 rounded-lg text-sm text-sky-700 font-medium border border-sky-200">
                {user?.firstName || 'User'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 flex w-full min-h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onLogoutAll={handleLogoutAll}
          user={user}
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default UniversityDashboard;