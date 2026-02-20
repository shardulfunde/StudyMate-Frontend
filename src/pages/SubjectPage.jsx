import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api, generateEmbeddings } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import Skeleton from '../components/Skeleton';
import UploadModal from '../components/UploadModal';
import { useCapabilities } from '../context/CapabilityContext';
import { useToast } from '../context/ToastContext';
import { buildPermissions } from '../utils/permissions';
import './SubjectPage.css';

export default function SubjectPage() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const resourceType = searchParams.get('type') || 'notes';
  const { capabilities } = useCapabilities();
  const permissions = useMemo(() => buildPermissions(capabilities), [capabilities]);
  const { showToast } = useToast();

  const [resources, setResources] = useState([]);
  const [subjectMeta, setSubjectMeta] = useState(null);
  const [canUpload, setCanUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const subjectKey = useMemo(
    () => (subjectId ? String(subjectId) : null),
    [subjectId]
  );

  const canManageSubject = useMemo(
    () => {
      if (!subjectKey || !subjectMeta) return false;
      return permissions.canManageResourceSubject(
        subjectKey,
        subjectMeta.year_id,
        subjectMeta.program_id
      );
    },
    [subjectKey, subjectMeta, permissions]
  );

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/resources/${subjectId}/${resourceType}`)
      .then((res) => {
        setResources(res);
      })
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [subjectId, resourceType]);

  useEffect(() => {
    if (subjectId) load();
  }, [subjectId, load]);

  useEffect(() => {
    if (!subjectId) {
      setSubjectMeta(null);
      return;
    }

    api
      .get('/subjects')
      .then((allSubjects) => {
        const list = Array.isArray(allSubjects) ? allSubjects : [];
        const match = list.find((subject) => String(subject.id) === String(subjectId));
        setSubjectMeta(match || null);
      })
      .catch(() => setSubjectMeta(null));
  }, [subjectId]);

  useEffect(() => {
    setCanUpload(canManageSubject);
  }, [canManageSubject]);

  const handleUploadDone = () => {
    setUploadOpen(false);
    load();
  };

  const removeResource = useCallback((resourceId) => {
    setResources((prev) => prev.filter((res) => String(res.id) !== String(resourceId)));
  }, []);

  const getErrorMessage = useCallback((err, fallback) => {
    const base =
      err?.detail?.message ||
      err?.detail?.detail ||
      err?.message ||
      fallback;
    return err?.status ? base : `${base}. Please retry.`;
  }, []);

  const handleGenerateEmbeddings = useCallback(async (resourceId) => {
    let previousStatus;

    setResources((prev) =>
      prev.map((res) => {
        if (String(res.id) !== String(resourceId)) return res;
        previousStatus = res.embedding_status;
        return { ...res, embedding_status: 'processing' };
      })
    );

    try {
      await generateEmbeddings(resourceId, { adminAction: true });
      showToast('Embedding generation started', 'success');
    } catch (err) {
      setResources((prev) =>
        prev.map((res) =>
          String(res.id) === String(resourceId)
            ? { ...res, embedding_status: previousStatus }
            : res
        )
      );
      showToast(getErrorMessage(err, 'Failed to start embedding generation'), 'error');
      throw err;
    }
  }, [getErrorMessage, showToast]);

  const handleDeleteResource = useCallback(async (resourceId) => {
    try {
      await api.delete(`/resources/${resourceId}`, { adminAction: true });
      removeResource(resourceId);
      showToast('Resource deleted', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete resource'), 'error');
      throw err;
    }
  }, [getErrorMessage, removeResource, showToast]);

  return (
    <div className="subject-page">
      <div className="subject-page-header">
        <h1>Subject Resources</h1>
        {canUpload && (
          <button type="button" className="btn-upload" onClick={() => setUploadOpen(true)}>
            Upload resource
          </button>
        )}
      </div>

      {loading && <Skeleton cardCount={6} columns={3} />}

      {!loading && resources.length === 0 && (
        <p className="subject-empty">
          No resources yet.{canUpload ? ' Upload one to get started.' : ''}
        </p>
      )}

      {!loading && resources.length > 0 && (
        <div className="resource-grid">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              canManageActions={canManageSubject}
              onGenerateEmbeddings={canManageSubject ? handleGenerateEmbeddings : null}
              onDelete={canManageSubject ? handleDeleteResource : null}
            />
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadModal
          subjectId={subjectId}
          resourceType={resourceType}
          onClose={() => setUploadOpen(false)}
          onDone={handleUploadDone}
        />
      )}
    </div>
  );
}
