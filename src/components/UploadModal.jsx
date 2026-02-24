import { useState, useRef } from 'react';
import { api, confirmUpload } from '../services/api';
import './UploadModal.css';

const MAX_MB = 25;

export default function UploadModal({ subjectId, onClose, onDone, resourceType = 'notes' }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false); // New success state
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
        
        if (response.status !== 204) {
          const text = await response.text().catch(() => '');
          throw new Error(`S3 Upload failed: ${response.status} ${text}`);
        }
        return true;
      }

      await uploadToS3(upload_url, fields, file);
      await confirmUpload(subjectId, title.trim(), resourceType, file_key, { adminAction: true });
      
      // Trigger the dopamine hit!
      setIsSuccess(true);
      
      // Wait 1.8 seconds so they can enjoy the animation before closing
      setTimeout(() => {
        onDone();
      }, 1800);

    } catch (err) {
      setError(err.detail?.detail || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        
        {isSuccess ? (
          // --- DOPAMINE SUCCESS SCREEN ---
          <div className="upload-success-content">
            <div className="success-icon-wrapper">
              <svg className="dopamine-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3>Upload Complete!</h3>
            <p>Your {resourceType} have been uploaded and sent for moderator review.</p>
            <p className="upload-review-note">You can access them after approval.</p>
          </div>
        ) : (
          // --- ORIGINAL FORM ---
          <>
            <div className="upload-modal-header">
              <div>
                <h2>Upload Resource</h2>
                <p className="upload-modal-subtitle">Add a {resourceType} file for this subject. Submissions are reviewed before approval.</p>
              </div>
              <button type="button" className="upload-modal-close" onClick={onClose} disabled={loading}>
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
                  disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                {file && <span className="upload-filename">{file.name}</span>}
              </label>

              {error && <p className="upload-error">{error}</p>}

              <div className="upload-modal-actions">
                <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
