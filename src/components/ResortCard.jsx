import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { MapPin, ChevronRight, Mountain } from 'lucide-react';

export default function ResortCard({ resort, runCount, distanceMi }) {
  return (
    <Link 
      to={createPageUrl(`Resort?id=${resort.id}`)}
      className="block"
    >
      <div className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all active:scale-[0.99]">
        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
          <Mountain className="w-6 h-6 text-slate-400" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-slate-900 truncate">{resort.name}</h3>
          <div className="flex items-center gap-x-2 gap-y-1 flex-wrap min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 break-words">
                {resort.location}{resort.country ? `, ${resort.country}` : ''}
              </span>
            </div>
            {distanceMi !== null && distanceMi !== undefined && (
              <span className="text-xs text-sky-600 font-medium shrink-0">{distanceMi} mi</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pl-2 shrink-0 self-center">
          {runCount !== undefined && (
            <span className="text-xs text-slate-600 font-semibold px-2 py-1 rounded-full bg-slate-100">
              {runCount} runs
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </Link>
  );
}