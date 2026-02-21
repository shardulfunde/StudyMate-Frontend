import React, { useEffect, useRef } from 'react';
import { MAX_QUESTIONS, MIN_QUESTIONS, TestProvider, useTestContext } from './TestContext';
import ScoreHeader from './ScoreHeader';
import QuestionCard from './QuestionCard';
import TheoryQuestionCard from './TheoryQuestionCard';
import AnalysisSection from './AnalysisSection';
import SubmitConfirmDialog from './SubmitConfirmDialog';
import AILabel from './AILabel';
import { IntroLoadingSplash } from './SkeletonLoaders';

function StartForm() {
  const { testConfig, setTestConfig, startTest, isGenerating, ui } = useTestContext();

  const setField = (field, value) => {
    setTestConfig((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await startTest();
  };

  if (isGenerating) {
    return <IntroLoadingSplash />;
  }

  return (
    <form
      className="mx-auto w-full max-w-2xl animate-softPop space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-smcard md:p-6"
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800">Create Your Test</h3>
        <AILabel label="AI Powered" active={false} />
      </div>
      <p className="text-sm text-slate-600">
        Pick your format and preferences. After submission, your score and evaluation will appear automatically.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-600">
          <span>Question Format</span>
          <select
            value={testConfig.testType}
            onChange={(event) => setField('testType', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="mcq">MCQ (choose one option)</option>
            <option value="theory">Theory (write full answers)</option>
          </select>
        </label>

        <label className="space-y-1 text-sm text-slate-600">
          <span>Questions</span>
          <input
            type="number"
            min={MIN_QUESTIONS}
            max={MAX_QUESTIONS}
            value={testConfig.numberOfQuestions}
            onChange={(event) => setField('numberOfQuestions', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <span className="text-xs text-slate-500">
            Enter any value. We automatically keep it between {MIN_QUESTIONS} and {MAX_QUESTIONS}.
          </span>
        </label>

        <label className="space-y-1 text-sm text-slate-600">
          <span>Difficulty</span>
          <select
            value={testConfig.difficulty}
            onChange={(event) => setField('difficulty', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="easy">Easy (quick revision)</option>
            <option value="medium">Medium (balanced)</option>
            <option value="hard">Hard (challenge)</option>
          </select>
        </label>

        <label className="space-y-1 text-sm text-slate-600">
          <span>Language</span>
          <input
            type="text"
            value={testConfig.language}
            onChange={(event) => setField('language', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="space-y-1 text-sm text-slate-600">
          <span>Question Source</span>
          <select
            value={testConfig.mode}
            onChange={(event) => setField('mode', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="random">Generate full chapter test</option>
            <option value="relevant">Generate specific topic test</option>
          </select>
        </label>
      </div>

      {testConfig.mode === 'relevant' && (
        <label className="space-y-1 text-sm text-slate-600">
          <span>Topic to Focus On</span>
          <input
            type="text"
            value={testConfig.query}
            onChange={(event) => setField('query', event.target.value)}
            placeholder="Example: binary trees, thermodynamics, DBMS joins"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      )}

      {ui.startError && (
        <p className="animate-fadeInUp rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {ui.startError}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isGenerating}
          className="min-w-32 rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:hover:translate-y-0"
        >
          {isGenerating ? 'Generating...' : 'Generate Test'}
        </button>
      </div>
    </form>
  );
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getGrade(percent) {
  if (percent >= 90) return 'A+';
  if (percent >= 80) return 'A';
  if (percent >= 70) return 'B';
  if (percent >= 60) return 'C';
  if (percent >= 50) return 'D';
  return 'E';
}

function ResultScreen({
  isTheoryTest,
  score,
  totalQuestions,
  answeredCount,
  timerSeconds,
  isAiBusy,
  analysis,
  onRetakeTest,
  onBackSubject
}) {
  const [animatedPercent, setAnimatedPercent] = React.useState(0);
  const finalPercent = Math.max(0, Math.min(100, Number(score?.percent) || 0));
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedPercent / 100) * circumference;
  const initialSeconds = Math.max(5, Number(totalQuestions) || 10) * 60;
  const timeTakenSeconds = Math.max(0, initialSeconds - (Number(timerSeconds) || 0));
  const unattempted = Math.max(0, Number(totalQuestions) - Number(answeredCount));
  const correct = Math.max(0, Number(score?.correct) || 0);
  const wrong = Math.max(0, Number(totalQuestions) - correct - unattempted);
  const marksText = isTheoryTest
    ? `${Number(score?.awardedMarks) || 0} / ${Number(score?.totalMarks) || 0}`
    : `${Number(score?.correct) || 0} / ${Number(score?.total) || 0}`;
  const grade = getGrade(finalPercent);
  const stats = [
    { label: 'Total', value: totalQuestions, tone: 'text-slate-800' },
    { label: 'Correct', value: correct, tone: 'text-emerald-700' },
    { label: 'Wrong', value: wrong, tone: 'text-rose-700' },
    { label: 'Unattempted', value: unattempted, tone: 'text-amber-700' },
    { label: 'Time', value: formatDuration(timeTakenSeconds), tone: 'text-slate-800' }
  ];

  useEffect(() => {
    const startId = setTimeout(() => setAnimatedPercent(finalPercent), 50);
    return () => {
      clearTimeout(startId);
    };
  }, [finalPercent]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid w-full max-w-6xl animate-softPop gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-smcard md:sticky md:top-3 md:h-fit">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Result</p>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Grade {grade}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="relative grid h-32 w-32 place-items-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" role="img" aria-label={`Score ${finalPercent}%`}>
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#1d4ed8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition: 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
                    filter: 'drop-shadow(0 0 5px rgba(29, 78, 216, 0.35))'
                  }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Score</p>
                <p className="text-xl font-extrabold text-slate-800">{Math.round(animatedPercent)}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Marks</p>
              <p className="text-2xl font-extrabold tracking-tight text-slate-800">{marksText}</p>
              {isTheoryTest && isAiBusy && (
                <p className="mt-1 text-[11px] text-slate-500">Finalizing evaluation...</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className={`text-sm font-bold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={onRetakeTest}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
            >
              Retake Test
            </button>
            <button
              type="button"
              onClick={onBackSubject}
              disabled={isAiBusy}
              className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              Back to Subject
            </button>
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-smcard md:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">AI-Powered Analysis</h3>
            <AILabel label="AI Insights" active={analysis.loading} />
          </div>
          {!analysis.loading && !analysis.data && !analysis.error && (
            <p className="text-sm text-slate-600">Preparing AI analysis...</p>
          )}
          <AnalysisSection analysis={analysis.data} loading={analysis.loading} error={analysis.error} />
        </section>
      </div>
    </div>
  );
}

function TestBody({ onBackSubject }) {
  const {
    isTheoryTest,
    questions,
    answers,
    answeredMap,
    answeredCount,
    currentQuestionIndex,
    submitted,
    analysis,
    ui,
    setAnswer,
    requestSubmit,
    score,
    timerSeconds,
    totalQuestions,
    isAiBusy,
    resetTestState,
    getCorrectAnswerIndex
  } = useTestContext();
  const questionRefs = useRef([]);
  const title = isTheoryTest ? 'Theory Test' : 'MCQ Test';
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  useEffect(() => {
    const target = questionRefs.current[currentQuestionIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentQuestionIndex]);

  if (!totalQuestions) {
    return <StartForm />;
  }

  if (submitted) {
    return (
      <ResultScreen
        isTheoryTest={isTheoryTest}
        score={score}
        totalQuestions={totalQuestions}
        answeredCount={Object.values(answeredMap || {}).filter(Boolean).length}
        timerSeconds={timerSeconds}
        isAiBusy={isAiBusy}
        analysis={analysis}
        onRetakeTest={resetTestState}
        onBackSubject={onBackSubject}
      />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-slate-50">
      <ScoreHeader
        title={title}
        currentIndex={currentQuestionIndex}
        total={totalQuestions}
        timer={timerSeconds}
        score={score}
        submitted={submitted}
        aiBusy={isAiBusy}
        testType={isTheoryTest ? 'theory' : 'mcq'}
        paperMode
      />

      <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {questions.map((question, index) => (
            <section
              key={isTheoryTest ? `${question?.question || ''}-${index}` : `${question?.question_text || ''}-${index}`}
              ref={(node) => {
                questionRefs.current[index] = node;
              }}
              className={index === currentQuestionIndex && ui.submitWarning ? 'rounded-2xl ring-2 ring-amber-300 ring-offset-2' : ''}
            >
              {isTheoryTest ? (
                <TheoryQuestionCard
                  question={question}
                  value={answers[index]}
                  onChange={(value) => setAnswer(index, value)}
                  locked={submitted}
                  showModelAnswer={submitted}
                  questionNumber={index + 1}
                />
              ) : (
                <QuestionCard
                  question={question}
                  selectedOption={answers[index]}
                  onSelect={(optionIndex) => setAnswer(index, optionIndex)}
                  locked={submitted}
                  showResult={submitted}
                  showExplanation={submitted}
                  questionNumber={index + 1}
                  getCorrectAnswerIndex={getCorrectAnswerIndex}
                />
              )}
            </section>
          ))}
        </div>

      </div>

      {!submitted && (
        <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-4 py-3 md:px-6">
          {ui.submitWarning && (
            <p className="mx-auto mb-2 w-full max-w-4xl animate-fadeInUp rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {ui.submitWarning}
            </p>
          )}
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Answered: <strong>{answeredCount}</strong> / {totalQuestions}
              {unansweredCount > 0 && <span className="ml-2 text-amber-700">({unansweredCount} remaining)</span>}
            </p>
            <button
              type="button"
              onClick={requestSubmit}
              className="rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
            >
              {isTheoryTest ? 'Evaluate Test' : 'Submit Test'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TestContainerInner({ isOpen, onClose, title }) {
  const { ui, closeConfirm, confirmSubmit, resetTestState, isGenerating, analysis, isTheoryTest } = useTestContext();
  const isBusy = isGenerating || analysis.loading;

  useEffect(() => {
    if (!isOpen) {
      resetTestState();
    }
  }, [isOpen, resetTestState]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[12050] bg-slate-900/55 p-2 md:p-6" onClick={() => !isBusy && onClose()}>
        <div
          className="mx-auto flex h-full w-full max-w-7xl animate-softPop flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
            <h2 className="truncate text-base font-semibold text-slate-800">{title}</h2>
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => !isBusy && onClose()}
              disabled={isBusy}
            >
              Close
            </button>
          </div>

          <TestBody onBackSubject={() => !isBusy && onClose()} />
        </div>
      </div>

      <SubmitConfirmDialog
        open={ui.confirmOpen}
        onCancel={closeConfirm}
        onConfirm={confirmSubmit}
        testType={isTheoryTest ? 'theory' : 'mcq'}
      />
    </>
  );
}

export default function TestContainer({ isOpen, onClose, scopeId, scopeTarget = 'resource', title }) {
  return (
    <TestProvider scopeId={scopeId} scopeTarget={scopeTarget}>
      <TestContainerInner isOpen={isOpen} onClose={onClose} title={title} />
    </TestProvider>
  );
}
