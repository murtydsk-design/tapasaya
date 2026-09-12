import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LevelUpModal from '../components/LevelUpModal';
import ToastNotification from '../components/ToastNotification';

export const AppLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{
          flex: 1,
          padding: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          paddingBottom: '5rem' // Margin for mobile bottom navigation bar
        }}>
          <Outlet />
        </main>
      </div>

      <LevelUpModal />
      <ToastNotification />
    </div>
  );
};

export default AppLayout;
