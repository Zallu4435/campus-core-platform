import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../appStore/authSlice';
import { RootState } from '../../appStore/store';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/Header';
import { useState } from 'react';
import { authService } from '../../application/services/auth.service';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err: unknown) {
      const error = err as Error;
      if (!error.message?.includes('401')) {
        console.error('Logout API error:', error);
      }
    }
    dispatch(logout());
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1">
        <div
          className={`fixed top-0 z-50 transition-all duration-300 ease-in-out ${collapsed ? 'left-20' : 'left-72'
            } right-0`}
        >
          <AdminHeader
            adminName={fullName}
            adminRole="System Administrator"
            profilePicture={user?.profilePicture}
            notificationCount={5}
            onLogout={handleLogout}
            collapsed={collapsed}
          />
        </div>

        <main
          className={`flex-1 mt-[72px] transition-all duration-300 ease-in-out`}
        >
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;