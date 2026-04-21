import React from 'react';
import { cn } from '@/lib/utils';
import { getRatingModeLabel } from '@/lib/ratingMode';
import { useRatingMode } from '@/lib/RatingModeContext';

function SkiIcon({ className }) {
  return <img src="/skiing-ski-svgrepo-com.svg" alt="" aria-hidden="true" className={className} />;
}

function SnowboardIcon({ className }) {
  return (
    <svg viewBox="-2 -2 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.51 1.527a4.416 4.416 0 0 1-.305 6.522A76.953 76.953 0 0 0 8.061 18.193a4.416 4.416 0 0 1-6.522.305 4.392 4.392 0 0 1 .317-6.499A73.833 73.833 0 0 0 12.01 1.844a4.392 4.392 0 0 1 6.499-.317zm-1.415 1.414a2.392 2.392 0 0 0-3.54.173 75.837 75.837 0 0 1-10.43 10.43 2.392 2.392 0 0 0-.005 3.691 2.416 2.416 0 0 0 3.401-.318A78.946 78.946 0 0 1 16.93 6.51a2.416 2.416 0 0 0 .166-3.568zM11.438 8.57a1 1 0 1 1 1.415-1.414 1 1 0 0 1-1.415 1.414zm-4.95 4.95a1 1 0 1 1 1.415-1.415 1 1 0 0 1-1.414 1.415z" />
    </svg>
  );
}

export default function RatingModeToggle({ className }) {
  const { ratingMode, setRatingMode } = useRatingMode();

  const options = [
    { value: 'ski', label: 'Ski', icon: SkiIcon },
    { value: 'snowboard', label: 'Snowboard', icon: SnowboardIcon },
  ];

  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 p-0.5 shadow-sm whitespace-nowrap', className)}>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium px-2">
        Mode
      </span>
      {options.map(({ value, label, icon: Icon }) => {
        const active = ratingMode === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setRatingMode(value)}
            aria-pressed={active}
            aria-label={label}
            className={cn(
              'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium gap-1.5 transition-all shrink-0',
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            )}
          >
            <Icon className={cn('w-5 h-5 shrink-0', value === 'ski' && active && 'brightness-0 invert')} />
            <span>{label}</span>
          </button>
        );
      })}
      <span className="sr-only">Current mode: {getRatingModeLabel(ratingMode)}</span>
    </div>
  );
}
