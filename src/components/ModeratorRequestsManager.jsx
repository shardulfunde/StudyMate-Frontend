import { useEffect, useMemo, useState } from 'react';
import { getModeratorApplications, reviewModeratorApplication } from '../services/api';
import './ModeratorRequestsManager.css';

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
  const [processingId, setProcessingId] = useState('');

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

  const emptyText = useMemo(() => {
    if (statusFilter === 'pending') return 'No pending applications.';
    if (statusFilter === 'approved') return 'No approved applications.';
    if (statusFilter === 'rejected') return 'No rejected applications.';
    return 'No moderator applications found.';
  }, [statusFilter]);

  const handleDecision = async (applicationId, action) => {
    if (!applicationId || processingId) return;
    setProcessingId(applicationId);
    setMessage({ type: '', text: '' });

    try {
      const response = await reviewModeratorApplication(applicationId, action);
      setMessage({ type: 'success', text: response?.message || `Application ${action}d.` });
      await loadRequests(statusFilter);
    } catch (error) {
      setMessage({ type: 'error', text: getErrorText(error) });
    } finally {
      setProcessingId('');
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
            disabled={loading || Boolean(processingId)}
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

      {loading ? (
        <p>Loading moderator applications...</p>
      ) : items.length === 0 ? (
        <p>{emptyText}</p>
      ) : (
        <div className="resume-list">
          {items.map((item) => {
            const isProcessing = processingId === item.application_id;
            const canReview = item.status === 'pending';

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
                      onClick={() => handleDecision(item.application_id, 'approve')}
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
