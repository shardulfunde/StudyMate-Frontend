import React from 'react';
import AILabel from './AILabel';
import { staggerDelayClass } from './animationUtils';

export default function QuestionCard({
  question,
  selectedOption,
  onSelect,
  locked,
  showResult,
  showExplanation,
  questionNumber,
  getCorrectAnswerIndex
}) {
  const correctIndex = getCorrectAnswerIndex(question);

  const handleOptionKeyDown = (event) => {
    if (locked) return;
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();

    const totalOptions = question.options.length;
    const fallbackIndex = selectedOption === undefined ? 0 : selectedOption;
    const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (fallbackIndex + direction + totalOptions) % totalOptions;
    onSelect(nextIndex);
  };

  return (
    <article className="animate-softPop space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-smcard md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-relaxed text-slate-800 md:text-xl">
          Q{questionNumber}. {question.question_text}
        </h3>
        <AILabel label="AI Powered" active={!locked} className="shrink-0" />
      </div>

      <div
        role="radiogroup"
        aria-label={`Question ${questionNumber}`}
        className="space-y-3"
        onKeyDown={handleOptionKeyDown}
      >
        {question.options.map((option, index) => {
          const selected = selectedOption === index;
          const correct = index === correctIndex;
          const wrongSelection = showResult && selected && !correct;

          const optionStyles = [
            'group relative w-full rounded-xl border px-4 py-3 text-left text-sm md:text-base',
            'transition-all duration-200 ease-out will-change-transform',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1',
            'active:scale-[0.995]',
            selected
              ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
              : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm',
            showResult && correct ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : '',
            wrongSelection ? 'border-red-300 bg-red-50 text-red-800' : '',
            locked ? 'cursor-default' : ''
          ].join(' ');

          return (
            <button
              key={`${option}-${index}`}
              type="button"
              role="radio"
              aria-checked={selected}
              className={[optionStyles, staggerDelayClass(index)].join(' ')}
              onClick={() => !locked && onSelect(index)}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="pr-2">{option}</span>
                {showResult && correct && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    Correct
                  </span>
                )}
                {wrongSelection && (
                  <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                    Selected
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="animate-slideDown overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-semibold text-slate-700">Explanation</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {question.explanation || 'No explanation available.'}
          </p>
        </div>
      )}
    </article>
  );
}
