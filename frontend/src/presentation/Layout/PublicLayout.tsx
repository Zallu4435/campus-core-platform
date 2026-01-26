import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/public/Header';
import { Navbar } from '../components/public/Navbar';
import { Footer } from '../components/public/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../appStore/authSlice';
import { RootState } from '../../appStore/store';

const PublicLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 via-white to-cyan-50 pt-[120px] sm:pt-[125px] md:pt-[130px] lg:pt-[135px]">
      <Header userName={fullName} onLogout={handleLogout} isAuthenticated={!!user} layoutType='public' profilePicture={user?.profilePicture} />
      <Navbar layoutType="public" />
      <main className="flex-1 pb-8 sm:pb-12 md:pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;