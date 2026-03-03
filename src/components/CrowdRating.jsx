import React from 'react';
import { cn } from '@/lib/utils';

export default function CrowdRating({ rating, count, size = 'md' }) {
  const displayRating = rating ? rating.toFixed(1) : '—';
  
  const getColor = (r) => {
    if (!r) return 'bg-slate-200 text-slate-500';
    if (r <= 3) return 'bg-green-100 text-green-700';
    if (r <= 5) return 'bg-blue-100 text-blue-700';
    if (r <= 7) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-2.5 py-1',
    lg: 'text-xl px-3 py-1.5'
  };

  return (
    <div className="flex items-center gap-2">
      <span 
        className={cn(
          'font-mono font-bold rounded-md',
          getColor(rating),
          sizeClasses[size]
        )}
      >
        {displayRating}
      </span>
      {count !== undefined && (
        <span className="text-xs text-slate-400">
          {count} {count === 1 ? 'rating' : 'ratings'}
        </span>
      )}
    </div>
  );
}