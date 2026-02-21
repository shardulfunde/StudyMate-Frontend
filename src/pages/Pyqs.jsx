import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [shareFeedbackId, setShareFeedbackId] = useState(null);

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

  useEffect(() => {
    const stepParam = searchParams.get('step');
    const programIdParam = searchParams.get('programId');
    const yearIdParam = searchParams.get('yearId');

    const targetProgram = programIdParam
      ? programs.find((program) => String(program.id) === String(programIdParam))
      : null;
    if (targetProgram && String(selectedProgram?.id) !== String(targetProgram.id)) {
      setSelectedProgram(targetProgram);
    }
    if (!programIdParam && selectedProgram) {
      setSelectedProgram(null);
    }

    const targetYear = yearIdParam
      ? years.find((year) => String(year.id) === String(yearIdParam))
      : null;
    if (targetYear && String(selectedYear?.id) !== String(targetYear.id)) {
      setSelectedYear(targetYear);
    }
    if (!yearIdParam && selectedYear) {
      setSelectedYear(null);
    }

    const targetStep =
      stepParam === 'subject' ? STEP.SUBJECT
        : stepParam === 'year' ? STEP.YEAR
          : STEP.PROGRAM;
    if (step !== targetStep) {
      setStep(targetStep);
    }
  }, [programs, years, searchParams, selectedProgram, selectedYear, step]);

  const updateNavState = useCallback((next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const copySubjectShareLink = useCallback(async (subjectId, type) => {
    const url = new URL(`${window.location.origin}/subject/${subjectId}`);
    url.searchParams.set('type', type);
    if (selectedProgram?.id) url.searchParams.set('programId', selectedProgram.id);
    if (selectedYear?.id) url.searchParams.set('yearId', selectedYear.id);

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareFeedbackId(subjectId);
      setTimeout(() => setShareFeedbackId(null), 1200);
    } catch {
      window.prompt('Copy this subject link:', url.toString());
    }
  }, [selectedProgram?.id, selectedYear?.id]);

  const copyLink = useCallback(async (url, key, fallbackLabel) => {
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareFeedbackId(key);
      setTimeout(() => setShareFeedbackId(null), 1200);
    } catch {
      window.prompt(`Copy this ${fallbackLabel} link:`, url.toString());
    }
  }, []);

  const copyProgramShareLink = useCallback((programId) => {
    const url = new URL(`${window.location.origin}/pyqs`);
    url.searchParams.set('step', 'year');
    url.searchParams.set('programId', programId);
    copyLink(url, `program-${programId}`, 'program');
  }, [copyLink]);

  const copyYearShareLink = useCallback((programId, yearId) => {
    const url = new URL(`${window.location.origin}/pyqs`);
    url.searchParams.set('step', 'subject');
    url.searchParams.set('programId', programId);
    url.searchParams.set('yearId', yearId);
    copyLink(url, `year-${yearId}`, 'year');
  }, [copyLink]);

  const copyCurrentViewShareLink = useCallback(() => {
    const url = new URL(`${window.location.origin}/pyqs`);
    if (step === STEP.YEAR && selectedProgram?.id) {
      url.searchParams.set('step', 'year');
      url.searchParams.set('programId', selectedProgram.id);
      copyLink(url, 'view-current', 'current view');
      return;
    }
    if (step === STEP.SUBJECT && selectedProgram?.id && selectedYear?.id) {
      url.searchParams.set('step', 'subject');
      url.searchParams.set('programId', selectedProgram.id);
      url.searchParams.set('yearId', selectedYear.id);
      copyLink(url, 'view-current', 'current view');
      return;
    }
    copyLink(url, 'view-current', 'pyqs');
  }, [copyLink, selectedProgram?.id, selectedYear?.id, step]);

  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
    setSelectedYear(null);
    setStep(STEP.YEAR);
    setSearch('');
    updateNavState({
      step: 'year',
      programId: program.id,
      yearId: null
    });
  };

  const handleSelectYear = (year) => {
    setSelectedYear(year);
    setStep(STEP.SUBJECT);
    setSearch('');
    updateNavState({
      step: 'subject',
      yearId: year.id
    });
  };

  const handleBackToPrograms = () => {
    setStep(STEP.PROGRAM);
    setSelectedProgram(null);
    setSelectedYear(null);
    updateNavState({
      step: null,
      programId: null,
      yearId: null
    });
  };

  const handleBackToYears = () => {
    setStep(STEP.YEAR);
    setSelectedYear(null);
    updateNavState({
      step: 'year',
      yearId: null
    });
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
              onClick={handleBackToYears}
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
          <div className="step-title-row">
            <h2 className="step-title">Select Program</h2>
            <button
              type="button"
              className="step-share-btn"
              onClick={copyCurrentViewShareLink}
              title={shareFeedbackId === 'view-current' ? 'Copied' : 'Share this view'}
              aria-label="Share this view"
            >
              {shareFeedbackId === 'view-current' ? 'Copied' : '\u{1F517}'}
            </button>
          </div>
          {loading && <Skeleton cardCount={6} columns={3} />}
          {!loading && programs.length === 0 && (
            <p className="page-msg">No programs found.</p>
          )}
          <div className="cards-grid">
            {programs.map((p, i) => (
              <div key={p.id} className="subject-card-wrap">
                <button
                  type="button"
                  className="subject-card selectable"
                  onClick={() => handleSelectProgram(p)}
                >
                  <div className="subject-icon">{PROGRAM_ICONS[i % PROGRAM_ICONS.length]}</div>
                  <h2 className="subject-title">{p.name}</h2>
                  <p className="subject-description">View years and subjects</p>
                </button>
                <button
                  type="button"
                  className="subject-share-btn icon-only"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    copyProgramShareLink(p.id);
                  }}
                  title={shareFeedbackId === `program-${p.id}` ? 'Copied' : 'Share program'}
                  aria-label="Share program"
                >
                  {shareFeedbackId === `program-${p.id}` ? '✓' : '\u{1F517}'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === STEP.YEAR && (
        <div className="notes-step">
          <div className="step-title-row">
            <h2 className="step-title">Select Year - {selectedProgram?.name}</h2>
            <button
              type="button"
              className="step-share-btn"
              onClick={copyCurrentViewShareLink}
              title={shareFeedbackId === 'view-current' ? 'Copied' : 'Share this view'}
              aria-label="Share this view"
            >
              {shareFeedbackId === 'view-current' ? 'Copied' : '\u{1F517}'}
            </button>
          </div>
          {loading && <Skeleton cardCount={4} columns={2} />}
          {!loading && years.length === 0 && (
            <p className="page-msg">No years found for this program.</p>
          )}
          <div className="cards-grid">
            {years.map((y, i) => (
              <div key={y.id} className="subject-card-wrap">
                <button
                  type="button"
                  className="subject-card selectable"
                  onClick={() => handleSelectYear(y)}
                >
                  <div className="subject-icon">{YEAR_ICONS[i % YEAR_ICONS.length]}</div>
                  <h2 className="subject-title">Year {y.year_number}</h2>
                  <p className="subject-description">{y.program_name}</p>
                </button>
                <button
                  type="button"
                  className="subject-share-btn icon-only"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    copyYearShareLink(selectedProgram?.id, y.id);
                  }}
                  title={shareFeedbackId === `year-${y.id}` ? 'Copied' : 'Share year'}
                  aria-label="Share year"
                >
                  {shareFeedbackId === `year-${y.id}` ? '✓' : '\u{1F517}'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === STEP.SUBJECT && (
        <div className="notes-step">
          <div className="step-title-row">
            <h2 className="step-title">
              Select Subject - Year {selectedYear?.year_number} - {selectedProgram?.name}
            </h2>
            <button
              type="button"
              className="step-share-btn"
              onClick={copyCurrentViewShareLink}
              title={shareFeedbackId === 'view-current' ? 'Copied' : 'Share this view'}
              aria-label="Share this view"
            >
              {shareFeedbackId === 'view-current' ? 'Copied' : '\u{1F517}'}
            </button>
          </div>
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
              <div key={s.id} className="subject-card-wrap">
                <Link
                  to={`/subject/${s.id}?type=pyq&programId=${encodeURIComponent(selectedProgram?.id || '')}&yearId=${encodeURIComponent(selectedYear?.id || '')}`}
                  className="subject-card"
                >
                  <div className="subject-icon">{SUBJECT_ICONS[i % SUBJECT_ICONS.length]}</div>
                  <h2 className="subject-title">{s.subject}</h2>
                  <p className="subject-description">Previous year question papers</p>
                </Link>
                <button
                  type="button"
                  className="subject-share-btn icon-only"
                  onClick={() => copySubjectShareLink(s.id, 'pyq')}
                >
                  {shareFeedbackId === s.id ? '✓' : '\u{1F517}'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
