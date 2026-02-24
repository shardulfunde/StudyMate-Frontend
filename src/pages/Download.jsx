import './Download.css';

const ICONS = {
  app: '\u{1F4F1}',
  download: '\u{1F4E5}',
  mobile: '\u{1F4F1}',
  optimized: '\u{1F973}',
  resources: '\u{1F4DA}',
  fast: '\u{1F680}'
};

export default function Download() {
  return (
    <>
      <section className="download-section">
        <div className="app-icon" aria-hidden="true">{ICONS.app}</div>
        <h1 className="download-title">Download StudyMate App</h1>
        <p className="download-description">
          Access all your study materials on your mobile device and enjoy a better
          learning experience with the StudyMate app.
        </p>
        <button type="button" className="download-button coming-soon" disabled>
          {ICONS.download} Coming Soon
        </button>
      </section>

      <section className="features">
        <h2 className="features-title">App Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">{ICONS.mobile}</div>
            <h3 className="feature-title">Mobile-Friendly</h3>
            <p className="feature-description">
              Optimized for mobile devices with a smooth, responsive interface
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">{ICONS.optimized}</div>
            <h3 className="feature-title">Mobile Optimized</h3>
            <p className="feature-description">
              Designed specifically for a smooth mobile experience
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">{ICONS.resources}</div>
            <h3 className="feature-title">Complete Resources</h3>
            <p className="feature-description">
              Access notes, assignments, and previous year papers
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">{ICONS.fast}</div>
            <h3 className="feature-title">Fast and Lightweight</h3>
            <p className="feature-description">
              Quick to download and easy on your device resources
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
