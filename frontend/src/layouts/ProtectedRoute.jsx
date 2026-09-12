import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: 'var(--bg-dark)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ fontSize: '3rem' }} className="animate-pulse-glow">⚔️</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-main)' }}>
          Entering TAPASYA RPG Realm...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
