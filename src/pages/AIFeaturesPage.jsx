import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import TestContainer from '../components/test-ui/TestContainer';
import './AIFeaturesPage.css';

const RESOURCE_TYPE_OPTIONS = [
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'Previous Papers' }
];

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];

export default function AIFeaturesPage() {
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [scopeTarget, setScopeTarget] = useState('subject');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [resourceType, setResourceType] = useState('notes');
  const [selectedResourceId, setSelectedResourceId] = useState('');

  const [mode, setMode] = useState('random');
  const [query, setQuery] = useState('');
  const [testType, setTestType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('English');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [testModalOpen, setTestModalOpen] = useState(false);

  useEffect(() => {
    api.get('/subjects')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSubjects(list);
        if (list.length > 0) {
          const first = list[0];
          setSelectedYearId(String(first.year_id ?? ''));
          setSelectedSubjectId(String(first.id));
        }
      })
      .catch(() => setLoadError('Failed to load subjects.'))
      .finally(() => setLoadingSubjects(false));
  }, []);

  const years = useMemo(() => {
    const map = new Map();

    subjects.forEach((subject) => {
      const yearKey = String(subject.year_id ?? '');
      if (!yearKey || map.has(yearKey)) return;

      map.set(yearKey, {
        id: yearKey,
        label: `Year ${subject.Year} - ${subject.Program}`
      });
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    if (!selectedYearId) return subjects;
    return subjects.filter((subject) => String(subject.year_id) === String(selectedYearId));
  }, [selectedYearId, subjects]);

  useEffect(() => {
    if (!selectedYearId && years.length > 0) {
      setSelectedYearId(String(years[0].id));
      return;
    }

    if (filteredSubjects.length === 0) {
      setSelectedSubjectId('');
      return;
    }

    const selectedStillValid = filteredSubjects.some(
      (subject) => String(subject.id) === String(selectedSubjectId)
    );

    if (!selectedStillValid) {
      setSelectedSubjectId(String(filteredSubjects[0].id));
    }
  }, [filteredSubjects, selectedSubjectId, selectedYearId, years]);

  useEffect(() => {
    if (!selectedSubjectId || scopeTarget !== 'resource') {
      setResources([]);
      setSelectedResourceId('');
      return;
    }

    setLoadingResources(true);
    api.get(`/resources/${selectedSubjectId}/${resourceType}`)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setResources(list);
        if (list.length > 0) setSelectedResourceId(String(list[0].id));
      })
      .finally(() => setLoadingResources(false));
  }, [selectedSubjectId, resourceType, scopeTarget]);

  const selectedSubject = useMemo(
    () => subjects.find((item) => String(item.id) === String(selectedSubjectId)),
    [subjects, selectedSubjectId]
  );

  const selectedResource = useMemo(
    () => resources.find((item) => String(item.id) === String(selectedResourceId)),
    [resources, selectedResourceId]
  );

  const scopeId = scopeTarget === 'subject' ? selectedSubjectId : selectedResourceId;
  const canLaunch = Boolean(scopeId) && (mode === 'random' || query.trim());

  const initialConfig = useMemo(() => ({
    testType,
    mode,
    numberOfQuestions,
    difficulty,
    language,
    query
  }), [difficulty, language, mode, numberOfQuestions, query, testType]);

  const title = useMemo(() => {
    if (scopeTarget === 'resource') {
      return `Test: ${selectedResource?.title || 'Resource'}`;
    }
    return `Test: ${selectedSubject?.subject || 'Subject'}`;
  }, [scopeTarget, selectedResource, selectedSubject]);

  return (
    <div className="ai-studio-page">
      <div className="ai-studio-glow ai-studio-glow-one" aria-hidden="true" />
      <div className="ai-studio-glow ai-studio-glow-two" aria-hidden="true" />

      <section className="ai-studio-hero">
        <p className="ai-studio-badge">FLAGSHIP AI FEATURE</p>
        <h1>StudyMate AI Studio</h1>
        <p className="ai-studio-subtitle">
          Pick your context, tune the setup, and let AI handle the heavy lifting.
          Fast, clean, and low-noise.
        </p>
        <div className="ai-studio-launch-tags">
          <span>Fast Test Generation</span>
          <span>One-Click Start</span>
          <span>Clean Practice Flow</span>
        </div>

        <div className="ai-studio-metrics">
          <article>
            <h3>Scope</h3>
            <p>{scopeTarget === 'subject' ? 'Subject-Wise' : 'Resource-Wise'}</p>
          </article>
          <article>
            <h3>Mode</h3>
            <p>{mode === 'random' ? 'Full Chapter' : 'Topic Focused'}</p>
          </article>
          <article>
            <h3>Format</h3>
            <p>{testType === 'mcq' ? 'MCQ' : 'Theory'}</p>
          </article>
        </div>
      </section>

      <section className="ai-studio-panel">
        <div className="ai-panel-header">
          <h2>AI Configuration</h2>
          <span>Simple 3-step flow for faster test setup</span>
        </div>

        <div className="ai-step-flow">
          <section className="ai-step-card">
            <header className="ai-step-head">
              <span className="ai-step-number">Step 1</span>
              <div>
                <h3>Select Academic Context</h3>
                <p>Choose where the AI should generate from.</p>
              </div>
            </header>

            <div className="ai-panel-grid">
              <label className="ai-field">
                <span>Scope Target</span>
                <select value={scopeTarget} onChange={(event) => setScopeTarget(event.target.value)}>
                  <option value="subject">Subject-Wise</option>
                  <option value="resource">Resource-Wise</option>
                </select>
              </label>

              <label className="ai-field">
                <span>Program Year</span>
                <select
                  value={selectedYearId}
                  onChange={(event) => setSelectedYearId(event.target.value)}
                  disabled={loadingSubjects}
                >
                  {years.length === 0 && <option value="">No years available</option>}
                  {years.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ai-field">
                <span>Subject</span>
                <select
                  value={selectedSubjectId}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                  disabled={loadingSubjects}
                >
                  {filteredSubjects.length === 0 && <option value="">No subjects available</option>}
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject} ({subject.Program} - Y{subject.Year})
                    </option>
                  ))}
                </select>
              </label>

              {scopeTarget === 'resource' && (
                <>
                  <label className="ai-field">
                    <span>Resource Type</span>
                    <select value={resourceType} onChange={(event) => setResourceType(event.target.value)}>
                      {RESOURCE_TYPE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="ai-field">
                    <span>Resource</span>
                    <select
                      value={selectedResourceId}
                      onChange={(event) => setSelectedResourceId(event.target.value)}
                      disabled={loadingResources}
                    >
                      {resources.length === 0 && <option value="">No resources available</option>}
                      {resources.map((resource) => (
                        <option key={resource.id} value={resource.id}>{resource.title}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
          </section>

          <section className="ai-step-card">
            <header className="ai-step-head">
              <span className="ai-step-number">Step 2</span>
              <div>
                <h3>Configure AI Behavior</h3>
                <p>Set how the test should be generated.</p>
              </div>
            </header>

            <div className="ai-panel-grid">
              <label className="ai-field">
                <span>Question Source</span>
                <select value={mode} onChange={(event) => setMode(event.target.value)}>
                  <option value="random">Generate full chapter test</option>
                  <option value="relevant">Generate specific topic test</option>
                </select>
              </label>

              <label className="ai-field">
                <span>Question Format</span>
                <select value={testType} onChange={(event) => setTestType(event.target.value)}>
                  <option value="mcq">MCQ (choose one option)</option>
                  <option value="theory">Theory (write full answers)</option>
                </select>
              </label>

              <label className="ai-field">
                <span>Difficulty</span>
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                  {DIFFICULTY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ai-field">
                <span>Language</span>
                <input
                  type="text"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  placeholder="English"
                />
              </label>

              <label className="ai-field">
                <span>Questions</span>
                <div className="ai-slider-wrap">
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={numberOfQuestions}
                    onChange={(event) => setNumberOfQuestions(Number(event.target.value))}
                  />
                  <strong>{numberOfQuestions}</strong>
                </div>
              </label>
            </div>

            {mode === 'relevant' && (
              <label className="ai-field ai-topic-field">
                <span>Topic to Focus On</span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Example: binary trees, thermodynamics, DBMS joins"
                />
              </label>
            )}
          </section>

          <section className="ai-step-card ai-generate-card">
            <header className="ai-step-head">
              <span className="ai-step-number">Step 3</span>
              <div>
                <h3>Generate</h3>
                <p>Review your setup and generate instantly.</p>
              </div>
            </header>

            <div className="ai-panel-footer">
              <button
                type="button"
                className="ai-launch-btn"
                disabled={!canLaunch}
                onClick={() => canLaunch && setTestModalOpen(true)}
              >
                Generate Test
              </button>
            </div>
          </section>
        </div>

        {loadError && <p className="ai-panel-error">{loadError}</p>}
      </section>

      <TestContainer
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        scopeId={scopeId}
        scopeTarget={scopeTarget}
        title={title}
        initialConfig={initialConfig}
        autoStartOnOpen
      />
    </div>
  );
}
