import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import PDFViewer from './PDFViewer';
import TestContainer from './test-ui/TestContainer';
import './ResourceCard.css';

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

  const openTestModal = () => {
    setTestModalOpen(true);
  };

  const closeTestModal = () => {
    setTestModalOpen(false);
  };

  const dateStr = resource.created_at
    ? new Date(resource.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <>
      <div className="resource-card">
        <div className="resource-card-menu" ref={menuRef}>
          <button
            type="button"
            className="btn-menu"
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
            <div className="resource-card-dropdown" role="menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-label">Uploaded By: {resource.uploaded_by || 'Unknown'}</div>
              {canManageActions && (
                <>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className={`dropdown-item dropdown-item-embedding${isEmbeddingCompleted ? ' is-completed' : ''}`}
                    disabled={generateDisabled}
                    onClick={handleGenerate}
                  >
                    <span>{embeddingActionLabel}</span>
                    {showProcessingSpinner && <span className="menu-spinner" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    className="dropdown-item delete"
                    onClick={handleDeleteClick}
                  >
                    Delete Resource
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <h3 className="resource-card-title">{resource.title}</h3>
        <p className="resource-card-meta">
          {resource.uploaded_by && <span>By {resource.uploaded_by.split('@')[0]}</span>}
          <br />
          {dateStr && <span className="resource-date">{dateStr}</span>}
        </p>

        {error && <p className="resource-card-error">{error}</p>}

        <div className="resource-card-actions">
          <button
            type="button"
            className="btn-view"
            onClick={handleView}
            disabled={loading}
          >
            {loading ? 'Opening...' : 'View'}
          </button>
          {isEmbeddingCompleted && (
            <button
              type="button"
              className="btn-generate-test"
              onClick={openTestModal}
            >
              Generate Test
            </button>
          )}
        </div>
      </div>

      {confirmDeleteOpen && (
        <div className="resource-confirm-overlay" onClick={() => !deleting && setConfirmDeleteOpen(false)}>
          <div className="resource-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Delete resource?</h4>
            <p>This action cannot be undone.</p>
            <div className="resource-confirm-actions">
              <button
                type="button"
                className="confirm-cancel"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-delete"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Resource'}
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
          onClose={() => setViewUrl(null)}
        />
      )}
    </>
  );
}
