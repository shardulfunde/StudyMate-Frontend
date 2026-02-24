import { useEffect, useMemo, useState } from 'react';
import {
  api,
  approvePlatformResource,
  approvePlatformSubject,
  getPlatformResources,
  getPlatformSubjects,
  previewPlatformResource,
  rejectPlatformResource,
  rejectPlatformSubject
} from '../services/api';
import PDFViewer from '../components/PDFViewer';
import './PlatformApprovalsPage.css';

function readField(item, keys, fallback = '-') {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== '') {
      return item[key];
    }
  }
  return fallback;
}

function formatDate(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleString();
}

function getErrorText(error, fallback) {
  if (typeof error?.detail?.detail === 'string') return error.detail.detail;
  if (typeof error?.message === 'string') return error.message;
  return fallback;
}

export default function PlatformApprovalsPage() {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [errorResources, setErrorResources] = useState('');
  const [errorSubjects, setErrorSubjects] = useState('');
  const [processingMap, setProcessingMap] = useState({});
  const [programs, setPrograms] = useState([]);
  const [years, setYears] = useState([]);
  const [quickProgramName, setQuickProgramName] = useState('');
  const [quickYearProgramId, setQuickYearProgramId] = useState('');
  const [quickYearNumber, setQuickYearNumber] = useState('');
  const [quickSubjectProgramId, setQuickSubjectProgramId] = useState('');
  const [quickSubjectYearId, setQuickSubjectYearId] = useState('');
  const [quickSubjectName, setQuickSubjectName] = useState('');
  const [quickMessage, setQuickMessage] = useState({ type: '', text: '' });
  const [quickLoading, setQuickLoading] = useState('');
  const [rejectModal, setRejectModal] = useState({
    open: false,
    targetType: '',
    targetId: '',
    reason: '',
    error: ''
  });
  const [activePreview, setActivePreview] = useState(null);

  const isRejectingActiveItem = useMemo(() => {
    if (!rejectModal.open || !rejectModal.targetType || !rejectModal.targetId) return false;
    const key = `${rejectModal.targetType}:${rejectModal.targetId}`;
    return Boolean(processingMap[key]);
  }, [processingMap, rejectModal]);

  const loadResources = async () => {
    setLoadingResources(true);
    setErrorResources('');
    try {
      const data = await getPlatformResources('pending', { adminAction: true });
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      setResources([]);
      setErrorResources(getErrorText(error, 'Failed to load pending resources.'));
    } finally {
      setLoadingResources(false);
    }
  };

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    setErrorSubjects('');
    try {
      const data = await getPlatformSubjects('pending', { adminAction: true });
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubjects([]);
      setErrorSubjects(getErrorText(error, 'Failed to load pending subjects.'));
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    void loadResources();
    void loadSubjects();
    void loadStructure();
  }, []);

  const loadStructure = async () => {
    try {
      const [programData, yearData] = await Promise.all([
        api.get('/programs', { adminAction: true }),
        api.get('/years', { adminAction: true })
      ]);
      setPrograms(Array.isArray(programData) ? programData : []);
      setYears(Array.isArray(yearData) ? yearData : []);
    } catch {
      setPrograms([]);
      setYears([]);
    }
  };

  const subjectYears = useMemo(() => {
    if (!quickSubjectProgramId) return years;
    return years.filter((item) => String(item.program_id) === String(quickSubjectProgramId));
  }, [years, quickSubjectProgramId]);

  const setItemProcessing = (type, id, actionLabel = '') => {
    const key = `${type}:${id}`;
    setProcessingMap((prev) => ({ ...prev, [key]: actionLabel }));
  };

  const clearItemProcessing = (type, id) => {
    const key = `${type}:${id}`;
    setProcessingMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleResourcePreview = async (resourceId) => {
    setErrorResources('');
    setItemProcessing('resource', resourceId, 'preview');
    try {
      const data = await previewPlatformResource(resourceId, { adminAction: true });
      const previewUrl = data?.preview_url;
      if (!previewUrl) {
        setErrorResources('Preview URL was not returned by backend.');
        return;
      }
      const selectedResource = resources.find((item) => String(item.id) === String(resourceId));
      setActivePreview({
        url: previewUrl,
        title: selectedResource?.title || 'Resource Preview',
        resourceId,
        embeddingStatus: selectedResource?.embedding_status || 'pending'
      });
    } catch (error) {
      setErrorResources(getErrorText(error, 'Failed to preview resource.'));
    } finally {
      clearItemProcessing('resource', resourceId);
    }
  };

  const handleResourceApprove = async (resourceId) => {
    setErrorResources('');
    setItemProcessing('resource', resourceId, 'approve');
    try {
      await approvePlatformResource(resourceId, { adminAction: true });
      setResources((prev) => prev.filter((item) => String(item.id) !== String(resourceId)));
    } catch (error) {
      setErrorResources(getErrorText(error, 'Failed to approve resource.'));
    } finally {
      clearItemProcessing('resource', resourceId);
    }
  };

  const handleSubjectApprove = async (subjectId) => {
    setErrorSubjects('');
    setItemProcessing('subject', subjectId, 'approve');
    try {
      await approvePlatformSubject(subjectId, { adminAction: true });
      setSubjects((prev) => prev.filter((item) => String(item.id) !== String(subjectId)));
    } catch (error) {
      setErrorSubjects(getErrorText(error, 'Failed to approve subject.'));
    } finally {
      clearItemProcessing('subject', subjectId);
    }
  };

  const openRejectModal = (targetType, targetId) => {
    setRejectModal({
      open: true,
      targetType,
      targetId,
      reason: '',
      error: ''
    });
  };

  const closeRejectModal = () => {
    if (isRejectingActiveItem) return;
    setRejectModal({
      open: false,
      targetType: '',
      targetId: '',
      reason: '',
      error: ''
    });
  };

  const submitRejection = async () => {
    const reason = rejectModal.reason.trim();
    if (!reason) {
      setRejectModal((prev) => ({ ...prev, error: 'Rejection reason is required.' }));
      return;
    }

    const { targetType, targetId } = rejectModal;
    setRejectModal((prev) => ({ ...prev, error: '' }));
    setItemProcessing(targetType, targetId, 'reject');

    try {
      if (targetType === 'resource') {
        await rejectPlatformResource(targetId, reason, { adminAction: true });
        setResources((prev) => prev.filter((item) => String(item.id) !== String(targetId)));
      } else {
        await rejectPlatformSubject(targetId, reason, { adminAction: true });
        setSubjects((prev) => prev.filter((item) => String(item.id) !== String(targetId)));
      }
      closeRejectModal();
    } catch (error) {
      const text = getErrorText(error, `Failed to reject ${targetType}.`);
      if (targetType === 'resource') setErrorResources(text);
      if (targetType === 'subject') setErrorSubjects(text);
      setRejectModal((prev) => ({ ...prev, error: text }));
    } finally {
      clearItemProcessing(targetType, targetId);
    }
  };

  const handleCreateProgram = async (event) => {
    event.preventDefault();
    const name = quickProgramName.trim();
    if (!name) return;

    setQuickLoading('program');
    setQuickMessage({ type: '', text: '' });
    try {
      await api.post('/create-program', { program_name: name }, { adminAction: true });
      setQuickProgramName('');
      setQuickMessage({ type: 'success', text: 'Program created.' });
      await loadStructure();
    } catch (error) {
      setQuickMessage({ type: 'error', text: getErrorText(error, 'Failed to create program.') });
    } finally {
      setQuickLoading('');
    }
  };

  const handleCreateYear = async (event) => {
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
      await loadStructure();
    } catch (error) {
      setQuickMessage({ type: 'error', text: getErrorText(error, 'Failed to create year.') });
    } finally {
      setQuickLoading('');
    }
  };

  const handleCreateSubject = async (event) => {
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
        text: 'Subject created. It is now pending moderator review and approval.'
      });
      await Promise.all([loadStructure(), loadSubjects()]);
    } catch (error) {
      setQuickMessage({ type: 'error', text: getErrorText(error, 'Failed to create subject.') });
    } finally {
      setQuickLoading('');
    }
  };

  return (
    <div className="platform-approvals">
      <div className="platform-approvals__container">
        <div className="platform-approvals__header">
          <h1>Platform Approvals</h1>
          <p>Review pending resources and subjects.</p>
        </div>
        <section className="quick-structure-panel">
          <h3>Quick Create</h3>
          <p>Create program/year/subject here if needed while reviewing approvals.</p>
          {quickMessage.text && (
            <div className={`message ${quickMessage.type === 'error' ? 'error' : 'success'}`}>
              {quickMessage.text}
            </div>
          )}
          <div className="quick-structure-grid">
            <form onSubmit={handleCreateProgram} className="quick-structure-form">
              <label>Program</label>
              <input
                type="text"
                value={quickProgramName}
                onChange={(event) => setQuickProgramName(event.target.value)}
                placeholder="Program name"
              />
              <button type="submit" className="approval-btn" disabled={quickLoading === 'program' || !quickProgramName.trim()}>
                {quickLoading === 'program' ? 'Creating...' : 'Create Program'}
              </button>
            </form>

            <form onSubmit={handleCreateYear} className="quick-structure-form">
              <label>Year</label>
              <select
                value={quickYearProgramId}
                onChange={(event) => setQuickYearProgramId(event.target.value)}
                required
              >
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>{program.name}</option>
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
              <button type="submit" className="approval-btn" disabled={quickLoading === 'year' || !quickYearProgramId || !quickYearNumber}>
                {quickLoading === 'year' ? 'Creating...' : 'Create Year'}
              </button>
            </form>

            <form onSubmit={handleCreateSubject} className="quick-structure-form">
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
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
              <select
                value={quickSubjectYearId}
                onChange={(event) => setQuickSubjectYearId(event.target.value)}
                required
              >
                <option value="">Select year</option>
                {subjectYears.map((year) => (
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
              <p className="quick-note">New subjects are created as pending and need moderator approval.</p>
              <button
                type="submit"
                className="approval-btn"
                disabled={quickLoading === 'subject' || !quickSubjectYearId || !quickSubjectName.trim()}
              >
                {quickLoading === 'subject' ? 'Creating...' : 'Create Subject'}
              </button>
            </form>
          </div>
        </section>

        <section className="approval-section">
          <div className="approval-section__head">
            <h2>Pending Resources</h2>
          </div>

          {errorResources && <div className="message error">{errorResources}</div>}
          {loadingResources ? (
            <p>Loading pending resources...</p>
          ) : resources.length === 0 ? (
            <p>No pending resources.</p>
          ) : (
            <div className="approval-list">
              {resources.map((resource) => {
                const itemKey = `resource:${resource.id}`;
                const action = processingMap[itemKey];
                const isBusy = Boolean(action);

                return (
                  <article key={resource.id} className="approval-item">
                    <div className="approval-item__meta">
                      <p><strong>Title:</strong> {readField(resource, ['title', 'name'])}</p>
                      <p><strong>College:</strong> {readField(resource, ['college', 'college_name', 'College'])}</p>
                      <p><strong>Program:</strong> {readField(resource, ['program', 'program_name', 'Program'])}</p>
                      <p><strong>Year:</strong> {readField(resource, ['year', 'year_number', 'Year'])}</p>
                      <p><strong>Subject:</strong> {readField(resource, ['subject', 'subject_name', 'Subject'])}</p>
                      <p><strong>Uploaded by:</strong> {readField(resource, ['uploaded_by', 'uploadedBy'])}</p>
                      <p><strong>Created at:</strong> {formatDate(readField(resource, ['created_at'], ''))}</p>
                    </div>
                    <div className="approval-item__actions">
                      <button
                        type="button"
                        className="approval-btn"
                        onClick={() => handleResourcePreview(resource.id)}
                        disabled={isBusy}
                      >
                        {action === 'preview' ? 'Processing...' : 'Preview'}
                      </button>
                      <button
                        type="button"
                        className="approval-btn"
                        onClick={() => handleResourceApprove(resource.id)}
                        disabled={isBusy}
                      >
                        {action === 'approve' ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="approval-btn approval-reject-btn"
                        onClick={() => openRejectModal('resource', resource.id)}
                        disabled={isBusy}
                      >
                        {action === 'reject' ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="approval-section">
          <div className="approval-section__head">
            <h2>Pending Subjects</h2>
          </div>

          {errorSubjects && <div className="message error">{errorSubjects}</div>}
          {loadingSubjects ? (
            <p>Loading pending subjects...</p>
          ) : subjects.length === 0 ? (
            <p>No pending subjects.</p>
          ) : (
            <div className="approval-list">
              {subjects.map((subject) => {
                const itemKey = `subject:${subject.id}`;
                const action = processingMap[itemKey];
                const isBusy = Boolean(action);

                return (
                  <article key={subject.id} className="approval-item">
                    <div className="approval-item__meta">
                      <p><strong>Title:</strong> {readField(subject, ['title', 'name', 'subject', 'subject_name'])}</p>
                      <p><strong>College:</strong> {readField(subject, ['college', 'college_name', 'College'])}</p>
                      <p><strong>Program:</strong> {readField(subject, ['program', 'program_name', 'Program'])}</p>
                      <p><strong>Year:</strong> {readField(subject, ['year', 'year_number', 'Year'])}</p>
                      <p><strong>Subject:</strong> {readField(subject, ['subject', 'name', 'subject_name', 'Subject'])}</p>
                      <p><strong>Created at:</strong> {formatDate(readField(subject, ['created_at'], ''))}</p>
                    </div>
                    <div className="approval-item__actions">
                      <button
                        type="button"
                        className="approval-btn"
                        onClick={() => handleSubjectApprove(subject.id)}
                        disabled={isBusy}
                      >
                        {action === 'approve' ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="approval-btn approval-reject-btn"
                        onClick={() => openRejectModal('subject', subject.id)}
                        disabled={isBusy}
                      >
                        {action === 'reject' ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {rejectModal.open && (
        <div className="approval-modal-overlay" onClick={closeRejectModal}>
          <div className="approval-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Reject {rejectModal.targetType}</h3>
            <p>Please provide a rejection reason.</p>
            <textarea
              rows={4}
              value={rejectModal.reason}
              onChange={(event) =>
                setRejectModal((prev) => ({ ...prev, reason: event.target.value, error: '' }))
              }
              placeholder="Enter rejection reason"
              disabled={isRejectingActiveItem}
            />
            {rejectModal.error && <div className="message error">{rejectModal.error}</div>}
            <div className="approval-modal__actions">
              <button
                type="button"
                className="approval-btn approval-cancel-btn"
                onClick={closeRejectModal}
                disabled={isRejectingActiveItem}
              >
                Cancel
              </button>
              <button
                type="button"
                className="approval-btn approval-reject-btn"
                onClick={submitRejection}
                disabled={isRejectingActiveItem}
              >
                {isRejectingActiveItem ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
      {activePreview && (
        <PDFViewer
          url={activePreview.url}
          title={activePreview.title}
          resourceId={activePreview.resourceId}
          embeddingStatus={activePreview.embeddingStatus}
          onClose={() => setActivePreview(null)}
        />
      )}
    </div>
  );
}
