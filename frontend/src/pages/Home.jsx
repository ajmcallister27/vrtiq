import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { MapPin, ChevronRight } from 'lucide-react';

export default function Home() {
  const { data: resorts = [] } = useQuery({ 
    queryKey: ['resorts'], 
    queryFn: api.resorts.list 
  });
  const { data: runs = [] } = useQuery({ 
    queryKey: ['runs'], 
    queryFn: () => api.runs.list() 
  });
  const { data: ratings = [] } = useQuery({ 
    queryKey: ['ratings'], 
    queryFn: () => api.ratings.list() 
  });

  return (
    <div className="p-4">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Whiteout</h1>
        <p className="text-slate-500">Real ski run difficulty ratings</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-slate-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{resorts.length}</p>
          <p className="text-xs text-slate-500">Resorts</p>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{runs.length}</p>
          <p className="text-xs text-slate-500">Runs</p>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{ratings.length}</p>
          <p className="text-xs text-slate-500">Ratings</p>
        </div>
      </div>

      <h2 className="font-semibold text-slate-900 mb-3">Resorts</h2>
      <div className="space-y-2">
        {resorts.slice(0, 5).map(resort => (
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

      <Link 
        to="/resorts" 
        className="block mt-4 text-center py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
      >
        View All Resorts
      </Link>
    </div>
  );
}
