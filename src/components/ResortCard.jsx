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
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all active:scale-[0.99]">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <Mountain className="w-6 h-6 text-slate-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{resort.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 truncate">
                {resort.location}{resort.country ? `, ${resort.country}` : ''}
              </span>
            </div>
            {distanceMi !== null && distanceMi !== undefined && (
              <span className="text-xs text-sky-600 font-medium">{distanceMi} mi</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {runCount !== undefined && (
            <span className="text-sm text-slate-500 font-medium">
              {runCount} runs
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </Link>
  );
}