import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import GooeyLoader from './components/ui/GooeyLoader';

import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Assignments from './pages/Assignments';
import Pyqs from './pages/Pyqs';
import CogniMatePage from './pages/CogniMatePage';
import Download from './pages/Download';
import SubjectPage from './pages/SubjectPage';
import AdminPanel from './pages/AdminPanel';
import LandingPage from './pages/LandingPage';
import AIFeaturesPage from './pages/AIFeaturesPage';
import ModeratorApplicationPage from './pages/ModeratorApplicationPage';
import AcademicTeamPage from './pages/AcademicTeamPage';
import PlatformApprovalsPage from './pages/PlatformApprovalsPage';
import StudentDealsSurvey from './pages/StudentDealsSurvey';
import NotFoundPage from './pages/NotFoundPage';
import DMLabPage from './pages/DMLabPage';

import { useCapabilities } from './context/CapabilityContext';
import { useToast } from './context/ToastContext';
import { buildPermissions } from './utils/permissions';
import { setApiHandlers } from './services/api';
import { initAuthTokenSync, signInWithGoogle, signOut } from './services/auth';

function App() {
  const location = useLocation();

  // Public routes that bypass auth entirely
  if (location.pathname === '/dm') {
    return <DMLabPage />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { user, loading, capabilities } = useCapabilities();
  const { showToast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  const permissions = buildPermissions(capabilities);
  const isAdmin = permissions.hasAdminAccess();

  useEffect(() => {
    const unsubscribe = initAuthTokenSync();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      setIsSigningIn(false);
      setAuthError('');
    }
  }, [user]);

  useEffect(() => {
    setApiHandlers({
      onUnauthorized: async () => {
        await signOut();
      },
      onForbidden: async (err) => {
        showToast(err?.message || 'No permission', 'error');
      },
      onRateLimit: async (err) => {
        showToast(err?.message || 'Rate limit', 'error');
      }
    });

    return () => {
      setApiHandlers({ onUnauthorized: null, onForbidden: null, onRateLimit: null });
    };
  }, [showToast]);

  const handleGoogleSignIn = useCallback(async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError('');

    try {
      await signInWithGoogle();
    } catch {
      setAuthError('Sign-in failed. Try again.');
      setIsSigningIn(false);
    }
  }, [isSigningIn]);

  if (loading) {
    return (
      <div className="login-loading">
        <GooeyLoader
          primaryColor="#fb3a5d"
          secondaryColor="#93c5fd"
          borderColor="#e2e8f0"
          message="Booting StudyMate. One moment."
        />
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage
        onGoogleSignIn={handleGoogleSignIn}
        isSigningIn={isSigningIn}
        authError={authError}
      />
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/pyqs" element={<Pyqs />} />
        <Route path="/cognimate" element={<CogniMatePage />} />
        <Route path="/ai-features" element={<AIFeaturesPage />} />
        <Route path="/academic-team" element={<AcademicTeamPage />} />
        <Route path="/moderator-application" element={<ModeratorApplicationPage />} />
        <Route path="/apply-moderator" element={<ModeratorApplicationPage />} />
        <Route path="/download" element={<Download />} />
        <Route path="/student-deals-survey" element={<StudentDealsSurvey />} />
        <Route path="/subject/:subjectId" element={<SubjectPage />} />
        <Route
          path="/platform/approvals"
          element={
            capabilities?.isPlatformSuperadmin ? (
              <PlatformApprovalsPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={isAdmin ? <AdminPanel /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;

