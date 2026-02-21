import React from 'react';
import AILabel from './AILabel';

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ScoreHeader({
  title,
  currentIndex,
  total,
  timer,
  score,
  submitted,
  onToggleSidebar = null,
  aiBusy = false,
  testType = 'mcq',
  paperMode = false
}) {
  const isTheory = testType === 'theory';
  const theoryReady = Number(score.totalMarks) > 0 && !aiBusy;
  const scoreText = isTheory
    ? (theoryReady ? `${score.awardedMarks}/${score.totalMarks}` : 'Checking...')
    : `${score.correct}/${score.total}`;
  const scoreSubText = isTheory
    ? (theoryReady ? `${score.percent}%` : 'Evaluation')
    : `${score.percent}%`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">
            {total
              ? (paperMode ? `${total} questions in paper format` : `Question ${Math.min(currentIndex + 1, total)} of ${total}`)
              : 'Configure your test'}
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:hidden"
              onClick={onToggleSidebar}
            >
              Questions
            </button>
          )}

          <AILabel label="AI Powered" active={aiBusy} className="hidden sm:inline-flex" />

          <div
            className={[
              'rounded-md border px-3 py-1 text-sm font-medium transition-colors',
              timer <= 60 ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'
            ].join(' ')}
          >
            {formatTimer(timer)}
          </div>

          {submitted && score && (
            <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-emerald-300 bg-emerald-50 text-center text-emerald-700 shadow-sm">
              <div>
                <p className="text-[9px] font-semibold uppercase leading-none tracking-wide">Result</p>
                <p className="text-xs font-bold leading-tight">{scoreText}</p>
                <p className="text-[9px] font-semibold leading-none">{scoreSubText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
