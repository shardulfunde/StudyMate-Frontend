import { useState, useRef } from 'react';
import { api, confirmUpload } from '../services/api';
import './UploadModal.css';

const MAX_MB = 25;

export default function UploadModal({ subjectId, onClose, onDone, resourceType = 'notes' }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB} MB`);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      setError('Please enter a title and select a file.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { upload_url, fields, file_key } = await api.post(
        `/generate-upload-url/${subjectId}/${resourceType}?filename=${encodeURIComponent(file.name)}`,
        {},
        { adminAction: true }
      );

      async function uploadToS3(uploadUrl, fieldsObj, fileObj) {
        const formData = new FormData();

        Object.entries(fieldsObj).forEach(([key, value]) => {
          formData.append(key, value);
        });

        formData.append('file', fileObj);

        const response = await fetch(uploadUrl, { method: 'POST', body: formData });

        try {
          const text = await response.text();
          console.debug('S3 upload response:', response.status, text);
        } catch {
          console.debug('S3 upload status:', response.status);
        }

        if (response.status !== 204) {
          const text = await response.text().catch(() => '');
          throw new Error(`S3 Upload failed: ${response.status} ${text}`);
        }

        return true;
      }

      await uploadToS3(upload_url, fields, file);

      await confirmUpload(subjectId, title.trim(), resourceType, file_key, { adminAction: true });
      onDone();
    } catch (err) {
      setError(err.detail?.detail || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <div>
            <h2>Upload Resource</h2>
            <p className="upload-modal-subtitle">Add a {resourceType} file for this subject.</p>
          </div>
          <button type="button" className="upload-modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <form onSubmit={handleSubmit} className="upload-modal-form">
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 1 Notes"
              required
            />
          </label>

          <label>
            File (max {MAX_MB} MB)
            <div className="upload-file-wrap">
              <input
                ref={inputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
            </div>
            {file && <span className="upload-filename">{file.name}</span>}
          </label>

          {error && <p className="upload-error">{error}</p>}

          <div className="upload-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
