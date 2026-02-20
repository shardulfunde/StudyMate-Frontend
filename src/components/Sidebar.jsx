import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Sidebar.css';

export default function Sidebar() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/subjects')
      .then(setSubjects)
      .catch((e) => setError(e.detail?.detail || e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Subjects</h2>
      {loading && <p className="sidebar-msg">Loading...</p>}
      {error && <p className="sidebar-error">{error}</p>}
      {!loading && !error && subjects.length === 0 && (
        <p className="sidebar-msg">No subjects yet.</p>
      )}
      <ul className="sidebar-list">
        {subjects.map((s) => (
          <li key={s.id}>
            <Link to={`/subject/${s.id}`} className="sidebar-link">
              <span className="sidebar-subject-name">{s.subject}</span>
              <span className="sidebar-meta">
                {s.Program} · Year {s.Year}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
