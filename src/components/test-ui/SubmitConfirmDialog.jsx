import React from 'react';

export default function SubmitConfirmDialog({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-slate-900/45 p-4">
      <div
        className="w-full max-w-md animate-softPop rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-confirm-title"
      >
        <h3 id="submit-confirm-title" className="text-lg font-semibold text-slate-800">
          Submit Test?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Once submitted, answers are locked and explanations will be revealed.
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
            Confirm Submit
          </button>
        </div>
      </div>
    </div>
  );
}
