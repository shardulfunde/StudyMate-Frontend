import './DMLabPage.css';

export default function DMLabPage() {
  return (
    <div className="dm-page">
      <div className="dm-card">
        <h1>DM Lab ESE</h1>
        <p className="dm-subtitle">All codes and assignments are in this file.</p>
        <a
          href="https://www.mediafire.com/file/35ks1f8br467xdl/DM_Lab_ESE.zip/file"
          target="_blank"
          rel="noopener noreferrer"
          className="dm-download-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download ZIP
        </a>
      </div>
    </div>
  );
}
