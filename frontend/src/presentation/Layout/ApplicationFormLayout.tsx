import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../appStore/store';
import { Header } from '../components/public/Header';
import { useLogout } from '../../application/hooks/useAuthQueries';

const ApplicationFormLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={fullName}
        isAuthenticated={!!user}
        layoutType="public"
        hideNavLinks
        hideSettings
        onLogout={handleLogout}
      />
      <main className="mt-24 sm:mt-26 md:mt-28 lg:mt-30">
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, { onLogout: handleLogout })
            : child
        )}
      </main>
    </div>
  );
};

export default ApplicationFormLayout; 