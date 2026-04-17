import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChevronRight, Cog } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import CrowdRating from './CrowdRating';

export default function RunCard({ run, avgRating, ratingCount, resortName }) {
  const liftUrl = run?.lift_id
    ? createPageUrl(`Lift?id=${run.lift_id}`)
    : run?.lift && run?.resort_id
      ? createPageUrl(`Lift?resort=${run.resort_id}&name=${encodeURIComponent(run.lift)}`)
      : null;

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
              liftUrl ? (
                <Link
                  to={liftUrl}
                  className="text-xs text-sky-700 flex items-center gap-1 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Cog className="w-3 h-3" />
                  {run.lift}
                </Link>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Cog className="w-3 h-3" />
                  {run.lift}
                </span>
              )
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