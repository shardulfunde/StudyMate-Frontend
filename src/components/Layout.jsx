import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from '../services/auth';
import { useCapabilities } from '../context/CapabilityContext';
import Footer from './Footer';
import Chatbot from './Chatbot';
import Onboarding from './Onboarding';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();
  const { hasAdminAccess } = useCapabilities();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-top-row">
          <Link to="/" className="logo"><span aria-hidden="true">{'\u{1F4DA}'}</span> StudyMate</Link>
          <button
            type="button"
            className={`mobile-menu-btn${mobileMenuOpen ? ' is-open' : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`nav-links${mobileMenuOpen ? ' is-open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/notes" className={location.pathname === '/notes' ? 'active' : ''}>Notes</Link>
          <Link to="/assignments" className={location.pathname === '/assignments' ? 'active' : ''}>Assignments</Link>
          <Link to="/pyqs" className={location.pathname === '/pyqs' ? 'active' : ''}>Previous Papers</Link>
          <Link to="/ai-features" className={location.pathname === '/ai-features' ? 'active' : ''}>StudyMate AI Studio</Link>
          <Link to="/cognimate" className={location.pathname === '/cognimate' ? 'active' : ''}>CogniMate</Link>
          <Link to="/download" className={location.pathname === '/download' ? 'active' : ''}>Coming Soon</Link>
          {hasAdminAccess && (
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
          )}
          <button type="button" className="nav-signout" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <Footer />
      <Chatbot />
      <Onboarding />
    </div>
  );
}
