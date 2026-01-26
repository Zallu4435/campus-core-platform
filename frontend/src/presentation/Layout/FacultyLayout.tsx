import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../appStore/store';
import { useLogout } from '../../application/hooks/useAuthQueries';
import Sidebar from '../components/faculty/Sidebar';
import Header from '../components/faculty/Header';

export default function FacultyLayout() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { mutate: logoutMutation } = useLogout();


  useEffect(() => {
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

    const currentTab = pathToTabMap[location.pathname];
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [location.pathname, activeTab]);

  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const department = 'Computer Science';
  const currentDate = 'Thursday, May 16, 2025';

  const handleLogout = () => {
    logoutMutation();
  };

  const handleSidebarCollapse = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-95 z-0"></div>
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
        }}></div>
      </div>
      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          facultyName={fullName}
          department={department}
          onCollapse={handleSidebarCollapse}
        />
        <div className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'ml-20' : 'ml-72'} overflow-hidden`}>
          <div className="sticky top-0 z-50">
            <Header
              currentDate={currentDate}
              facultyName={fullName}
              profilePicture={user?.profilePicture}
              onLogout={handleLogout}
              setActiveTab={setActiveTab}
            />
          </div>
          <main className="h-[calc(100vh-70px)] overflow-auto mt-20">
            <Outlet context={{ activeTab, setActiveTab }} />
          </main>
        </div>
      </div>
    </div>
  );
}