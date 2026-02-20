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

  return (
    <div className="layout">
      <nav className="navbar">
        <Link to="/" className="logo">📚 StudyMate</Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/notes" className={location.pathname === '/notes' ? 'active' : ''}>Notes</Link>
          <Link to="/assignments" className={location.pathname === '/assignments' ? 'active' : ''}>Assignments</Link>
          <Link to="/pyqs" className={location.pathname === '/pyqs' ? 'active' : ''}>Previous Papers</Link>
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
