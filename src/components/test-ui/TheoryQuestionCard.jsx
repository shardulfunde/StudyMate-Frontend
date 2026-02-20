import React from 'react';
import AILabel from './AILabel';

export default function TheoryQuestionCard({
  question,
  value,
  onChange,
  locked,
  showModelAnswer,
  questionNumber
}) {
  return (
    <article className="animate-softPop space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-smcard md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-relaxed text-slate-800 md:text-xl">
            Q{questionNumber}. {question?.question}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
              {Number(question?.marks) || 0} marks
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
              {question?.concept || 'General'}
            </span>
          </div>
        </div>
        <AILabel label="AI Powered" active={!locked} className="shrink-0" />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Your Answer</span>
        <textarea
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          disabled={locked}
          rows={7}
          placeholder="Write your answer here..."
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </label>

      {showModelAnswer && (
        <div className="animate-slideDown overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-semibold text-slate-700">Reference Answer</h4>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
            {question?.answer || 'No reference answer available.'}
          </p>
        </div>
      )}
    </article>
  );
}
