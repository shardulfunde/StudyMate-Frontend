import { useEffect, useMemo, useState } from 'react';
import { api, getModeratorApplications, reviewModeratorApplication } from '../services/api';
import './ModeratorRequestsManager.css';

const ROLE_OPTIONS = [
  { value: 'college_superadmin', label: 'College Superadmin', scope: 'college' },
  { value: 'program_admin', label: 'Program Admin', scope: 'program' },
  { value: 'year_admin', label: 'Year Admin', scope: 'year' },
  { value: 'subject_admin', label: 'Subject Admin', scope: 'subject' }
];

function formatDate(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleString();
}

function getErrorText(error) {
  if (!error) return 'Failed to load moderator requests.';
  if (typeof error?.detail?.detail === 'string') return error.detail.detail;
  if (typeof error?.message === 'string') return error.message;
  return 'Failed to process request.';
}

export default function ModeratorRequestsManager() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [processingDecisionId, setProcessingDecisionId] = useState('');

  const [programs, setPrograms] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  const [assignForms, setAssignForms] = useState({});
  const [assigningId, setAssigningId] = useState('');
  const [assignMessages, setAssignMessages] = useState({});
  const [quickProgramName, setQuickProgramName] = useState('');
  const [quickYearProgramId, setQuickYearProgramId] = useState('');
  const [quickYearNumber, setQuickYearNumber] = useState('');
  const [quickSubjectProgramId, setQuickSubjectProgramId] = useState('');
  const [quickSubjectYearId, setQuickSubjectYearId] = useState('');
  const [quickSubjectName, setQuickSubjectName] = useState('');
  const [quickLoading, setQuickLoading] = useState('');
  const [quickMessage, setQuickMessage] = useState({ type: '', text: '' });

  const isBusy = loading || Boolean(processingDecisionId) || Boolean(assigningId);

  const loadRequests = async (status = statusFilter) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await getModeratorApplications(status);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'error', text: getErrorText(error) });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError('');
      try {
        const [programData, yearData, subjectData, collegeData] = await Promise.all([
          api.get('/programs', { adminAction: true }),
          api.get('/years', { adminAction: true }),
          api.get('/subjects', { adminAction: true }),
          api.get('/colleges', { adminAction: true })
        ]);

        setPrograms(Array.isArray(programData) ? programData : []);
        setYears(Array.isArray(yearData) ? yearData : []);
        setSubjects(Array.isArray(subjectData) ? subjectData : []);
        setColleges(Array.isArray(collegeData) ? collegeData : []);
      } catch (error) {
        setCatalogError(getErrorText(error));
        setPrograms([]);
        setYears([]);
        setSubjects([]);
        setColleges([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const emptyText = useMemo(() => {
    if (statusFilter === 'pending') return 'No pending applications.';
    if (statusFilter === 'approved') return 'No approved applications.';
    if (statusFilter === 'rejected') return 'No rejected applications.';
    return 'No moderator applications found.';
  }, [statusFilter]);

  const handleDecision = async (applicationId, action) => {
    if (!applicationId || processingDecisionId) return;
    setProcessingDecisionId(applicationId);
    setMessage({ type: '', text: '' });

    try {
      const response = await reviewModeratorApplication(applicationId, action);
      setMessage({ type: 'success', text: response?.message || `Application ${action}d.` });
      await loadRequests(statusFilter);
    } catch (error) {
      setMessage({ type: 'error', text: getErrorText(error) });
    } finally {
      setProcessingDecisionId('');
    }
  };

  const getDefaultAssignForm = () => ({
    open: false,
    role: 'subject_admin',
    programId: '',
    yearId: '',
    scopeId: ''
  });

  const getFormForItem = (applicationId) => assignForms[applicationId] || getDefaultAssignForm();

  const setFormForItem = (applicationId, nextState) => {
    setAssignForms((prev) => ({ ...prev, [applicationId]: nextState }));
  };

  const setAssignMessage = (applicationId, nextMessage) => {
    setAssignMessages((prev) => ({ ...prev, [applicationId]: nextMessage }));
  };

  const getRoleConfig = (roleValue) => ROLE_OPTIONS.find((role) => role.value === roleValue) || ROLE_OPTIONS[3];

  const handleToggleAssign = (applicationId) => {
    const current = getFormForItem(applicationId);
    const nextOpen = !current.open;
    const nextForm = { ...current, open: nextOpen };

    if (nextOpen && getRoleConfig(nextForm.role).scope === 'college' && !nextForm.scopeId && colleges[0]?.id) {
      nextForm.scopeId = colleges[0].id;
    }

    setFormForItem(applicationId, nextForm);
  };

  const handleRoleChange = (applicationId, role) => {
    const roleConfig = getRoleConfig(role);
    const next = {
      ...getFormForItem(applicationId),
      role,
      scopeId: '',
      programId: '',
      yearId: ''
    };
    if (roleConfig.scope === 'college' && colleges[0]?.id) {
      next.scopeId = colleges[0].id;
    }
    setFormForItem(applicationId, next);
    setAssignMessage(applicationId, { type: '', text: '' });
  };

  const handleAssign = async (item, options = {}) => {
    const { silent = false } = options;
    const applicationId = item.application_id;
    const form = getFormForItem(applicationId);
    const roleConfig = getRoleConfig(form.role);
    const applicantEmail = item?.applicant_email;

    if (!applicantEmail) {
      if (!silent) {
        setAssignMessage(applicationId, { type: 'error', text: 'Applicant email is required for assignment.' });
      }
      return false;
    }

    if (!form.scopeId) {
      if (!silent) {
        setAssignMessage(applicationId, { type: 'error', text: 'Select a valid scope before assigning.' });
      }
      return false;
    }

    if (assigningId) return false;
    setAssigningId(applicationId);
    setAssignMessage(applicationId, { type: '', text: '' });

    try {
      const response = await api.post(
        '/assign-role',
        {
          target_user_id: null,
          target_email: applicantEmail,
          role_type: form.role,
          scope_type: roleConfig.scope,
          scope_id: form.scopeId
        },
        { adminAction: true }
      );

      setAssignMessage(applicationId, {
        type: 'success',
        text: response?.message || 'Role assigned successfully.'
      });
      return true;
    } catch (error) {
      setAssignMessage(applicationId, { type: 'error', text: getErrorText(error) });
      return false;
    } finally {
      setAssigningId('');
    }
  };

  const handleApproveWithAssignment = async (item) => {
    if (!item?.application_id || processingDecisionId || assigningId) return;

    const assigned = await handleAssign(item, { silent: false });
    if (!assigned) {
      setMessage({ type: 'error', text: 'Select role/scope and assign before approving this request.' });
      const current = getFormForItem(item.application_id);
      setFormForItem(item.application_id, { ...current, open: true });
      return;
    }

    await handleDecision(item.application_id, 'approve');
  };

  const getVisibleYears = (form) => {
    if (!form.programId) return years;
    return years.filter((year) => String(year.program_id) === String(form.programId));
  };

  const getVisibleSubjects = (form) => {
    if (form.yearId) {
      return subjects.filter((subject) => String(subject.year_id) === String(form.yearId));
    }
    if (form.programId) {
      return subjects.filter((subject) => String(subject.program_id) === String(form.programId));
    }
    return subjects;
  };

  const quickSubjectYears = useMemo(() => {
    if (!quickSubjectProgramId) return years;
    return years.filter((year) => String(year.program_id) === String(quickSubjectProgramId));
  }, [years, quickSubjectProgramId]);

  const handleQuickCreateProgram = async (event) => {
    event.preventDefault();
    const name = quickProgramName.trim();
    if (!name) return;

    setQuickLoading('program');
    setQuickMessage({ type: '', text: '' });
    try {
      await api.post('/create-program', { program_name: name }, { adminAction: true });
      setQuickProgramName('');
      setQuickMessage({ type: 'success', text: 'Program created.' });
      const programData = await api.get('/programs', { adminAction: true });
      setPrograms(Array.isArray(programData) ? programData : []);
    } catch (error) {
      setQuickMessage({ type: 'error', text: getErrorText(error) });
    } finally {
      setQuickLoading('');
    }
  };

  const handleQuickCreateYear = async (event) => {
    event.preventDefault();
    if (!quickYearProgramId || !quickYearNumber) return;

    setQuickLoading('year');
    setQuickMessage({ type: '', text: '' });
    try {
      await api.post(
        '/create-year',
        { program_id: quickYearProgramId, year_number: parseInt(quickYearNumber, 10) },
        { adminAction: true }
      );
      setQuickYearNumber('');
      setQuickMessage({ type: 'success', text: 'Year created.' });
      const yearData = await api.get('/years', { adminAction: true });
      setYears(Array.isArray(yearData) ? yearData : []);
    } catch (error) {
      setQuickMessage({ type: 'error', text: getErrorText(error) });
    } finally {
      setQuickLoading('');
    }
  };

  const handleQuickCreateSubject = async (event) => {
    event.preventDefault();
    const name = quickSubjectName.trim();
    if (!quickSubjectYearId || !name) return;

    setQuickLoading('subject');
    setQuickMessage({ type: '', text: '' });
    try {
      await api.post(
        '/create-subject',
        { year_id: quickSubjectYearId, subject_name: name },
        { adminAction: true }
      );
      setQuickSubjectName('');
      setQuickMessage({
        type: 'success',
        text: 'Subject created. It will appear after moderator review and approval.'
      });
      const subjectData = await api.get('/subjects', { adminAction: true });
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
    } catch (error) {
      setQuickMessage({ type: 'error', text: getErrorText(error) });
    } finally {
      setQuickLoading('');
    }
  };

  return (
    <div className="moderator-requests">
      <div className="moderator-requests-header">
        <h2>Moderator Requests</h2>
        <div className="moderator-requests-controls">
          <label htmlFor="moderator-status-filter">Status</label>
          <select
            id="moderator-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            disabled={isBusy}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      {catalogError && (
        <div className="message error">
          {catalogError}
        </div>
      )}

      <section className="mod-quick-structure-panel">
        <h3>Quick Create</h3>
        <p>Create program/year/subject while reviewing moderator approvals.</p>
        {quickMessage.text && (
          <div className={`message ${quickMessage.type === 'error' ? 'error' : 'success'}`}>
            {quickMessage.text}
          </div>
        )}
        <div className="mod-quick-structure-grid">
          <form className="mod-quick-structure-form" onSubmit={handleQuickCreateProgram}>
            <label>Program</label>
            <input
              type="text"
              value={quickProgramName}
              onChange={(event) => setQuickProgramName(event.target.value)}
              placeholder="Program name"
            />
            <button type="submit" className="assign-submit-btn" disabled={quickLoading === 'program' || !quickProgramName.trim()}>
              {quickLoading === 'program' ? 'Creating...' : 'Create Program'}
            </button>
          </form>

          <form className="mod-quick-structure-form" onSubmit={handleQuickCreateYear}>
            <label>Year</label>
            <select
              value={quickYearProgramId}
              onChange={(event) => setQuickYearProgramId(event.target.value)}
              required
            >
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quickYearNumber}
              onChange={(event) => setQuickYearNumber(event.target.value)}
              placeholder="Year number"
              required
            />
            <button type="submit" className="assign-submit-btn" disabled={quickLoading === 'year' || !quickYearProgramId || !quickYearNumber}>
              {quickLoading === 'year' ? 'Creating...' : 'Create Year'}
            </button>
          </form>

          <form className="mod-quick-structure-form" onSubmit={handleQuickCreateSubject}>
            <label>Subject</label>
            <select
              value={quickSubjectProgramId}
              onChange={(event) => {
                setQuickSubjectProgramId(event.target.value);
                setQuickSubjectYearId('');
              }}
            >
              <option value="">All programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <select
              value={quickSubjectYearId}
              onChange={(event) => setQuickSubjectYearId(event.target.value)}
              required
            >
              <option value="">Select year</option>
              {quickSubjectYears.map((year) => (
                <option key={year.id} value={year.id}>
                  Year {year.year_number} - {year.program_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={quickSubjectName}
              onChange={(event) => setQuickSubjectName(event.target.value)}
              placeholder="Subject name"
              required
            />
            <button type="submit" className="assign-submit-btn" disabled={quickLoading === 'subject' || !quickSubjectYearId || !quickSubjectName.trim()}>
              {quickLoading === 'subject' ? 'Creating...' : 'Create Subject'}
            </button>
          </form>
        </div>
      </section>

      {loading ? (
        <p>Loading moderator applications...</p>
      ) : items.length === 0 ? (
        <p>{emptyText}</p>
      ) : (
        <div className="resume-list">
          {items.map((item) => {
            const isProcessing = processingDecisionId === item.application_id;
            const canReview = item.status === 'pending';
            const canAssign = item.status !== 'rejected' && Boolean(item.applicant_email);
            const form = getFormForItem(item.application_id);
            const roleConfig = getRoleConfig(form.role);
            const visibleYears = getVisibleYears(form);
            const visibleSubjects = getVisibleSubjects(form);
            const isAssigning = assigningId === item.application_id;
            const assignMessage = assignMessages[item.application_id];

            return (
              <section key={item.application_id} className="resume-sheet">
                <header className="resume-header">
                  <div>
                    <h3>{item.applicant_name || 'Name not provided'}</h3>
                    <p>{item.applicant_email || 'Email unavailable'}</p>
                  </div>
                  <span className={`status-pill status-${item.status}`}>{item.status}</span>
                </header>

                <div className="resume-grid">
                  <p><strong>Application ID:</strong> {item.application_id}</p>
                  <p><strong>User ID:</strong> {item.user_id}</p>
                  <p><strong>Phone Number:</strong> {item.phone_number}</p>
                  <p><strong>Branch:</strong> {item.branch}</p>
                  <p><strong>Year:</strong> {item.year}</p>
                  <p><strong>Submitted At:</strong> {formatDate(item.created_at)}</p>
                  <p><strong>Reviewed At:</strong> {formatDate(item.reviewed_at)}</p>
                  <p><strong>Reviewed By:</strong> {item.reviewed_by || '-'}</p>
                </div>

                <div className="resume-section">
                  <h4>Motivation</h4>
                  <p>{item.motivation || 'No motivation provided.'}</p>
                </div>

                {canReview && (
                  <div className="resume-actions">
                    <button
                      type="button"
                      className="approve-btn"
                      onClick={() => handleApproveWithAssignment(item)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="reject-btn"
                      onClick={() => handleDecision(item.application_id, 'reject')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}

                {canAssign && (
                  <div className="assign-manager">
                    <div className="assign-header">
                      <h4>Assign Moderator Role</h4>
                      <button
                        type="button"
                        className="assign-toggle-btn"
                        onClick={() => handleToggleAssign(item.application_id)}
                        disabled={catalogLoading || isAssigning}
                      >
                        {form.open ? 'Hide' : 'Assign Role'}
                      </button>
                    </div>

                    {form.open && (
                      <div className="assign-form">
                        <div className="assign-row">
                          <label htmlFor={`assign-role-${item.application_id}`}>Role</label>
                          <select
                            id={`assign-role-${item.application_id}`}
                            value={form.role}
                            onChange={(event) => handleRoleChange(item.application_id, event.target.value)}
                            disabled={catalogLoading || isAssigning}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {roleConfig.scope === 'college' && (
                          <div className="assign-row">
                            <label>Scope</label>
                            <p className="assign-note">
                              {colleges[0]?.id ? 'College scope is fixed to your college.' : 'College scope unavailable.'}
                            </p>
                          </div>
                        )}

                        {roleConfig.scope === 'program' && (
                          <div className="assign-row">
                            <label htmlFor={`assign-program-${item.application_id}`}>Program</label>
                            <select
                              id={`assign-program-${item.application_id}`}
                              value={form.scopeId}
                              onChange={(event) =>
                                setFormForItem(item.application_id, {
                                  ...form,
                                  scopeId: event.target.value
                                })
                              }
                              disabled={catalogLoading || isAssigning}
                            >
                              <option value="">Select program</option>
                              {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                  {program.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {roleConfig.scope === 'year' && (
                          <>
                            <div className="assign-row">
                              <label htmlFor={`assign-year-program-${item.application_id}`}>Program (optional)</label>
                              <select
                                id={`assign-year-program-${item.application_id}`}
                                value={form.programId}
                                onChange={(event) =>
                                  setFormForItem(item.application_id, {
                                    ...form,
                                    programId: event.target.value,
                                    scopeId: ''
                                  })
                                }
                                disabled={catalogLoading || isAssigning}
                              >
                                <option value="">All programs</option>
                                {programs.map((program) => (
                                  <option key={program.id} value={program.id}>
                                    {program.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="assign-row">
                              <label htmlFor={`assign-year-${item.application_id}`}>Year</label>
                              <select
                                id={`assign-year-${item.application_id}`}
                                value={form.scopeId}
                                onChange={(event) =>
                                  setFormForItem(item.application_id, {
                                    ...form,
                                    scopeId: event.target.value
                                  })
                                }
                                disabled={catalogLoading || isAssigning}
                              >
                                <option value="">Select year</option>
                                {visibleYears.map((year) => (
                                  <option key={year.id} value={year.id}>
                                    Year {year.year_number} - {year.program_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}

                        {roleConfig.scope === 'subject' && (
                          <>
                            <div className="assign-row">
                              <label htmlFor={`assign-subject-program-${item.application_id}`}>Program (optional)</label>
                              <select
                                id={`assign-subject-program-${item.application_id}`}
                                value={form.programId}
                                onChange={(event) =>
                                  setFormForItem(item.application_id, {
                                    ...form,
                                    programId: event.target.value,
                                    yearId: '',
                                    scopeId: ''
                                  })
                                }
                                disabled={catalogLoading || isAssigning}
                              >
                                <option value="">All programs</option>
                                {programs.map((program) => (
                                  <option key={program.id} value={program.id}>
                                    {program.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="assign-row">
                              <label htmlFor={`assign-subject-year-${item.application_id}`}>Year (optional)</label>
                              <select
                                id={`assign-subject-year-${item.application_id}`}
                                value={form.yearId}
                                onChange={(event) =>
                                  setFormForItem(item.application_id, {
                                    ...form,
                                    yearId: event.target.value,
                                    scopeId: ''
                                  })
                                }
                                disabled={catalogLoading || isAssigning}
                              >
                                <option value="">All years</option>
                                {visibleYears.map((year) => (
                                  <option key={year.id} value={year.id}>
                                    Year {year.year_number} - {year.program_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="assign-row">
                              <label htmlFor={`assign-subject-${item.application_id}`}>Subject</label>
                              <select
                                id={`assign-subject-${item.application_id}`}
                                value={form.scopeId}
                                onChange={(event) =>
                                  setFormForItem(item.application_id, {
                                    ...form,
                                    scopeId: event.target.value
                                  })
                                }
                                disabled={catalogLoading || isAssigning}
                              >
                                <option value="">Select subject</option>
                                {visibleSubjects.map((subject) => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.subject} ({subject.Program} - Year {subject.Year})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}

                        {assignMessage?.text && (
                          <div className={`assign-message ${assignMessage.type}`}>
                            {assignMessage.text}
                          </div>
                        )}

                        <div className="assign-actions">
                          <button
                            type="button"
                            className="assign-submit-btn"
                            onClick={() => handleAssign(item)}
                            disabled={catalogLoading || isAssigning}
                          >
                            {isAssigning ? 'Assigning...' : 'Assign Role'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
