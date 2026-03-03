import React from 'react';
import { cn } from '@/lib/utils';

export default function RatingSlider({ value, onChange, disabled = false }) {
  const labels = [
    { value: 1, label: 'Easy' },
    { value: 3, label: '' },
    { value: 5, label: 'Moderate' },
    { value: 7, label: '' },
    { value: 10, label: 'Expert' },
  ];

  const getColor = (v) => {
    if (v <= 3) return 'from-green-500 to-green-600';
    if (v <= 5) return 'from-blue-500 to-blue-600';
    if (v <= 7) return 'from-slate-400 to-slate-500';
    return 'from-slate-800 to-slate-900';
  };

  const getTextColor = (v) => {
    if (v <= 3) return 'text-green-600';
    if (v <= 5) return 'text-blue-600';
    if (v <= 7) return 'text-slate-500';
    return 'text-slate-900';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">Difficulty Rating</span>
        <span className={cn('text-2xl font-bold font-mono', getTextColor(value))}>
          {value}
        </span>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 bg-slate-100 rounded-full" />
        <div 
          className={cn('absolute h-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r', getColor(value))}
          style={{ width: `${((value - 1) / 9) * 100}%` }}
        />
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="relative w-full h-6 appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-slate-300
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-slate-300
            [&::-moz-range-thumb]:shadow-md"
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-400">
        {labels.map(({ value: v, label }) => (
          <span key={v} className="w-10 text-center">{label}</span>
        ))}
      </div>
    </div>
  );
}