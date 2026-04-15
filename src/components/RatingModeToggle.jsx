import React from 'react';
import { cn } from '@/lib/utils';
import { getRatingModeLabel } from '@/lib/ratingMode';
import { useRatingMode } from '@/lib/RatingModeContext';

function SkiIcon({ className }) {
  return (
    <svg viewBox="0 0 1920 1920" aria-hidden="true" className={className}>
      <style>{`.st0{fill:#fff}.st1{fill:none;stroke:#231f20;stroke-width:50;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10}`}</style>
      <g>
        <path className="st0" d="M910 322.1c0-98.2-37.7-105.6-50.7-105.2-2.9.1-5.8.1-8.6 0-13-.4-50.7 6.9-50.7 105.2 0 107.8 11.2 465.9 13.3 631.4.2 16.7.3 31.5.3 43.8 0 26.7-.3 68.6-.9 118.7-2.2 201.4-7.8 534.1-7.8 534.1s-10.7 53 50.1 53c60.7 0 50-53 50-53s-5.5-332.7-7.8-534.1c-.5-50-.9-91.9-.9-118.7 0-12.3.1-27.1.3-43.8 2.2-165.4 13.4-523.6 13.4-631.4z" />
        <path className="st0" d="M1107.4 1116c-.5-50-.9-91.9-.9-118.7 0-12.3.1-27.1.3-43.8 2.1-165.5 13.3-523.7 13.3-631.4 0-98.2-37.7-105.6-50.7-105.2-2.9.1-5.8.1-8.6 0-13-.4-50.7 6.9-50.7 105.2 0 107.8 11.2 465.9 13.3 631.4.2 16.7.3 31.5.3 43.8 0 26.7-.3 68.6-.9 118.7-2.2 201.4-7.8 534.1-7.8 534.1s-10.7 53 50 53c60.8 0 50-53 50-53s-5.4-332.7-7.6-534.1z" />
      </g>
      <g>
        <path className="st1" d="M905.1 1650.1s10.7 53-50 53-50-53-50-53 5.6-332.7 7.8-534c.5-50 .9-91.9.9-118.6 0-12.3-.1-27.1-.3-43.8-2.3-165.6-13.5-523.8-13.5-631.6 0-98.3 37.7-105.6 50.7-105.2 2.9.1 5.8.1 8.6 0 13-.4 50.7 6.9 50.7 105.2 0 107.8-11.2 465.9-13.3 631.4-.2 16.7-.3 31.5-.3 43.8 0 26.7.3 68.6.9 118.6 2.2 201.5 7.8 534.2 7.8 534.2z" />
        <path className="st1" d="M1115.1 1650.1s10.7 53-50 53-50-53-50-53 5.6-332.7 7.8-534c.5-50 .9-91.9.9-118.6 0-12.3-.1-27.1-.3-43.8-2.1-165.5-13.3-523.7-13.3-631.4 0-98.2 37.7-105.6 50.7-105.2 2.9.1 5.8.1 8.6 0 13-.4 50.7 6.9 50.7 105.2 0 107.8-11.2 465.9-13.3 631.4-.2 16.7-.3 31.5-.3 43.8 0 26.7.3 68.6.9 118.6 2.1 201.3 7.6 534 7.6 534z" />
        <path className="st1" d="M1106.8 953.6h-83.4" />
        <path className="st1" d="M896.7 953.6h-83.4" />
        <path className="st1" d="M1107.4 1116h-84.6" />
        <path className="st1" d="M897.3 1116h-84.6" />
      </g>
    </svg>
  );
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
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
      <span className="sr-only">Current mode: {getRatingModeLabel(ratingMode)}</span>
    </div>
  );
}
