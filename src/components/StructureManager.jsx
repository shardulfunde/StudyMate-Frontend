import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useCapabilities } from '../context/CapabilityContext';
import { buildPermissions } from '../utils/permissions';

export default function StructureManager() {
  const { capabilities } = useCapabilities();
  const permissions = buildPermissions(capabilities);

  const [programs, setPrograms] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [programName, setProgramName] = useState('');
  const [yearNumber, setYearNumber] = useState('');
  const [subjectName, setSubjectName] = useState('');

  const [createYearProgramId, setCreateYearProgramId] = useState('');
  const [createSubjectProgramId, setCreateSubjectProgramId] = useState('');
  const [createSubjectYearId, setCreateSubjectYearId] = useState('');

  const [busyAction, setBusyAction] = useState('');
  const [message, setMessage] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteType, setDeleteType] = useState('program');
  const [deleteTargetId, setDeleteTargetId] = useState('');

  const isBusy = busyAction !== '';

  const loadStructure = async () => {
    try {
      const [programData, yearData, subjectData] = await Promise.all([
        api.get('/programs', { adminAction: true }),
        api.get('/years', { adminAction: true }),
        api.get('/subjects', { adminAction: true })
      ]);

      setPrograms(Array.isArray(programData) ? programData : []);
      setYears(Array.isArray(yearData) ? yearData : []);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.detail?.detail || err?.message || 'Failed to load structure data.'
      });
    }
  };

  useEffect(() => {
    loadStructure();
  }, []);

  const manageablePrograms = useMemo(
    () => programs.filter((program) => permissions.canManageProgram(program.id)),
    [programs, permissions]
  );

  const manageableYears = useMemo(
    () =>
      years.filter((year) =>
        permissions.canManageYear(year.id, year.program_id)
      ),
    [years, permissions]
  );

  const manageableSubjects = useMemo(
    () =>
      subjects.filter((subject) =>
        permissions.canManageSubject(subject.id, subject.year_id, subject.program_id)
      ),
    [subjects, permissions]
  );

  const createSubjectYears = useMemo(() => {
    if (!createSubjectProgramId) return manageableYears;
    return manageableYears.filter((year) => String(year.program_id) === String(createSubjectProgramId));
  }, [manageableYears, createSubjectProgramId]);

  const canCreateProgram = permissions.canCreateProgram();
  const canCreateAnyYear = manageablePrograms.some((program) => permissions.canCreateYear(program.id));
  const canCreateAnySubject = manageableYears.some((year) =>
    permissions.canCreateSubject(year.id, year.program_id)
  );
  const deletablePrograms = manageablePrograms.filter((program) => permissions.canDeleteProgram(program.id));
  const deletableYears = manageableYears.filter((year) => permissions.canDeleteYear(year.id, year.program_id));
  const deletableSubjects = manageableSubjects.filter((subject) =>
    permissions.canDeleteSubject(subject.id, subject.year_id, subject.program_id)
  );
  const hasDeleteAccess =
    deletablePrograms.length > 0 || deletableYears.length > 0 || deletableSubjects.length > 0;

  const handleCreateProgram = async (event) => {
    event.preventDefault();
    if (!canCreateProgram) return;

    setBusyAction('create-program');
    setMessage(null);
    try {
      await api.post('/create-program', { program_name: programName.trim() }, { adminAction: true });
      setProgramName('');
      setMessage({ type: 'success', text: 'Program created successfully.' });
      await loadStructure();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.detail?.detail || err?.message || 'Failed to create program.'
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleCreateYear = async (event) => {
    event.preventDefault();
    if (!createYearProgramId || !permissions.canCreateYear(createYearProgramId)) return;

    setBusyAction('create-year');
    setMessage(null);
    try {
      await api.post(
        '/create-year',
        { program_id: createYearProgramId, year_number: parseInt(yearNumber, 10) },
        { adminAction: true }
      );
      setYearNumber('');
      setMessage({ type: 'success', text: 'Year created successfully.' });
      await loadStructure();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.detail?.detail || err?.message || 'Failed to create year.'
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleCreateSubject = async (event) => {
    event.preventDefault();
    const selectedYear = years.find((year) => String(year.id) === String(createSubjectYearId));
    if (!selectedYear) return;
    if (!permissions.canCreateSubject(selectedYear.id, selectedYear.program_id)) return;

    setBusyAction('create-subject');
    setMessage(null);
    try {
      await api.post(
        '/create-subject',
        { year_id: selectedYear.id, subject_name: subjectName.trim() },
        { adminAction: true }
      );
      setSubjectName('');
      setMessage({ type: 'success', text: 'Subject created successfully.' });
      await loadStructure();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.detail?.detail || err?.message || 'Failed to create subject.'
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!permissions.canDeleteProgram(programId)) return;
    setBusyAction(`delete-program-${programId}`);
    setMessage(null);
    setDeleteError('');
    try {
      await api.request(
        '/delete-program',
        { method: 'DELETE', body: { program_id: programId } },
        { adminAction: true }
      );
      setMessage({ type: 'success', text: 'Program deleted successfully.' });
      await loadStructure();
      return true;
    } catch (err) {
      const errorText = err?.detail?.detail || err?.message || 'Failed to delete program.';
      setMessage({
        type: 'error',
        text: errorText
      });
      setDeleteError(errorText);
      return false;
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteYear = async (yearId, programId) => {
    if (!permissions.canDeleteYear(yearId, programId)) return;
    setBusyAction(`delete-year-${yearId}`);
    setMessage(null);
    setDeleteError('');
    try {
      await api.request(
        '/delete-year',
        { method: 'DELETE', body: { year_id: yearId } },
        { adminAction: true }
      );
      setMessage({ type: 'success', text: 'Year deleted successfully.' });
      await loadStructure();
      return true;
    } catch (err) {
      const errorText = err?.detail?.detail || err?.message || 'Failed to delete year.';
      setMessage({
        type: 'error',
        text: errorText
      });
      setDeleteError(errorText);
      return false;
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteSubject = async (subject) => {
    if (!permissions.canDeleteSubject(subject.id, subject.year_id, subject.program_id)) return;
    setBusyAction(`delete-subject-${subject.id}`);
    setMessage(null);
    setDeleteError('');
    try {
      await api.request(
        '/delete-subject',
        { method: 'DELETE', body: { subject_id: subject.id } },
        { adminAction: true }
      );
      setMessage({ type: 'success', text: 'Subject deleted successfully.' });
      await loadStructure();
      return true;
    } catch (err) {
      const errorText = err?.detail?.detail || err?.message || 'Failed to delete subject.';
      setMessage({
        type: 'error',
        text: errorText
      });
      setDeleteError(errorText);
      return false;
    } finally {
      setBusyAction('');
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(null);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  const openDeleteDialog = (config) => {
    setDeleteDialog(config);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return;
    let deleted = false;

    if (deleteDialog.kind === 'program') {
      deleted = await handleDeleteProgram(deleteDialog.id);
    }

    if (deleteDialog.kind === 'year' && !deleted) {
      deleted = await handleDeleteYear(deleteDialog.id, deleteDialog.programId);
    }

    if (deleteDialog.kind === 'subject' && !deleted) {
      deleted = await handleDeleteSubject(deleteDialog.subject);
    }

    if (deleted) {
      closeDeleteDialog();
    }
  };

  useEffect(() => {
    const hasTypeOptions =
      (deleteType === 'program' && deletablePrograms.length > 0) ||
      (deleteType === 'year' && deletableYears.length > 0) ||
      (deleteType === 'subject' && deletableSubjects.length > 0);

    if (!hasTypeOptions) {
      if (deletablePrograms.length > 0) setDeleteType('program');
      else if (deletableYears.length > 0) setDeleteType('year');
      else if (deletableSubjects.length > 0) setDeleteType('subject');
    }
  }, [deleteType, deletablePrograms, deletableYears, deletableSubjects]);

  const deleteTargets = useMemo(() => {
    if (deleteType === 'program') {
      return deletablePrograms.map((program) => ({
        id: program.id,
        label: program.name,
        dialog: {
          kind: 'program',
          id: program.id,
          label: program.name,
          title: 'Delete Program',
          danger: 'This will permanently delete this program if it has no years. This action cannot be undone.'
        }
      }));
    }

    if (deleteType === 'year') {
      return deletableYears.map((year) => ({
        id: year.id,
        label: `Year ${year.year_number} - ${year.program_name}`,
        dialog: {
          kind: 'year',
          id: year.id,
          programId: year.program_id,
          label: `Year ${year.year_number} - ${year.program_name}`,
          title: 'Delete Year',
          danger: 'This will permanently delete this year if it has no subjects. This action cannot be undone.'
        }
      }));
    }

    return deletableSubjects.map((subject) => ({
      id: subject.id,
      label: `${subject.subject} (${subject.Program} - Year ${subject.Year})`,
      dialog: {
        kind: 'subject',
        id: subject.id,
        subject,
        label: subject.subject,
        title: 'Delete Subject',
        danger: 'This will permanently delete this subject if it has no active resources. This action cannot be undone.'
      }
    }));
  }, [deleteType, deletablePrograms, deletableYears, deletableSubjects]);

  useEffect(() => {
    if (deleteTargets.length === 0) {
      if (deleteTargetId !== '') setDeleteTargetId('');
      return;
    }

    const hasSelectedTarget = deleteTargets.some(
      (target) => String(target.id) === String(deleteTargetId)
    );
    if (!hasSelectedTarget) {
      setDeleteTargetId(String(deleteTargets[0].id));
    }
  }, [deleteTargets, deleteTargetId]);

  const isDeleteConfirmMatch =
    deleteDialog &&
    deleteConfirmText.trim() === String(deleteDialog.label ?? '').trim();

  return (
    <div className="structure-manager">
      <h2>Structure Management</h2>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="structure-grid">
        <section className="structure-card">
          <h3>Programs</h3>
          {canCreateProgram ? (
            <form onSubmit={handleCreateProgram} className="structure-form">
              <input
                className="structure-input"
                type="text"
                placeholder="Program name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                required
              />
              <button className="structure-button" disabled={isBusy || !programName.trim()}>
                {busyAction === 'create-program' ? 'Creating...' : 'Create Program'}
              </button>
            </form>
          ) : (
            <p>You do not have permission to create programs.</p>
          )}

          <ul className="data-list">
            {manageablePrograms.length === 0 ? (
              <li className="data-item">No manageable programs</li>
            ) : (
              manageablePrograms.map((program) => (
                <li className="data-item" key={program.id}>
                  <div>{program.name}</div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="structure-card">
          <h3>Years</h3>
          {canCreateAnyYear ? (
            <form onSubmit={handleCreateYear} className="structure-form">
              <select
                className="structure-select"
                value={createYearProgramId}
                onChange={(e) => setCreateYearProgramId(e.target.value)}
                required
              >
                <option value="">Select program</option>
                {manageablePrograms
                  .filter((program) => permissions.canCreateYear(program.id))
                  .map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
              </select>
              <input
                className="structure-input"
                type="number"
                placeholder="Year number"
                value={yearNumber}
                onChange={(e) => setYearNumber(e.target.value)}
                min="1"
                required
              />
              <button
                className="structure-button"
                disabled={
                  isBusy ||
                  !createYearProgramId ||
                  !yearNumber ||
                  !permissions.canCreateYear(createYearProgramId)
                }
              >
                {busyAction === 'create-year' ? 'Creating...' : 'Create Year'}
              </button>
            </form>
          ) : (
            <p>You do not have permission to create years.</p>
          )}

          <ul className="data-list">
            {manageableYears.length === 0 ? (
              <li className="data-item">No manageable years</li>
            ) : (
              manageableYears.map((year) => (
                <li className="data-item" key={year.id}>
                  <div>Year {year.year_number} - {year.program_name}</div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="structure-card">
          <h3>Subjects</h3>
          {canCreateAnySubject ? (
            <form onSubmit={handleCreateSubject} className="structure-form">
              <select
                className="structure-select"
                value={createSubjectProgramId}
                onChange={(e) => {
                  setCreateSubjectProgramId(e.target.value);
                  setCreateSubjectYearId('');
                }}
              >
                <option value="">All manageable programs</option>
                {manageablePrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              <select
                className="structure-select"
                value={createSubjectYearId}
                onChange={(e) => setCreateSubjectYearId(e.target.value)}
                required
              >
                <option value="">Select year</option>
                {createSubjectYears
                  .filter((year) => permissions.canCreateSubject(year.id, year.program_id))
                  .map((year) => (
                    <option key={year.id} value={year.id}>
                      Year {year.year_number} - {year.program_name}
                    </option>
                  ))}
              </select>
              <input
                className="structure-input"
                type="text"
                placeholder="Subject name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
              />
              <button
                className="structure-button"
                disabled={isBusy || !createSubjectYearId || !subjectName.trim()}
              >
                {busyAction === 'create-subject' ? 'Creating...' : 'Create Subject'}
              </button>
            </form>
          ) : (
            <p>You do not have permission to create subjects.</p>
          )}

          <ul className="data-list">
            {manageableSubjects.length === 0 ? (
              <li className="data-item">No manageable subjects</li>
            ) : (
              manageableSubjects.map((subject) => (
                <li className="data-item" key={subject.id}>
                  <div>{subject.subject} - {subject.Program} Year {subject.Year}</div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {hasDeleteAccess && (
        <section className="danger-zone">
          <h3>Danger Zone</h3>
          <p className="danger-zone-text">Deletion is permanent. Select one target and confirm carefully.</p>
          <div className="danger-zone-controls">
            <select
              className="structure-select danger-select"
              value={deleteType}
              onChange={(event) => setDeleteType(event.target.value)}
            >
              {deletablePrograms.length > 0 && <option value="program">Program</option>}
              {deletableYears.length > 0 && <option value="year">Year</option>}
              {deletableSubjects.length > 0 && <option value="subject">Subject</option>}
            </select>
            <select
              className="structure-select danger-select"
              value={deleteTargetId}
              onChange={(event) => setDeleteTargetId(event.target.value)}
            >
              <option value="">Select item to delete</option>
              {deleteTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="structure-button danger-delete"
              disabled={!deleteTargetId || isBusy}
              onClick={() => {
                const target = deleteTargets.find((item) => String(item.id) === String(deleteTargetId));
                if (target) openDeleteDialog(target.dialog);
              }}
            >
              Delete Selected
            </button>
          </div>
        </section>
      )}

      {deleteDialog && (
        <div className="danger-modal-overlay" onClick={closeDeleteDialog}>
          <div className="danger-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{deleteDialog.title}</h3>
            <p className="danger-text">{deleteDialog.danger}</p>
            {deleteError && (
              <p className="danger-text" style={{ color: '#b91c1c', fontWeight: 600 }}>
                {deleteError}
              </p>
            )}
            <p className="danger-confirm-label">
              To confirm, type: <strong>{deleteDialog.label}</strong>
            </p>
            <input
              className="structure-input"
              type="text"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              placeholder="Type exact name"
            />
            <div className="danger-actions">
              <button type="button" className="structure-button danger-cancel" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button
                type="button"
                className="structure-button danger-delete"
                onClick={handleConfirmDelete}
                disabled={isBusy || !isDeleteConfirmMatch}
              >
                {isBusy ? 'Deleting...' : 'I understand, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
