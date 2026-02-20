import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About StudyMate</h3>
          <p>StudyMate helps students access study materials easily and efficiently.</p>
          <p className="footer-about-link">
            <a href="https://www.linkedin.com/in/shardulfunde/" target="_blank" rel="noopener noreferrer">
              <span className="footer-linkedin-badge" aria-hidden="true">in</span>
              Connect on LinkedIn
            </a>
          </p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <p>
            <a href="https://github.com/shardulfunde/StudyMate-AI" target="_blank" rel="noopener noreferrer">StudyMate GitHub Repo</a>
          </p>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Have suggestions or want to contribute? Reach out on LinkedIn or GitHub.</p>
        </div>
      </div>
      <div className="footer-credit">
        StudyMate
      </div>
      <div className="footer-repo-wrap">
        <a href="https://github.com/shardulfunde/StudyMate-AI" target="_blank" rel="noopener noreferrer" className="footer-repo">
          View the CogniMate Repo on GitHub
        </a>
      </div>
    </footer>
  );
}
