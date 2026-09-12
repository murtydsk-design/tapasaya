import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧭</div>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>404 — Page Not Found</h1>
      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '480px', marginBottom: '1.75rem' }}>
        The page you are looking for does not exist.
      </p>
      <Link to="/dashboard" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
        Go to Dashboard 🏠
      </Link>
    </div>
  );
};

export default NotFoundPage;
