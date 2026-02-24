import { useNavigate } from 'react-router-dom';
import './AcademicBadge.css';

export default function AcademicBadge({
  isOwner = false,
  roleType = null,
  size = 'sm'
}) {
  const navigate = useNavigate();

  const roleMap = {
    subject_admin: 'Subject Level',
    year_admin: 'Year Level',
    program_admin: 'Program Level',
    college_superadmin: 'College Level'
  };

  const levelLabel = roleType ? roleMap[roleType] : null;

  const handleClick = () => {
    navigate('/academic-team');
  };

  return (
    <span
      className={`academic-badge academic-badge-${size}`}
      onClick={handleClick}
      role="button"
    >
      <svg
        className="academic-badge-icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
      </svg>

      <span className="academic-badge-label">
        Academic Team
      </span>

      {isOwner && levelLabel && (
        <span className="academic-badge-level">
          • {levelLabel}
        </span>
      )}
    </span>
  );
}
