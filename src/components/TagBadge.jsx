import React from 'react';
import { cn } from '@/lib/utils';

const tagConfig = {
  powder: { emoji: '❄️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  groomed: { emoji: '🛠️', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  icy: { emoji: '🧊', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  'thin cover': { emoji: '🪨', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  spring: { emoji: '🌤️', color: 'bg-lime-50 text-lime-700 border-lime-200' },
};

export default function TagBadge({ tag, interactive = false, selected = false, onClick = () => {} }) {
  const config = tagConfig[tag.toLowerCase()] || { 
    emoji: '🏷️', 
    color: 'bg-slate-50 text-slate-700 border-slate-200' 
  };

  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border transition-all',
        interactive ? 'px-4 py-2 text-sm min-h-11' : 'px-2 py-1 text-xs',
        config.color,
        interactive && 'cursor-pointer hover:scale-105 active:scale-95',
        selected && 'ring-2 ring-sky-500 ring-offset-1',
        !interactive && 'cursor-default'
      )}
    >
      <span>{config.emoji}</span>
      <span className="capitalize">{tag}</span>
    </button>
  );
}

export const availableTags = Object.keys(tagConfig);