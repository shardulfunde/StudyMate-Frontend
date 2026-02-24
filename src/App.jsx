import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

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

import { useCapabilities } from './context/CapabilityContext';
import { useToast } from './context/ToastContext';
import { buildPermissions } from './utils/permissions';
import { setApiHandlers } from './services/api';
import { initAuthTokenSync, signInWithGoogle, signOut } from './services/auth';

function App() {
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
        <LoadingSpinner message="Booting StudyMate. One moment." />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
