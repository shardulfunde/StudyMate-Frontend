import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCapabilities } from '../context/CapabilityContext';
import { buildPermissions } from '../utils/permissions';
import AcademicBadge from '../components/badges/AcademicBadge';
import './Dashboard.css';

const cards = [
  {
    to: '/notes',
    icon: '\u{1F4D6}',
    title: 'Study Notes',
    description: 'Access comprehensive notes for all subjects, organized by topics and chapters.',
    button: 'Browse Notes'
  },
  {
    to: '/ai-features',
    icon: '\u2728',
    title: 'StudyMate AI Studio',
    description: 'Generate subject-wise and topic-wise tests from one dedicated AI workspace.',
    button: 'Open Studio'
  },
  {
    to: '/pyqs',
    icon: '\u{1F4DA}',
    title: 'Previous Papers',
    description: 'Prepare effectively with previous year question papers and solutions.',
    button: 'View Papers'
  },
  {
    to: '/assignments',
    icon: '\u{1F4DD}',
    title: 'Assignments',
    description: 'Practice with subject-wise assignments and improve your understanding.',
    button: 'Coming Soon'
  }
];

export default function Dashboard() {
  const { capabilities, loading, highestRole } = useCapabilities();
  const permissions = buildPermissions(capabilities);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <>
      {permissions.hasAdminAccess() && (
        <div className="dashboard-admin-row">
          <Link to="/admin" className="admin-button">
            Admin Panel
          </Link>
        </div>
      )}

      <section className="dashboard-intro">
        <div className="intro-badge">StudyMate</div>
        <div className="ai-powered-row">
          <span className="ai-powered-badge">AI powered</span>
          {highestRole && (
            <AcademicBadge
              size="md"
              roleType={highestRole}
              isOwner={true}
            />
          )}
        </div>
        <h1 className="dashboard-hero-title">
          <span className="dashboard-hero-text">Welcome to StudyMate</span>
        </h1>
        <p>Find notes, assignments, and previous year papers in one clean workspace.</p>
      </section>

      <section className="cards-wrap">
        <div className="resources-grid">
          {cards.map((card, index) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.36, delay: index * 0.08, ease: 'easeOut' }}
              className="resource-card organic-card"
            >
              <Link to={card.to} className="card-link-wrap">
                <div className="resource-icon">{card.icon}</div>
                <h2 className="resource-title">{card.title}</h2>
                <p className="resource-description">{card.description}</p>
                <span className="resource-button">{card.button}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
