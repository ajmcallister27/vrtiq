import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Mountain, Map, Star, FileText } from 'lucide-react';

export default function Settings() {
  const { data: resorts = [] } = useQuery({ queryKey: ['resorts'], queryFn: api.resorts.list });
  const { data: runs = [] } = useQuery({ queryKey: ['runs'], queryFn: () => api.runs.list() });
  const { data: ratings = [] } = useQuery({ queryKey: ['ratings'], queryFn: () => api.ratings.list() });
  const { data: notes = [] } = useQuery({ queryKey: ['notes'], queryFn: () => api.notes.list() });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Settings</h1>
      
      <div className="bg-slate-50 rounded-xl p-4 mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">Database Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 flex items-center gap-3">
            <Mountain className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-lg font-bold">{resorts.length}</p>
              <p className="text-xs text-slate-500">Resorts</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-center gap-3">
            <Map className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-lg font-bold">{runs.length}</p>
              <p className="text-xs text-slate-500">Runs</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-center gap-3">
            <Star className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-lg font-bold">{ratings.length}</p>
              <p className="text-xs text-slate-500">Ratings</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-lg font-bold">{notes.length}</p>
              <p className="text-xs text-slate-500">Notes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-sm text-slate-400">
        Whiteout v1.0.0
      </div>
    </div>
  );
}
