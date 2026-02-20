import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useCapabilities } from '../context/CapabilityContext';
import { buildPermissions } from '../utils/permissions';
import UploadModal from './UploadModal';

export default function AdminUploadManager() {
  const { capabilities } = useCapabilities();
  const permissions = buildPermissions(capabilities);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get('/subjects', { adminAction: true });
        setSubjects(Array.isArray(data) ? data : []);
      } catch (e) {
        setSubjects([]);
        setError(e?.detail?.detail || e?.message || 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const manageableSubjects = useMemo(
    () =>
      subjects.filter((subject) =>
        permissions.canManageResourceSubject(
          subject.id,
          subject.year_id,
          subject.program_id
        )
      ),
    [subjects, permissions]
  );

  const programs = useMemo(() => {
    const map = new Map();
    manageableSubjects.forEach((subject) => {
      if (!map.has(subject.program_id)) {
        map.set(subject.program_id, {
          id: subject.program_id,
          name: subject.Program || 'Unnamed Program'
        });
      }
    });
    return Array.from(map.values());
  }, [manageableSubjects]);

  const years = useMemo(() => {
    const map = new Map();
    manageableSubjects
      .filter((subject) =>
        selectedProgramId ? String(subject.program_id) === String(selectedProgramId) : true
      )
      .forEach((subject) => {
        if (!map.has(subject.year_id)) {
          map.set(subject.year_id, {
            id: subject.year_id,
            label: `Year ${subject.Year}`
          });
        }
      });
    return Array.from(map.values());
  }, [manageableSubjects, selectedProgramId]);

  const filteredSubjects = useMemo(
    () =>
      manageableSubjects.filter((subject) => {
        const matchesProgram = selectedProgramId
          ? String(subject.program_id) === String(selectedProgramId)
          : true;
        const matchesYear = selectedYearId
          ? String(subject.year_id) === String(selectedYearId)
          : true;
        return matchesProgram && matchesYear;
      }),
    [manageableSubjects, selectedProgramId, selectedYearId]
  );

  const selectedSubject = useMemo(
    () => manageableSubjects.find((subject) => String(subject.id) === String(selectedSubjectId)),
    [manageableSubjects, selectedSubjectId]
  );

  const openUpload = () => {
    if (!selectedSubjectId) return;
    setUploadOpen(true);
  };

  return (
    <div className="structure-manager">
      <h2>Notes Upload</h2>
      <p className="admin-subtitle">Upload notes only to subjects you are authorized to manage.</p>

      {error && <div className="message error">{error}</div>}
      {loading && <p>Loading subjects...</p>}

      {!loading && manageableSubjects.length === 0 && (
        <div className="message error">You do not have upload permissions on any subject.</div>
      )}

      {!loading && manageableSubjects.length > 0 && (
        <div className="structure-card">
          <div className="structure-form">
            <select
              className="structure-select"
              value={selectedProgramId}
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
                setSelectedYearId('');
                setSelectedSubjectId('');
              }}
            >
              <option value="">All manageable programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>

            <select
              className="structure-select"
              value={selectedYearId}
              onChange={(e) => {
                setSelectedYearId(e.target.value);
                setSelectedSubjectId('');
              }}
            >
              <option value="">All manageable years</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
            </select>

            <select
              className="structure-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              <option value="">Select subject</option>
              {filteredSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject} ({subject.Program} - Year {subject.Year})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="structure-button"
              onClick={openUpload}
              disabled={!selectedSubjectId}
            >
              Upload Notes
            </button>
          </div>
        </div>
      )}

      {uploadOpen && selectedSubject && (
        <UploadModal
          subjectId={selectedSubject.id}
          resourceType="notes"
          onClose={() => setUploadOpen(false)}
          onDone={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
}
