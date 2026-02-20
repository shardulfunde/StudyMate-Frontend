import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Assignments from './pages/Assignments';
import Pyqs from './pages/Pyqs';
import CogniMatePage from './pages/CogniMatePage';
import Download from './pages/Download';
import SubjectPage from './pages/SubjectPage';
import AdminPanel from './pages/AdminPanel';

// Context & Utils
import { useCapabilities } from './context/CapabilityContext';
import { useToast } from './context/ToastContext';
import { buildPermissions } from './utils/permissions'; // <--- IMPORT THIS
import { api, setApiHandlers } from './services/api';
import { initAuthTokenSync, signInWithGoogle, signOut } from './services/auth';

function App() {
  const {
    user,
    loading, // Changed from loadingAuth/loadingCapabilities to match your Context
    capabilities
  } = useCapabilities();
  const { showToast } = useToast();

  // 1. Calculate Permissions
  const permissions = buildPermissions(capabilities);
  const isAdmin = permissions.hasAdminAccess();

  useEffect(() => {
    const unsubscribeTokenSync = initAuthTokenSync();
    return unsubscribeTokenSync;
  }, []);

  useEffect(() => {
    setApiHandlers({
      onUnauthorized: async () => {
        await signOut();
      },
      onForbidden: async (err) => {
        const message = err?.detail?.detail || err?.message || 'You do not have permission to perform this action.';
        showToast(message, 'error');
      },
      onRateLimit: async (err, meta) => {
        const retryAfter = meta?.retryAfterSeconds;
        const fallback = err?.detail?.detail || err?.message || 'Too many requests. Please wait and try again.';
        const message = Number.isFinite(retryAfter)
          ? `Rate limit reached. Try again in ${retryAfter} seconds.`
          : fallback;
        showToast(message, 'error', 4200);
      }
    });

    return () => setApiHandlers({ onUnauthorized: null, onForbidden: null, onRateLimit: null });
  }, [showToast]);

  useEffect(() => {
    if (user) {
      api.get('/').catch(() => {});
    }
  }, [user]);

  // 2. Handle Loading State
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f4f4' }}>
        <LoadingSpinner message="Loading StudyMate..." />
      </div>
    );
  }

  // 3. Handle Login Screen
  if (!user) {
    return (
      <div className="login-screen">
        <h1>📚 StudyMate</h1>
        <p>Your academic companion. Sign in to continue.</p>
        <button
          type="button"
          className="login-button"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // 4. Render App
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/pyqs" element={<Pyqs />} />
        <Route path="/cognimate" element={<CogniMatePage />} />
        <Route path="/download" element={<Download />} />
        <Route path="/subject/:subjectId" element={<SubjectPage />} />
        
        {/* 5. Use the calculated 'isAdmin' variable */}
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
