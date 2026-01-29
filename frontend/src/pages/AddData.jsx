import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { Mountain, Map, Check, Loader2 } from 'lucide-react';

export default function AddData() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('resort');
  const [resortForm, setResortForm] = useState({ name: '', location: '' });
  const [runForm, setRunForm] = useState({ name: '', resortId: '', officialDifficulty: 'blue' });

  const { data: resorts = [] } = useQuery({ 
    queryKey: ['resorts'], 
    queryFn: api.resorts.list 
  });

  const resortMutation = useMutation({
    mutationFn: (data) => api.resorts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['resorts']);
      setResortForm({ name: '', location: '' });
    }
  });

  const runMutation = useMutation({
    mutationFn: (data) => api.runs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['runs']);
      setRunForm({ name: '', resortId: '', officialDifficulty: 'blue' });
    }
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Add Data</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('resort')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            tab === 'resort' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Mountain className="w-4 h-4 inline mr-1" />
          Resort
        </button>
        <button
          onClick={() => setTab('run')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            tab === 'run' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Map className="w-4 h-4 inline mr-1" />
          Run
        </button>
      </div>

      {tab === 'resort' ? (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Resort name"
            value={resortForm.name}
            onChange={(e) => setResortForm({ ...resortForm, name: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <input
            type="text"
            placeholder="Location (e.g., Vail, CO)"
            value={resortForm.location}
            onChange={(e) => setResortForm({ ...resortForm, location: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={() => resortMutation.mutate(resortForm)}
            disabled={!resortForm.name || !resortForm.location || resortMutation.isPending}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {resortMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             resortMutation.isSuccess ? <Check className="w-4 h-4" /> : null}
            {resortMutation.isSuccess ? 'Added!' : 'Add Resort'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <select
            value={runForm.resortId}
            onChange={(e) => setRunForm({ ...runForm, resortId: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Select resort</option>
            {resorts.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Run name"
            value={runForm.name}
            onChange={(e) => setRunForm({ ...runForm, name: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={runForm.officialDifficulty}
            onChange={(e) => setRunForm({ ...runForm, officialDifficulty: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="green">Green (Beginner)</option>
            <option value="blue">Blue (Intermediate)</option>
            <option value="black">Black (Advanced)</option>
            <option value="double_black">Double Black (Expert)</option>
          </select>
          <button
            onClick={() => runMutation.mutate(runForm)}
            disabled={!runForm.name || !runForm.resortId || runMutation.isPending}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {runMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             runMutation.isSuccess ? <Check className="w-4 h-4" /> : null}
            {runMutation.isSuccess ? 'Added!' : 'Add Run'}
          </button>
        </div>
      )}
    </div>
  );
}
