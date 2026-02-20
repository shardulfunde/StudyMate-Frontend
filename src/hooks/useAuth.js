import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Hook to get current user info including role for permission checks.
 * Returns { user, loading, error }
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch current user from backend (add this endpoint to backend if missing)
    // For now, we'll handle 403s gracefully in components
    api.get('/me')
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((e) => {
        // If /me doesn't exist yet, we'll infer from permission checks
        setError(e.message);
        setLoading(false);
        setUser(null);
      });
  }, []);

  return { user, loading, error };
}

/**
 * Check if user can manage structure (super admin only)
 */
export function canManageStructure(role) {
  return role && ['college_superadmin', 'platform_superadmin'].includes(role);
}
