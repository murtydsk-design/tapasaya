import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { LogoutModal } from '../components/LogoutModal';

export const LandingPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
      {/* 1. Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-nav)',
        backdropFilter: 'var(--glass-backdrop)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.01em' }}>
              TAPASYA
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => scrollToSection('home')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}
            >
              Features
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
              style={{ padding: '0.5rem' }}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem' }}>
                  Dashboard
                </Link>
                <button onClick={() => setShowLogoutModal(true)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem' }}>
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" style={{ padding: '4.5rem 1.5rem 3.5rem 1.5rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(201, 168, 106, 0.12)',
          border: '1px solid rgba(201, 168, 106, 0.3)',
          color: 'var(--primary-hover)',
          padding: '0.35rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.75rem'
        }}>
          Life RPG Productivity Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)',
          lineHeight: '1.12',
          fontWeight: 800,
          marginBottom: '1.25rem',
          letterSpacing: '-0.02em',
          color: 'var(--text-main)'
        }}>
          TAPASYA
        </h1>

        <p style={{
          fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
          fontWeight: 600,
          color: 'var(--primary-hover)',
          marginBottom: '1rem'
        }}>
          Turn everyday tasks into quests.
        </p>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-muted)',
          maxWidth: '640px',
          margin: '0 auto 2.25rem auto',
          lineHeight: '1.65'
        }}>
          Complete your real-life tasks, earn XP, build streaks, and level up your progress.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn-primary" style={{ padding: '0.8rem 2.25rem', fontSize: '1rem', fontWeight: 600 }}>
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 500 }}>
            Log In
          </Link>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" style={{ padding: '4rem 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.85rem', color: 'var(--text-main)', fontWeight: 700 }}>How TAPASYA Works</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Four simple steps to transform daily productivity into game progress.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>01</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>Create a Quest</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                Turn a real-life task into a quest with a category, difficulty level, and attribute alignment.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>02</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>Complete It</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                Finish the task in real life and mark it complete on your TAPASYA dashboard.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>03</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>Earn XP & Gold</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                Get rewards based on quest difficulty to level up your character and gain spendable gold.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>04</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>Build Your Progress</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                Improve your attributes, maintain your quest streaks, and track overall growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.85rem', color: 'var(--text-main)', fontWeight: 700 }}>Features</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Everything you need to turn daily effort into tangible progress.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 600 }}>Quests</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Create Daily or One-Day quests tailored to your personal goals.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 600 }}>XP & Levels</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Earn XP and progress through levels as your task history grows.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 600 }}>Daily Streaks</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Build a separate streak for each Daily Quest to track consistency.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 600 }}>Attributes</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Improve your stats (Strength, Intellect, Focus, Knowledge, Discipline) by completing aligned quests.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 600 }}>Rewards</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Use Gold earned from quests to unlock custom real-life rewards.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 600 }}>Inventory</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Keep track of your unlocked real-life rewards and items.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 600 }}>Progress</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Review your complete activity stats and quest completion records.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Quest Types Breakdown & Individual Streaks */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 700 }}>Quest Structure</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Designed to fit both repeating daily routines and single accomplishments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Daily Quest Explanation */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recurring Tasks
              </span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0.4rem 0 0.6rem 0' }}>Daily Quests</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                Create a task once and work on it every day during its selected date range.
              </p>
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Study for 1 Hour</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Sep 12 – Sep 30</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--emerald)', marginTop: '0.6rem', fontWeight: 500 }}>
                  Complete it today → earn rewards → increase that quest's streak.
                </div>
              </div>
            </div>

            {/* One-Day Quest Explanation */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Single Goals
              </span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0.4rem 0 0.6rem 0' }}>One-Day Quests</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                For tasks that only need to be completed once.
              </p>
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Submit Assignment</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>September 15</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--emerald)', marginTop: '0.6rem', fontWeight: 500 }}>
                  Complete it once and earn your rewards.
                </div>
              </div>
            </div>
          </div>

          {/* Streaks Explanation */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Individual Quest Streaks</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto 1.25rem auto', lineHeight: '1.55' }}>
              Streaks belong to individual Daily Quests, building independently so each routine maintains its own streak record.
            </p>
            <div style={{ display: 'inline-flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', background: 'var(--bg-dark)', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Study for 1 Hour</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--rose)', fontWeight: 600 }}>🔥 7 day streak</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Exercise</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--rose)', fontWeight: 600 }}>🔥 4 day streak</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action (CTA) */}
      <section style={{ padding: '4.5rem 1.5rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.75rem' }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Turn your tasks into quests and start building your progress.
        </p>
        <Link to="/signup" className="btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 600 }}>
          Create Your Account
        </Link>
      </section>

      {/* 7. Footer */}
      <footer style={{
        padding: '2.5rem 2rem',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              TAPASYA
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Make everyday productivity feel like a game.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
            <button onClick={() => scrollToSection('home')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Home
            </button>
            <button onClick={() => scrollToSection('how-it-works')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              How It Works
            </button>
            <button onClick={() => scrollToSection('features')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Features
            </button>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
            <Link to="/signup" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Sign Up</Link>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', width: '100%' }}>
            © 2026 TAPASYA. All rights reserved.
          </div>
        </div>
      </footer>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default LandingPage;
