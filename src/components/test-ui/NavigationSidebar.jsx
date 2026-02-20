import React from 'react';
import { staggerDelayClass } from './animationUtils';

function QuestionButton({ index, isAnswered, isCurrent, onJump }) {
  const styles = [
    'h-10 w-10 rounded-full border text-sm font-semibold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1',
    'active:scale-95',
    isAnswered ? 'border-blue-500 bg-blue-500 text-white shadow-sm' : 'border-slate-300 bg-slate-100 text-slate-600',
    isCurrent ? 'ring-2 ring-white outline outline-2 outline-blue-500' : ''
  ].join(' ');

  return (
    <button
      type="button"
      className={[styles, staggerDelayClass(index)].join(' ')}
      onClick={() => onJump(index)}
      aria-label={`Go to question ${index + 1}`}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {index + 1}
    </button>
  );
}

function SidebarContent({ questions, answeredMap, currentIndex, onJump }) {
  return (
    <div className="space-y-4 p-4">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-800">Question Navigator</h3>
        <p className="text-xs text-slate-500">{questions.length} total questions</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {questions.map((_, index) => (
          <QuestionButton
            key={index}
            index={index}
            isAnswered={Boolean(answeredMap[index])}
            isCurrent={index === currentIndex}
            onJump={onJump}
          />
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
        <p className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Answered
        </p>
        <p className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          Unanswered
        </p>
        <p className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white ring-2 ring-blue-500" />
          Current
        </p>
      </div>
    </div>
  );
}

export default function NavigationSidebar({
  questions,
  answeredMap,
  currentIndex,
  onJump,
  collapsed,
  onCloseMobile
}) {
  return (
    <>
      <aside className="hidden border-r border-slate-200 bg-slate-50 md:block md:w-72">
        <SidebarContent
          questions={questions}
          answeredMap={answeredMap}
          currentIndex={currentIndex}
          onJump={onJump}
        />
      </aside>

      {collapsed && (
        <div className="fixed inset-0 z-40 animate-fadeInUp bg-slate-900/40 md:hidden">
          <div className="h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">Questions</p>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                onClick={onCloseMobile}
              >
                Close
              </button>
            </div>
            <SidebarContent
              questions={questions}
              answeredMap={answeredMap}
              currentIndex={currentIndex}
              onJump={onJump}
            />
          </div>
        </div>
      )}
    </>
  );
}
