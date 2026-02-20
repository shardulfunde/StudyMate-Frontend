import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeTest, generateTest } from '../services/api';
import { useToast } from '../context/ToastContext';
import AnalysisSection from './AnalysisSection';
import './TestModal.css';

const DEFAULT_TEST_FORM = {
  mode: 'random',
  numberOfQuestions: 10,
  difficulty: 'medium',
  language: 'English',
  query: ''
};

function getCorrectAnswerIndex(question) {
  const answer = Number(question?.correct_answer);
  if (!Number.isFinite(answer)) return -1;
  if (answer >= 0 && answer < (question?.options || []).length) return answer;
  if (answer > 0 && answer <= (question?.options || []).length) return answer - 1;
  return -1;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getInitialTimer(questionCount) {
  return Math.max(5, Number(questionCount) || 10) * 60;
}

export default function TestModal({
  isOpen,
  onClose,
  scopeId,
  scopeTarget = 'resource',
  title = 'StudyMate Test'
}) {
  const { showToast } = useToast();
  const [testForm, setTestForm] = useState(DEFAULT_TEST_FORM);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [submitWarning, setSubmitWarning] = useState('');
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const questionRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    setTestForm(DEFAULT_TEST_FORM);
    setTestLoading(false);
    setTestError('');
    setTestResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTestSubmitted(false);
    setScore({ correct: 0, total: 0 });
    setSubmitWarning('');
    setSubmitConfirmOpen(false);
    setAnalysisLoading(false);
    setAnalysisError('');
    setAnalysisData(null);
    setTimerSeconds(0);
    questionRefs.current = [];
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !testResult || testSubmitted) return undefined;

    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, testResult, testSubmitted]);

  useEffect(() => {
    if (!testResult?.questions?.length) return;
    const target = questionRefs.current[currentQuestionIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentQuestionIndex, testResult]);

  const unansweredIndexes = useMemo(() => {
    if (!testResult?.questions?.length) return [];
    return testResult.questions.reduce((acc, _, index) => {
      if (selectedAnswers[index] === undefined) acc.push(index);
      return acc;
    }, []);
  }, [selectedAnswers, testResult]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    if (testLoading || analysisLoading) return;
    onClose();
  };

  const handleTestFormChange = (field, value) => {
    setTestForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartTest = async (event) => {
    event.preventDefault();

    if (!scopeId) {
      setTestError('Missing scope id. Unable to generate test.');
      return;
    }

    if (testForm.mode === 'relevant' && !testForm.query.trim()) {
      setTestError('Please enter a query for relevant mode.');
      return;
    }

    const scopeType = `${testForm.mode}_${scopeTarget}`;
    const payload = {
      scope_type: scopeType,
      scope_id: String(scopeId),
      number_of_questions: Number(testForm.numberOfQuestions) || 10,
      difficulty: testForm.difficulty,
      language: testForm.language
    };

    if (scopeType.startsWith('relevant')) {
      payload.query = testForm.query.trim();
    }

    setTestError('');
    setSubmitWarning('');
    setAnalysisError('');
    setAnalysisData(null);
    setTestLoading(true);
    setTestSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setScore({ correct: 0, total: 0 });

    try {
      const generatedTest = await generateTest(payload);
      setTestResult(generatedTest);
      setTimerSeconds(getInitialTimer(generatedTest?.questions?.length));
      showToast('Test generated successfully', 'success');
    } catch (err) {
      const message = err?.detail?.detail || err?.message || 'Failed to generate test';
      setTestError(message);
      showToast(message, 'error');
    } finally {
      setTestLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    setSubmitWarning('');
  };

  const handleJumpToQuestion = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
  };

  const handleRequestSubmit = () => {
    if (!testResult?.questions?.length) return;

    if (unansweredIndexes.length > 0) {
      const firstUnanswered = unansweredIndexes[0];
      setSubmitWarning(
        `Please answer all questions before submitting. ${unansweredIndexes.length} question(s) remaining.`
      );
      setCurrentQuestionIndex(firstUnanswered);
      return;
    }

    setSubmitWarning('');
    setSubmitConfirmOpen(true);
  };

  const fetchAnalysis = async (submittedTest) => {
    setAnalysisLoading(true);
    setAnalysisError('');
    setAnalysisData(null);

    try {
      const studentAnswers = (submittedTest?.questions || []).map((_, questionIndex) => ({
        question_index: questionIndex,
        selected_option: Number(selectedAnswers[questionIndex] ?? 0)
      }));
      const analysis = await analyzeTest({ test: submittedTest, student_answer: studentAnswers });
      setAnalysisData(analysis);
    } catch (err) {
      const message = err?.detail?.detail || err?.message || 'Failed to analyze test';
      setAnalysisError(message);
      showToast(message, 'error');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!testResult?.questions?.length) return;

    const total = testResult.questions.length;
    let correct = 0;

    testResult.questions.forEach((question, questionIndex) => {
      const selected = selectedAnswers[questionIndex];
      const correctIndex = getCorrectAnswerIndex(question);
      if (selected === correctIndex) correct += 1;
    });

    setScore({ correct, total });
    setTestSubmitted(true);
    setSubmitConfirmOpen(false);
    await fetchAnalysis(testResult);
  };

  const scorePercent = score.total ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="smtest-modal-overlay" onClick={handleModalClose}>
      <div className="smtest-modal-shell" onClick={(event) => event.stopPropagation()}>
        <header className="smtest-modal-header">
          <div>
            <h2>{title}</h2>
            {testResult && <p>{testResult.topic || 'Generated Test'}</p>}
          </div>
          <div className="smtest-modal-header-right">
            {testResult && (
              <div className={`smtest-timer ${timerSeconds <= 60 ? 'is-critical' : ''}`}>
                <span>Timer</span>
                <strong>{formatTime(timerSeconds)}</strong>
              </div>
            )}
            <button
              type="button"
              className="smtest-modal-close-btn"
              disabled={testLoading || analysisLoading}
              onClick={handleModalClose}
            >
              Close
            </button>
          </div>
        </header>

        {!testResult && (
          <form className="smtest-start-form" onSubmit={handleStartTest}>
            <label>
              Questions
              <input
                type="number"
                min="1"
                max="50"
                value={testForm.numberOfQuestions}
                onChange={(event) => handleTestFormChange('numberOfQuestions', event.target.value)}
              />
            </label>
            <label>
              Difficulty
              <select
                value={testForm.difficulty}
                onChange={(event) => handleTestFormChange('difficulty', event.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label>
              Language
              <input
                type="text"
                value={testForm.language}
                onChange={(event) => handleTestFormChange('language', event.target.value)}
              />
            </label>
            <label>
              Mode
              <select
                value={testForm.mode}
                onChange={(event) => handleTestFormChange('mode', event.target.value)}
              >
                <option value="random">Random</option>
                <option value="relevant">Relevant</option>
              </select>
            </label>
            {testForm.mode === 'relevant' && (
              <label className="smtest-form-wide">
                Query
                <input
                  type="text"
                  value={testForm.query}
                  onChange={(event) => handleTestFormChange('query', event.target.value)}
                  placeholder="Enter topic or concept"
                />
              </label>
            )}
            {testError && <p className="smtest-form-error">{testError}</p>}
            <div className="smtest-start-actions">
              <button type="button" onClick={handleModalClose} disabled={testLoading}>
                Cancel
              </button>
              <button type="submit" disabled={testLoading}>
                {testLoading ? 'Generating...' : 'Start Test'}
              </button>
            </div>
          </form>
        )}

        {testResult && (
          <div className="smtest-session-layout">
            <aside className="smtest-question-nav">
              <div className="smtest-question-nav-head">
                <h3>Questions</h3>
                <p>{(testResult.questions || []).length} total</p>
              </div>
              <div className="smtest-question-grid">
                {(testResult.questions || []).map((_, index) => {
                  const isAnswered = selectedAnswers[index] !== undefined;
                  const isCurrent = currentQuestionIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={[
                        'smtest-question-index-btn',
                        isAnswered ? 'is-answered' : 'is-unanswered',
                        isCurrent ? 'is-current' : ''
                      ].join(' ')}
                      onClick={() => handleJumpToQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="smtest-legend">
                <span className="answered">Answered</span>
                <span className="unanswered">Not Answered</span>
                <span className="current">Current</span>
              </div>
            </aside>

            <main className="smtest-questions-panel">
              {testSubmitted && (
                <div className="smtest-score-banner">
                  <strong>
                    Score: {score.correct}/{score.total}
                  </strong>
                  <span>{scorePercent}%</span>
                </div>
              )}

              {(testResult.questions || []).map((question, questionIndex) => {
                const correctIndex = getCorrectAnswerIndex(question);
                const selectedOption = selectedAnswers[questionIndex];
                return (
                  <article
                    key={`${question.question_text}-${questionIndex}`}
                    ref={(node) => {
                      questionRefs.current[questionIndex] = node;
                    }}
                    className={[
                      'smtest-question-card',
                      questionIndex === currentQuestionIndex ? 'is-current' : ''
                    ].join(' ')}
                  >
                    <p className="smtest-question-text">
                      Q{questionIndex + 1}. {question.question_text}
                    </p>

                    <div className="smtest-options-list" role="radiogroup" aria-label={`Question ${questionIndex + 1}`}>
                      {(question.options || []).map((option, optionIndex) => {
                        const isSelected = selectedOption === optionIndex;
                        const isCorrect = optionIndex === correctIndex;
                        const isWrongSelection = testSubmitted && isSelected && !isCorrect;
                        return (
                          <label
                            key={`${option}-${optionIndex}`}
                            className={[
                              'smtest-option-row',
                              isSelected ? 'is-selected' : '',
                              testSubmitted && isCorrect ? 'is-correct' : '',
                              isWrongSelection ? 'is-wrong' : ''
                            ].join(' ')}
                          >
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              checked={isSelected}
                              disabled={testSubmitted}
                              onChange={() => handleSelectAnswer(questionIndex, optionIndex)}
                            />
                            <span>{option}</span>
                            {testSubmitted && isCorrect && <strong className="smtest-option-chip">Correct</strong>}
                            {isWrongSelection && <strong className="smtest-option-chip wrong">Your Choice</strong>}
                          </label>
                        );
                      })}
                    </div>

                    {testSubmitted && (
                      <div className="smtest-explanation-box">
                        <h4>Explanation</h4>
                        <p>{question.explanation || 'No explanation available.'}</p>
                      </div>
                    )}
                  </article>
                );
              })}

              {analysisLoading && <p className="smtest-analysis-loading-text">Analyzing your test...</p>}
              {analysisError && <p className="smtest-analysis-error-text">{analysisError}</p>}
              {testSubmitted && !analysisLoading && <AnalysisSection analysis={analysisData} />}
            </main>
          </div>
        )}

        {submitWarning && <p className="smtest-submit-warning">{submitWarning}</p>}

        {testResult && !testSubmitted && (
          <footer className="smtest-submit-footer">
            <button type="button" className="smtest-submit-btn" onClick={handleRequestSubmit}>
              Submit Test
            </button>
          </footer>
        )}
      </div>

      {submitConfirmOpen && (
        <div className="smtest-confirm-overlay" onClick={() => setSubmitConfirmOpen(false)}>
          <div className="smtest-confirm-card" onClick={(event) => event.stopPropagation()}>
            <h3>Submit Test?</h3>
            <p>You will not be able to change answers after submission.</p>
            <div className="smtest-confirm-actions">
              <button type="button" onClick={() => setSubmitConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmSubmit}>
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
