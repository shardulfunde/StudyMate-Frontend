import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { api } from '../services/api'; // Ensure this path is correct
import { auth } from '../firebase';     // Ensure this path is correct
import { buildPermissions } from '../utils/permissions';

const CapabilityContext = createContext(null);

function normalizeManagedScope(value) {
  if (value === 'ALL') return 'ALL';
  return Array.isArray(value) ? value.map((id) => String(id)) : [];
}

export function CapabilityProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capabilities, setCapabilities] = useState({
    isPlatformSuperadmin: false,
    managedColleges: [],
    managedPrograms: [],
    managedYears: [],
    managedSubjects: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setCapabilities({
          isPlatformSuperadmin: false,
          managedColleges: [],
          managedPrograms: [],
          managedYears: [],
          managedSubjects: []
        });
        setLoading(false);
        return;
      }

      try {
        // Fetch capabilities from your backend
        const data = await api.get('/me/capabilities');
        
        console.log("Capabilities Loaded:", data); // DEBUG LOG

        setCapabilities({
          isPlatformSuperadmin: Boolean(data?.isPlatformSuperadmin),
          managedColleges: normalizeManagedScope(data?.managedColleges),
          managedPrograms: normalizeManagedScope(data?.managedPrograms),
          managedYears: normalizeManagedScope(data?.managedYears),
          managedSubjects: normalizeManagedScope(data?.managedSubjects)
        });
      } catch (err) {
        console.error("Failed to load capabilities:", err);
        // Default to no permissions on error
        setCapabilities({
          isPlatformSuperadmin: false,
          managedColleges: [],
          managedPrograms: [],
          managedYears: [],
          managedSubjects: []
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const permissions = useMemo(
    () => buildPermissions(capabilities),
    [capabilities]
  );

  const hasAdminAccess = permissions.hasAdminAccess();
  const derivedCanManageResources =
    capabilities.isPlatformSuperadmin ||
    capabilities.managedColleges === 'ALL' ||
    capabilities.managedPrograms === 'ALL' ||
    capabilities.managedYears === 'ALL' ||
    capabilities.managedSubjects === 'ALL' ||
    (Array.isArray(capabilities.managedColleges) && capabilities.managedColleges.length > 0) ||
    (Array.isArray(capabilities.managedPrograms) && capabilities.managedPrograms.length > 0) ||
    (Array.isArray(capabilities.managedYears) && capabilities.managedYears.length > 0) ||
    (Array.isArray(capabilities.managedSubjects) && capabilities.managedSubjects.length > 0);

  return (
    <CapabilityContext.Provider
      value={{
        user,
        loading,
        capabilities,
        isPlatformSuperadmin: capabilities.isPlatformSuperadmin,
        managedColleges: capabilities.managedColleges,
        managedPrograms: capabilities.managedPrograms,
        managedYears: capabilities.managedYears,
        managedSubjects: capabilities.managedSubjects,
        canManageResources: derivedCanManageResources,
        hasAdminAccess
      }}
    >
      {children}
    </CapabilityContext.Provider>
  );
}

export function useCapabilities() {
  const ctx = useContext(CapabilityContext);
  if (!ctx) throw new Error("useCapabilities must be used inside CapabilityProvider");
  return ctx;
}
