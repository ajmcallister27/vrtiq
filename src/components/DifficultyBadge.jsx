import React from 'react';
import { cn } from '@/lib/utils';

const difficultyConfig = {
  green: {
    label: 'Green Circle',
    symbol: '●',
    bg: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-600'
  },
  blue: {
    label: 'Blue Square',
    symbol: '■',
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-600'
  },
  black: {
    label: 'Black Diamond',
    symbol: '◆',
    bg: 'bg-slate-900',
    text: 'text-white',
    border: 'border-slate-950'
  },
  double_black: {
    label: 'Double Black',
    symbol: '◆◆',
    bg: 'bg-slate-900',
    text: 'text-white',
    border: 'border-slate-950'
  },
  terrain_park: {
    label: 'Terrain Park',
    symbol: '▲',
    bg: 'bg-orange-500',
    text: 'text-white',
    border: 'border-orange-600'
  }
};

export default function DifficultyBadge({ difficulty, size = 'md', showLabel = false }) {
  const config = difficultyConfig[difficulty] || difficultyConfig.green;
  
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base'
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          'rounded-md flex items-center justify-center font-bold border',
          config.bg,
          config.text,
          config.border,
          sizeClasses[size]
        )}
      >
        <span className={difficulty === 'double_black' ? 'text-[0.6em] tracking-tighter' : ''}>
          {config.symbol}
        </span>
      </div>
      {showLabel && (
        <span className="text-sm text-slate-600">{config.label}</span>
      )}
    </div>
  );
}