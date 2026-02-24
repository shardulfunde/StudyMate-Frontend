import React from 'react';
import AILabel from './AILabel';
import { staggerDelayClass } from './animationUtils';

function SkeletonBlock({ className = '' }) {
  return <div className={`bg-shimmer animate-shimmer rounded-md ${className}`} />;
}

export function TestQuestionSkeleton() {
  return (
    <section className="animate-fadeInUp rounded-xl border border-slate-200 bg-white p-5 shadow-smcard">
      <div className="mb-4 flex items-center justify-between">
        <AILabel label="AI Powered" active />
        <SkeletonBlock className="h-4 w-20" />
      </div>

      <div className="space-y-3">
        <SkeletonBlock className="h-6 w-4/5" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>

      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={['rounded-xl border border-slate-200 p-3', staggerDelayClass(index)].join(' ')}
          >
            <SkeletonBlock className="h-5 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function AIThinkingState({ title = 'Taking a close look', subtitle = 'Reviewing answers and pulling out clear next steps.' }) {
  return (
    <section className="animate-fadeInUp rounded-xl border border-blue-200 bg-blue-50/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-blue-700">{title}</p>
        <AILabel label="AI Insights" active />
      </div>
      <p className="text-sm text-blue-700/90">{subtitle}</p>
      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={['h-2.5 w-2.5 rounded-full bg-blue-500 animate-thinkWave', staggerDelayClass(index)].join(' ')}
          />
        ))}
      </div>
    </section>
  );
}

export function IntroLoadingSplash({ stageText = 'Structuring...' }) {
  return (
    <section className="animate-fadeInUp rounded-xl border border-slate-200 bg-white p-6 shadow-smcard">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Putting your test together</h3>
        <AILabel label="AI Powered" active />
      </div>
      <p className="text-sm text-slate-600">Quietly cooking up a clean paper.</p>
      <p className="mt-2 text-xs font-medium tracking-wide text-slate-500">{stageText}</p>

      <div className="mt-5 grid gap-3">
        <SkeletonBlock className="h-9 w-full rounded-xl" />
        <SkeletonBlock className="h-9 w-full rounded-xl" />
        <SkeletonBlock className="h-9 w-11/12 rounded-xl" />
        <SkeletonBlock className="h-9 w-10/12 rounded-xl" />
      </div>
    </section>
  );
}
