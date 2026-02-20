import React from 'react';
import AILabel from './AILabel';
import { AIThinkingState } from './SkeletonLoaders';

function safeList(value) {
  return Array.isArray(value) ? value : [];
}

export default function AnalysisSection({ analysis, loading, error }) {
  if (loading) {
    return <AIThinkingState title="AI thinking..." subtitle="Generating actionable insights from your test performance." />;
  }

  if (error) {
    return (
      <section className="animate-fadeInUp rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </section>
    );
  }

  if (!analysis) return null;

  const isTheoryAnalysis = Array.isArray(analysis.question_evaluations);

  if (isTheoryAnalysis) {
    const evaluations = safeList(analysis.question_evaluations);

    return (
      <section className="animate-slideDown overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-smcard">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-semibold text-slate-800">Theory Analysis</h3>
          <AILabel label="AI Insights" active />
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Overall Feedback</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {analysis.overall_analysis || 'No overall analysis available.'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Question-wise Evaluation</h4>
            <div className="mt-2 space-y-3">
              {evaluations.length === 0 && (
                <p className="text-sm text-slate-600">No question-wise evaluation available.</p>
              )}
              {evaluations.map((item, index) => (
                <article key={`${item.question_index}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700">Question {Number(item.question_index) + 1}</p>
                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Marks Awarded: {Number(item.marks_awarded) || 0}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {item.feedback || 'No feedback available.'}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const description = analysis.detailed_desciption || analysis.detailed_description || '';
  const topicsToFocus = safeList(analysis.topics_to_focus);
  const plan = safeList(analysis.detailed_plan_to_improve);

  return (
    <section className="animate-slideDown overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-smcard">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-slate-800">Test Analysis</h3>
        <AILabel label="AI Insights" active />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
          {analysis.topic || 'Unknown topic'}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
          {analysis.difficulty || 'Unknown difficulty'}
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Performance</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description || 'No description available.'}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Topics to Focus</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {topicsToFocus.length === 0 && <li>No focus areas available.</li>}
            {topicsToFocus.map((topic, index) => (
              <li key={`${topic}-${index}`}>{topic}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Improvement Plan</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            {plan.length === 0 && <li>No plan available.</li>}
            {plan.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
