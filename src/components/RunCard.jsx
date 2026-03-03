import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChevronRight, Cog } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import CrowdRating from './CrowdRating';

export default function RunCard({ run, avgRating, ratingCount, resortName }) {
  return (
    <Link 
      to={createPageUrl(`RunDetail?id=${run.id}`)}
      className="block"
    >
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all active:scale-[0.99]">
        <DifficultyBadge difficulty={run.official_difficulty} size="md" />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{run.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {run.lift && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Cog className="w-3 h-3" />
                {run.lift}
              </span>
            )}
            {resortName && (
              <span className="text-xs text-slate-400">
                {resortName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CrowdRating rating={avgRating} size="sm" />
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </Link>
  );
}