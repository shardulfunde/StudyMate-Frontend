import { Link } from 'react-router-dom';

export default function AcademicTeamPage() {
  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: '0 1.2rem' }}>
      <h1>StudyMate Academic Team</h1>

      <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>
        The Academic Team is a selective student leadership group responsible
        for maintaining academic quality and structure across StudyMate.
      </p>

      <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>
        Members receive official platform recognition and a visible Academic Team badge.
        This role can be listed on LinkedIn as an official leadership position.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/apply-moderator">
          <button style={{
            padding: '0.8rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            background: '#2563eb',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Apply to Join
          </button>
        </Link>
      </div>
    </div>
  );
}
