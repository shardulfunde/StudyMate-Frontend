import './LoadingSpinner.css';

export default function LoadingSpinner({ message = '', size = 'normal' }) {
  return (
    <div className={`loading-wrap loading-${size}`} role="status" aria-live="polite">
      <div className="pulse-loader" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {message && <div className="loading-msg">{message}</div>}
    </div>
  );
}
