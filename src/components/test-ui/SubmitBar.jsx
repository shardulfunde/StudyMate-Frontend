import React from 'react';

export default function SubmitBar({
  onBack,
  onContinue,
  onSubmit,
  isFirst,
  isLast,
  submitted,
  allAnswered,
  warning
}) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-4 py-3 md:px-6">
      {warning && (
        <p className="mb-2 animate-fadeInUp rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {warning}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={isLast}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>

        {!submitted && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered}
            className="rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:hover:translate-y-0"
          >
            Submit Test
          </button>
        )}
      </div>
    </div>
  );
}
