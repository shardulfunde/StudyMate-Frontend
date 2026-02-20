import React, { useEffect, useRef } from 'react';
import { TestProvider, useTestContext } from './TestContext';
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
        <h3 className="text-lg font-semibold text-slate-800">Start Test</h3>
        <AILabel label="AI Powered" active={false} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-600">
          <span>Test Type</span>
          <select
            value={testConfig.testType}
            onChange={(event) => setField('testType', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="mcq">MCQ</option>
            <option value="theory">Theory</option>
          </select>
        </label>

        <label className="space-y-1 text-sm text-slate-600">
          <span>Questions</span>
          <input
            type="number"
            min="1"
            max="50"
            value={testConfig.numberOfQuestions}
            onChange={(event) => setField('numberOfQuestions', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="space-y-1 text-sm text-slate-600">
          <span>Difficulty</span>
          <select
            value={testConfig.difficulty}
            onChange={(event) => setField('difficulty', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
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
          <span>Mode</span>
          <select
            value={testConfig.mode}
            onChange={(event) => setField('mode', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="random">Random</option>
            <option value="relevant">Relevant</option>
          </select>
        </label>
      </div>

      {testConfig.mode === 'relevant' && (
        <label className="space-y-1 text-sm text-slate-600">
          <span>Query</span>
          <input
            type="text"
            value={testConfig.query}
            onChange={(event) => setField('query', event.target.value)}
            placeholder="Enter topic or concept"
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
          className="rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:hover:translate-y-0"
        >
          Start Test
        </button>
      </div>
    </form>
  );
}

function TestBody() {
  const {
    activeTestType,
    isTheoryTest,
    questions,
    answers,
    answeredCount,
    currentQuestionIndex,
    submitted,
    analysis,
    ui,
    setAnswer,
    requestSubmit,
    showAnalysis,
    score,
    timerSeconds,
    totalQuestions,
    isAiBusy,
    getCorrectAnswerIndex
  } = useTestContext();

  const questionRefs = useRef([]);
  const title = submitted
    ? (isTheoryTest ? `Final Marks: ${score.awardedMarks}/${score.totalMarks}` : `Final Score: ${score.correct}/${score.total}`)
    : (isTheoryTest ? 'Theory Test' : 'MCQ Test');
  const analysisLabel = isTheoryTest ? 'Show Evaluation' : 'Show Analysis';
  const hideAnalysisLabel = isTheoryTest ? 'Hide Evaluation' : 'Hide Analysis';
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
        testType={activeTestType}
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

        {submitted && (
          <div className="mx-auto flex w-full max-w-4xl items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              onClick={showAnalysis}
            >
              <AILabel label="AI Insights" active={analysis.loading || analysis.visible} />
              <span>{analysis.visible ? hideAnalysisLabel : analysisLabel}</span>
            </button>
          </div>
        )}

        {analysis.visible && (
          <div className="mx-auto w-full max-w-4xl">
            <AnalysisSection analysis={analysis.data} loading={analysis.loading} error={analysis.error} />
          </div>
        )}
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
              Submit Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TestContainerInner({ isOpen, onClose, title }) {
  const { ui, closeConfirm, confirmSubmit, resetTestState, isGenerating, analysis } = useTestContext();
  const isBusy = isGenerating || analysis.loading;

  useEffect(() => {
    if (!isOpen) {
      resetTestState();
    }
  }, [isOpen, resetTestState]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1500] bg-slate-900/55 p-2 md:p-6" onClick={() => !isBusy && onClose()}>
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

          <TestBody />
        </div>
      </div>

      <SubmitConfirmDialog open={ui.confirmOpen} onCancel={closeConfirm} onConfirm={confirmSubmit} />
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
