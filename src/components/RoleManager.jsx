import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useCapabilities } from '../context/CapabilityContext';
import { buildPermissions } from '../utils/permissions';
import './RoleManager.css';

const ROLE_OPTIONS = [
  { value: 'college_superadmin', label: 'College Superadmin', scope: 'college' },
  { value: 'program_admin', label: 'Program Admin', scope: 'program' },
  { value: 'year_admin', label: 'Year Admin', scope: 'year' },
  { value: 'subject_admin', label: 'Subject Admin', scope: 'subject' }
];

export default function RoleManager({ users, onUpdate }) {
  const { capabilities } = useCapabilities();
  const permissions = buildPermissions(capabilities);

  const [fetchedUsers, setFetchedUsers] = useState([]);

  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [scopeId, setScopeId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [programs, setPrograms] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [colleges, setColleges] = useState([]);

  const effectiveUsers = users ?? fetchedUsers;
  const normalizedUsers = useMemo(
    () =>
      (effectiveUsers || []).map((u) => ({
        email: u.email,
        role: u.role
      })),
    [effectiveUsers]
  );

  const assignableRoles = useMemo(() => {
    const allowed = new Set(permissions.getAssignableRoleTypes());
    return ROLE_OPTIONS.filter((role) => allowed.has(role.value));
  }, [permissions]);

  useEffect(() => {
    if (!selectedRole && assignableRoles.length > 0) {
      setSelectedRole(assignableRoles[0].value);
    } else if (
      selectedRole &&
      assignableRoles.length > 0 &&
      !assignableRoles.some((role) => role.value === selectedRole)
    ) {
      setSelectedRole(assignableRoles[0].value);
      setScopeId('');
      setSelectedProgramId('');
      setSelectedYearId('');
    }
  }, [assignableRoles, selectedRole]);

  const activeScope = useMemo(
    () => assignableRoles.find((r) => r.value === selectedRole)?.scope || null,
    [assignableRoles, selectedRole]
  );

  const manageablePrograms = useMemo(
    () => programs.filter((p) => permissions.canManageProgram(p.id)),
    [programs, permissions]
  );

  const manageableYears = useMemo(
    () =>
      years.filter((y) =>
        permissions.canManageYear(y.id, y.program_id)
      ),
    [years, permissions]
  );

  const manageableSubjects = useMemo(
    () =>
      subjects.filter((s) =>
        permissions.canManageSubject(s.id, s.year_id, s.program_id)
      ),
    [subjects, permissions]
  );

  const visibleYears = useMemo(() => {
    if (!selectedProgramId) return manageableYears;
    return manageableYears.filter((year) => String(year.program_id) === String(selectedProgramId));
  }, [manageableYears, selectedProgramId]);

  const visibleSubjects = useMemo(() => {
    if (selectedYearId) {
      return manageableSubjects.filter((subject) => String(subject.year_id) === String(selectedYearId));
    }
    if (selectedProgramId) {
      return manageableSubjects.filter((subject) => String(subject.program_id) === String(selectedProgramId));
    }
    return manageableSubjects;
  }, [manageableSubjects, selectedProgramId, selectedYearId]);

  useEffect(() => {
    api.get('/programs', { adminAction: true }).then((data) => setPrograms(Array.isArray(data) ? data : [])).catch(() => setPrograms([]));
    api.get('/years', { adminAction: true }).then((data) => setYears(Array.isArray(data) ? data : [])).catch(() => setYears([]));
    api.get('/subjects', { adminAction: true }).then((data) => setSubjects(Array.isArray(data) ? data : [])).catch(() => setSubjects([]));
    api.get('/colleges', { adminAction: true }).then((data) => setColleges(Array.isArray(data) ? data : [])).catch(() => setColleges([]));
  }, []);

  useEffect(() => {
    if (users !== undefined) return;
    const loadUsers = async () => {
      try {
        const data = await api.get('/users', { adminAction: true });
        setFetchedUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        setFetchedUsers([]);
      }
    };
    loadUsers();
  }, [users]);

  useEffect(() => {
    setScopeId('');
    setSelectedProgramId('');
    setSelectedYearId('');
  }, [selectedRole]);

  useEffect(() => {
    if (activeScope !== 'college') return;
    if (permissions.canManageCollege() && colleges.length > 0) {
      const firstCollege = colleges[0];
      if (firstCollege?.id) setScopeId(firstCollege.id);
    }
  }, [activeScope, colleges, permissions]);

  const handleAssignRole = async (event) => {
    event.preventDefault();

    if (!selectedUserEmail) {
      setMessage({ type: 'error', text: 'Select a user first.' });
      return;
    }

    if (!selectedRole || !activeScope || !scopeId) {
      setMessage({ type: 'error', text: 'Select a valid role and scope.' });
      return;
    }

    const allowed = permissions.canAssignRoleInScope(selectedRole, activeScope, scopeId, {
      programId: selectedProgramId || null,
      yearId: selectedYearId || null
    });

    if (!allowed) {
      setMessage({ type: 'error', text: 'You are not allowed to assign this role for the selected scope.' });
      return;
    }

    const payload = {
      target_user_id: null,
      target_email: selectedUserEmail,
      role_type: selectedRole,
      scope_type: activeScope,
      scope_id: scopeId
    };

    setLoading(true);
    setMessage(null);
    try {
      const result = await api.post('/assign-role', payload, { adminAction: true });
      const roleType = result?.role_type || selectedRole;
      const scopeType = result?.scope_type || activeScope;
      setMessage({
        type: 'success',
        text: `Assigned ${roleType} for ${scopeType} scope.`
      });
      if (onUpdate) onUpdate();
    } catch (e) {
      const errorMsg = e?.detail?.detail || e?.message || 'Failed to assign role';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const renderScopeSelector = () => {
    if (activeScope === 'college') {
      return (
        <p className="scope-note">
          College scope is fixed to your college.
        </p>
      );
    }

    if (activeScope === 'program') {
      return (
        <select
          value={scopeId}
          onChange={(e) => setScopeId(e.target.value)}
          disabled={loading}
          required
        >
          <option value="">Select program</option>
          {manageablePrograms.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      );
    }

    if (activeScope === 'year') {
      return (
        <>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setScopeId('');
            }}
            disabled={loading}
          >
            <option value="">All manageable programs</option>
            {manageablePrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          <select
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select year</option>
            {visibleYears.map((year) => (
              <option key={year.id} value={year.id}>
                Year {year.year_number} - {year.program_name}
              </option>
            ))}
          </select>
        </>
      );
    }

    if (activeScope === 'subject') {
      return (
        <>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedYearId('');
              setScopeId('');
            }}
            disabled={loading}
          >
            <option value="">All manageable programs</option>
            {manageablePrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          <select
            value={selectedYearId}
            onChange={(e) => {
              setSelectedYearId(e.target.value);
              setScopeId('');
            }}
            disabled={loading}
          >
            <option value="">All manageable years</option>
            {visibleYears.map((year) => (
              <option key={year.id} value={year.id}>
                Year {year.year_number} - {year.program_name}
              </option>
            ))}
          </select>
          <select
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select subject</option>
            {visibleSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject} ({subject.Program} - Year {subject.Year})
              </option>
            ))}
          </select>
        </>
      );
    }

    return null;
  };

  if (assignableRoles.length === 0) {
    return (
      <div className="role-manager">
        <div className="role-message error">
          You do not have role-assignment permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="role-manager">
      <div className="role-summary">
        <div>
          <p className="eyebrow">Assignment Rules</p>
          <p className="muted">
            platform_superadmin {'>'} college_superadmin {'>'} program_admin {'>'} year_admin {'>'} subject_admin
          </p>
        </div>
        <p className="muted">
          Scope and hierarchy are validated in backend `authority_service.can_assign_role`.
        </p>
      </div>

      <form onSubmit={handleAssignRole} className="role-form">
        <div className="form-group">
          <label htmlFor="user-select">User</label>
          <select
            id="user-select"
            value={selectedUserEmail}
            onChange={(e) => setSelectedUserEmail(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select a user</option>
            {normalizedUsers.map((user) => (
              <option key={user.email} value={user.email}>
                {user.email} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="role-select">Role type</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading}
            required
          >
            {assignableRoles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Scope</label>
          {renderScopeSelector()}
        </div>

        <div className="form-group submit-col">
          <button
            type="submit"
            className="btn-assign"
            disabled={loading || !selectedUserEmail || !selectedRole || !scopeId}
          >
            {loading ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
      </form>

      {message && (
        <div className={`role-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
