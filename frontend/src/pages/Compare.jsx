import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { GitCompare } from 'lucide-react';

export default function Compare() {
  const { data: comparisons = [] } = useQuery({ 
    queryKey: ['comparisons'], 
    queryFn: api.comparisons.list 
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Compare Runs</h1>
      
      {comparisons.length === 0 ? (
        <div className="text-center py-12">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No comparisons yet</p>
          <p className="text-sm text-slate-400">Compare runs across different resorts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comparisons.map(c => (
            <div key={c.id} className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{c.run1?.name}</span>
                <span className="text-slate-400">vs</span>
                <span className="font-medium">{c.run2?.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                c.comparisonType === 'easier' ? 'bg-green-100 text-green-700' :
                c.comparisonType === 'harder' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {c.comparisonType}
              </span>
              {c.note && <p className="text-sm text-slate-600 mt-2">{c.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
