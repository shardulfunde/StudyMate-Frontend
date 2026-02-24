import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import PDFViewer from './PDFViewer';
import TestContainer from './test-ui/TestContainer';
import AcademicBadge from './badges/AcademicBadge';
import './ResourceCard.css';

const RESOURCE_ICONS = ['📘', '📗', '📙', '📕', '🗂️', '🧾', '📝', '📄'];

function pickResourceIcon(seed = '') {
  const str = String(seed || '');
  const hash = [...str].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return RESOURCE_ICONS[hash % RESOURCE_ICONS.length];
}

export default function ResourceCard({
  resource,
  canManageActions = false,
  onGenerateEmbeddings,
  onDelete
}) {
  const [viewUrl, setViewUrl] = useState(null);
  const [mode, setMode] = useState('inline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const menuRef = useRef(null);

  const embeddingStatus = resource.embedding_status;
  const isEmbeddingCompleted = embeddingStatus === 'completed';
  const isEmbeddingProcessing = embeddingStatus === 'processing';
  const isEmbeddingFailed = embeddingStatus === 'failed';
  const showProcessingSpinner = isEmbeddingProcessing || isGenerating;
  const canGenerate = Boolean(canManageActions && onGenerateEmbeddings);
  const generateDisabled =
    !canGenerate || isEmbeddingCompleted || isEmbeddingProcessing || isGenerating;

  const embeddingActionLabel = useMemo(() => {
    if (isEmbeddingProcessing) return 'Generating Embedding';
    if (isEmbeddingCompleted) return 'Embedded';
    if (isEmbeddingFailed) return 'Retry';
    return 'Generate Embedding';
  }, [isEmbeddingCompleted, isEmbeddingFailed, isEmbeddingProcessing]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleView = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.get(`/view/${resource.id}`);
      setMode(data.mode);
      setViewUrl(data.url);
    } catch (e) {
      console.error(e);
      setError(e.detail?.detail || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.stopPropagation();
    if (generateDisabled) return;
    setMenuOpen(false);
    setIsGenerating(true);
    try {
      await onGenerateEmbeddings(resource.id);
    } catch {
      // Parent handles toast errors.
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (!canManageActions || !onDelete) return;
    setMenuOpen(false);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(resource.id);
      setConfirmDeleteOpen(false);
    } catch {
      // Parent handles toast errors. Keep modal open for retry.
    } finally {
      setDeleting(false);
    }
  };

  const openTestModal = () => setTestModalOpen(true);
  const closeTestModal = () => setTestModalOpen(false);

  const dateStr = resource.created_at
    ? new Date(resource.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';
  const resourceIcon = pickResourceIcon(resource.title || resource.id);
  const uploadedByEmail = typeof resource?.uploaded_by === 'string'
    ? resource.uploaded_by
    : (resource?.uploaded_by?.email || '');
  const uploaderHandle = uploadedByEmail ? uploadedByEmail.split('@')[0] : 'uploader';

  return (
    <>
      <div className="resource-card sm-resource-card">
        {/* HEADER: Icon, Title, and Menu */}
        <div className="rc-header">
          <div className="rc-title-area">
            <div className="rc-icon" aria-hidden="true">{resourceIcon}</div>
            <h3 className="rc-title" title={resource.title}>{resource.title}</h3>
          </div>
          
          <div className="rc-menu-container" ref={menuRef}>
            <button
              type="button"
              className="rc-btn-menu"
              aria-label="Open resource actions"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              &#8942;
            </button>

            {menuOpen && (
              <div className="rc-dropdown" role="menu" onClick={(e) => e.stopPropagation()}>
                <div className="rc-dropdown-label">By: {uploadedByEmail || 'Unknown'}</div>
                {canManageActions && (
                  <>
                    <div className="rc-dropdown-divider" />
                    <button
                      type="button"
                      className={`rc-dropdown-item ${isEmbeddingCompleted ? 'is-completed' : ''}`}
                      disabled={generateDisabled}
                      onClick={handleGenerate}
                    >
                      <span>{embeddingActionLabel}</span>
                      {showProcessingSpinner && <span className="rc-menu-spinner" aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      className="rc-dropdown-item delete"
                      onClick={handleDeleteClick}
                    >
                      Delete Resource
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BODY: Meta info and Badges */}
        <div className="rc-body">
          <p className="rc-meta">
            {uploadedByEmail && <span className="rc-author">{uploaderHandle}</span>}
            {uploadedByEmail && dateStr && <span className="rc-separator">•</span>}
            {dateStr && <span className="rc-date">{dateStr}</span>}
          </p>
          
          <div className="rc-badge-row">
            <AcademicBadge size="sm" />
          </div>

          {error && <div className="rc-error">{error}</div>}
        </div>

        {/* FOOTER: Actions */}
        <div className="rc-footer">
          <button
            type="button"
            className="rc-btn rc-btn-secondary rc-btn-view"
            onClick={handleView}
            disabled={loading}
          >
            {loading ? 'Opening...' : 'View'}
          </button>
          
          {isEmbeddingCompleted && (
            <button
              type="button"
              className="rc-btn rc-btn-secondary rc-btn-generate"
              onClick={openTestModal}
            >
              Generate Test
            </button>
          )}
        </div>
      </div>

      {/* Modals remain structurally the same, just styled nicely via CSS */}
      {confirmDeleteOpen && (
        <div className="rc-modal-overlay" onClick={() => !deleting && setConfirmDeleteOpen(false)}>
          <div className="rc-modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Delete resource?</h4>
            <p>This action cannot be undone. It will be permanently removed.</p>
            <div className="rc-modal-actions">
              <button
                type="button"
                className="rc-btn-modal cancel"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rc-btn-modal delete"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TestContainer
        isOpen={testModalOpen}
        onClose={closeTestModal}
        scopeId={resource.id}
        scopeTarget="resource"
        title={`Test: ${resource.title}`}
      />

      {viewUrl && (
        <PDFViewer
          resourceId={resource.id}
          url={viewUrl}
          mode={mode}
          title={resource.title}
          embeddingStatus={resource.embedding_status}
          onClose={() => setViewUrl(null)}
        />
      )}
    </>
  );
}
