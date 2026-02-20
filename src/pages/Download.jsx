import './Download.css';

const DOWNLOAD_URL = 'https://download1591.mediafire.com/pxogs5y4vxkgMujgo_TfQ9GoWJVqg9ld0zzmNAvZPEf_cdwEBJr31fY1QsJhsJEUmnLFTo0zGzqe7HIlNN36ShaLdvBwzGCm-ph-JP_COw1580gbf_cvIoL3XhSIIN_Z-u3Re3WjTiXWhNRrgArKj5ihV2iO9MDFDJnIfAfWJL23ajA/61qxaer5bc4u8o4/StudyMate.apk';

export default function Download() {
  return (
    <>
      <section className="download-section">
        <div className="app-icon">📱</div>
        <h1 className="download-title">Download StudyMate App</h1>
        <p className="download-description">
          Access all your study materials on your mobile device and enjoy a better learning experience with our StudyMate app.
        </p>
        <a href={DOWNLOAD_URL} className="download-button" target="_blank" rel="noopener noreferrer">
          📥 Download Now
        </a>
      </section>
      <section className="features">
        <h2 className="features-title">App Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Mobile-Friendly</h3>
            <p className="feature-description">Optimized for mobile devices with a smooth, responsive interface</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤳</div>
            <h3 className="feature-title">Mobile Optimized</h3>
            <p className="feature-description">Designed specifically for a smooth mobile experience</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3 className="feature-title">Complete Resources</h3>
            <p className="feature-description">Access notes, assignments, and previous year papers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Fast & Lightweight</h3>
            <p className="feature-description">Quick to download and easy on your device's resources</p>
          </div>
        </div>
      </section>
    </>
  );
}
