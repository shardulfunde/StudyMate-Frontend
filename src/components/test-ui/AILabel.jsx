import React from 'react';

export default function AILabel({ label = 'AI Powered', active = false, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
        'transition-all duration-200',
        active
          ? 'animate-softPop border-blue-200 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-slate-50 text-slate-600',
        className
      ].join(' ')}
    >
      <span
        className={[
          'h-2 w-2 rounded-full',
          active ? 'bg-blue-500 animate-pulseDot' : 'bg-slate-400'
        ].join(' ')}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
