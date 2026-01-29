import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { ArrowLeft, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';

const difficultyColors = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  black: 'bg-black',
  double_black: 'bg-black'
};

export default function Resort() {
  const { id } = useParams();
  
  const { data: resort, isLoading: resortLoading } = useQuery({ 
    queryKey: ['resort', id], 
    queryFn: () => api.resorts.get(id) 
  });
  
  const { data: runs = [], isLoading: runsLoading } = useQuery({ 
    queryKey: ['runs', id], 
    queryFn: () => api.runs.list(id) 
  });

  if (resortLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!resort) {
    return <div className="p-4">Resort not found</div>;
  }

  return (
    <div className="pb-6">
      <div className="p-4 border-b border-slate-100">
        <Link to="/resorts" className="flex items-center gap-1 text-sm text-slate-500 mb-3">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{resort.name}</h1>
            <p className="text-slate-500">{resort.location}</p>
          </div>
          {resort.website && (
            <a href={resort.website} target="_blank" rel="noopener noreferrer" className="p-2">
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </a>
          )}
        </div>

        {resort.verticalDrop && (
          <div className="flex gap-4 mt-4 text-sm">
            <div>
              <span className="text-slate-400">Vertical:</span>
              <span className="ml-1 font-medium">{resort.verticalDrop}'</span>
            </div>
            {resort.peakElevation && (
              <div>
                <span className="text-slate-400">Peak:</span>
                <span className="ml-1 font-medium">{resort.peakElevation}'</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-semibold text-slate-900 mb-3">Runs ({runs.length})</h2>
        
        {runsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map(run => (
              <Link 
                key={run.id} 
                to={`/run/${run.id}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className={`w-6 h-6 rounded-full ${difficultyColors[run.officialDifficulty] || 'bg-slate-300'}`} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{run.name}</p>
                  {run.lift && <p className="text-xs text-slate-500">{run.lift}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
