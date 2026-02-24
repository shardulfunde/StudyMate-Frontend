import './LoadingSpinner.css';

export default function LoadingSpinner({ message = '', size = 'normal' }) {
  return (
    <div className={`loading-wrap loading-${size}`} role="status" aria-live="polite">
      <div className="loading-skeleton-card" aria-hidden="true">
        <div className="loading-skeleton-line loading-skeleton-title" />
        <div className="loading-skeleton-line" />
        <div className="loading-skeleton-line loading-skeleton-short" />
      </div>
      {message && <div className="loading-msg">{message}</div>}
    </div>
  );
}
