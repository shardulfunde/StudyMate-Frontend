import React from 'react';

export default function SubmitConfirmDialog({ open, onCancel, onConfirm, testType = 'mcq' }) {
  if (!open) return null;

  const isTheory = testType === 'theory';
  const title = isTheory ? 'Evaluate Answers?' : 'Submit Test?';
  const description = isTheory
    ? 'Your answers will be locked and your result screen will appear while evaluation completes.'
    : 'Your answers will be locked and your result screen will appear immediately.';
  const confirmLabel = isTheory ? 'Evaluate Now' : 'Submit and Check';

  return (
    <div className="fixed inset-0 z-[12060] flex items-center justify-center bg-slate-900/45 p-4">
      <div
        className="w-full max-w-md animate-softPop rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-confirm-title"
      >
        <h3 id="submit-confirm-title" className="text-lg font-semibold text-slate-800">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
