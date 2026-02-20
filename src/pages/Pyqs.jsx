import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Notes.css';
import Skeleton from '../components/Skeleton';

const STEP = { PROGRAM: 1, YEAR: 2, SUBJECT: 3 };
const SUBJECT_ICONS = ['📚', '⚡', '🔌', '🤖', '📐', '⚙️', '🧪', '📡', '🧠', '🖥️', '📊', '📝', '📎', '💡', '🔍', '🧾'];
const PROGRAM_ICONS = ['🎓', '🏛️', '📘', '🧭', '🚀', '🌟', '💼', '🧩', '🛰️', '🛡️', '⚙️', '🧪', '📈', '🧠', '🔭', '🌐'];
const YEAR_ICONS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '🗓️', '📆', '⏳', '✅', '🎯', '📌'];

export default function Pyqs() {
  const [step, setStep] = useState(STEP.PROGRAM);
  const [programs, setPrograms] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadYearsForProgram = useCallback(async (programId) => {
    if (!programId) return;
    setLoading(true);
    try {
      const data = await api.get(`/years?program_id=${encodeURIComponent(programId)}`);
      setYears(Array.isArray(data) ? data : []);
    } catch {
      setYears([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get('/programs')
      .then((data) => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProgram?.id) return;
    loadYearsForProgram(selectedProgram.id);
  }, [selectedProgram?.id, loadYearsForProgram]);

  useEffect(() => {
    api.get('/subjects')
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => setSubjects([]));
  }, []);

  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
    setSelectedYear(null);
    setStep(STEP.YEAR);
    setSearch('');
  };

  const handleSelectYear = (year) => {
    setSelectedYear(year);
    setStep(STEP.SUBJECT);
    setSearch('');
  };

  const handleBackToPrograms = () => {
    setStep(STEP.PROGRAM);
    setSelectedProgram(null);
    setSelectedYear(null);
  };

  const subjectsForYear = selectedYear?.id
    ? subjects.filter((s) => s.year_id === selectedYear.id)
    : [];

  const filteredSubjects = subjectsForYear.filter((s) =>
    s.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="page-header">
        <h1>Previous Year Questions</h1>
        <p>Access PYQs by following Program - Year - Subject for a cleaner browsing flow.</p>
      </header>

      <div className="notes-breadcrumb">
        <button
          type="button"
          className="breadcrumb-item"
          onClick={handleBackToPrograms}
        >
          Programs
        </button>
        {selectedProgram && (
          <>
            <span className="breadcrumb-sep">&gt;</span>
            <button
              type="button"
              className="breadcrumb-item"
              onClick={() => setStep(STEP.YEAR)}
              disabled={step === STEP.PROGRAM}
            >
              {selectedProgram.name}
            </button>
          </>
        )}
        {selectedYear && (
          <>
            <span className="breadcrumb-sep">&gt;</span>
            <span className="breadcrumb-item current">
              Year {selectedYear.year_number}
            </span>
          </>
        )}
      </div>

      {step === STEP.PROGRAM && (
        <div className="notes-step">
          <h2 className="step-title">Select Program</h2>
          {loading && <Skeleton cardCount={6} columns={3} />}
          {!loading && programs.length === 0 && (
            <p className="page-msg">No programs found.</p>
          )}
          <div className="cards-grid">
            {programs.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="subject-card selectable"
                onClick={() => handleSelectProgram(p)}
              >
                <div className="subject-icon">{PROGRAM_ICONS[i % PROGRAM_ICONS.length]}</div>
                <h2 className="subject-title">{p.name}</h2>
                <p className="subject-description">View years and subjects</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === STEP.YEAR && (
        <div className="notes-step">
          <h2 className="step-title">Select Year - {selectedProgram?.name}</h2>
          {loading && <Skeleton cardCount={4} columns={2} />}
          {!loading && years.length === 0 && (
            <p className="page-msg">No years found for this program.</p>
          )}
          <div className="cards-grid">
            {years.map((y, i) => (
              <button
                key={y.id}
                type="button"
                className="subject-card selectable"
                onClick={() => handleSelectYear(y)}
              >
                <div className="subject-icon">{YEAR_ICONS[i % YEAR_ICONS.length]}</div>
                <h2 className="subject-title">Year {y.year_number}</h2>
                <p className="subject-description">{y.program_name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === STEP.SUBJECT && (
        <div className="notes-step">
          <h2 className="step-title">
            Select Subject - Year {selectedYear?.year_number} - {selectedProgram?.name}
          </h2>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredSubjects.length === 0 && (
            <p className="page-msg">
              {subjectsForYear.length === 0 ? 'No subjects in this year.' : 'No subjects match your search.'}
            </p>
          )}
          <div className="cards-grid">
            {filteredSubjects.map((s, i) => (
              <Link key={s.id} to={`/subject/${s.id}?type=pyq`} className="subject-card">
                <div className="subject-icon">{SUBJECT_ICONS[i % SUBJECT_ICONS.length]}</div>
                <h2 className="subject-title">{s.subject}</h2>
                <p className="subject-description">Previous year question papers</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
