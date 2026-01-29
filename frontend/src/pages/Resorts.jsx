import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { MapPin, Search, ChevronRight, Loader2 } from 'lucide-react';

export default function Resorts() {
  const [search, setSearch] = useState('');
  const { data: resorts = [], isLoading } = useQuery({ 
    queryKey: ['resorts'], 
    queryFn: api.resorts.list 
  });

  const filtered = resorts.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Resorts</h1>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search resorts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="space-y-2">
        {filtered.map(resort => (
          <Link 
            key={resort.id} 
            to={`/resort/${resort.id}`}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-900">{resort.name}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {resort.location}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-400 py-8">No resorts found</p>
      )}
    </div>
  );
}
