import React from 'react';
import { cn } from '@/lib/utils';

const tagConfig = {
  steep: { emoji: '📐', color: 'bg-red-50 text-red-700 border-red-200' },
  icy: { emoji: '🧊', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  moguls: { emoji: '〰️', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  narrow: { emoji: '↔️', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  trees: { emoji: '🌲', color: 'bg-green-50 text-green-700 border-green-200' },
  powder: { emoji: '❄️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  crowded: { emoji: '👥', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  flat: { emoji: '➖', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  windy: { emoji: '💨', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  exposed: { emoji: '☀️', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

export default function TagBadge({ tag, interactive = false, selected = false, onClick }) {
  const config = tagConfig[tag.toLowerCase()] || { 
    emoji: '🏷️', 
    color: 'bg-slate-50 text-slate-700 border-slate-200' 
  };

  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all',
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