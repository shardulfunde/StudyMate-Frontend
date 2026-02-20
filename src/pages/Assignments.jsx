import './Assignments.css';

export default function Assignments() {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-icon">📝</div>
      <h1 className="coming-soon-title">Assignments Coming Soon!</h1>
      <p className="coming-soon-text">
        We're working hard to create high-quality assignments for all subjects. Stay tuned for updates and practice materials that will help you master your coursework.
      </p>
      <a href="#" className="notification-button" onClick={(e) => e.preventDefault()}>
        Get Notified When Available
      </a>
    </div>
  );
}
