import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';

export default function RunDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(5);

  const { data: run, isLoading } = useQuery({ 
    queryKey: ['run', id], 
    queryFn: () => api.runs.get(id) 
  });
  
  const { data: ratings = [] } = useQuery({ 
    queryKey: ['ratings', id], 
    queryFn: () => api.ratings.list(id) 
  });

  const ratingMutation = useMutation({
    mutationFn: (data) => api.ratings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ratings', id]);
    }
  });

  const avgRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!run) {
    return <div className="p-4">Run not found</div>;
  }

  return (
    <div className="pb-6">
      <div className="p-4 border-b border-slate-100">
        <Link to={`/resort/${run.resortId}`} className="flex items-center gap-1 text-sm text-slate-500 mb-3">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <h1 className="text-xl font-bold text-slate-900">{run.name}</h1>
        <p className="text-slate-500 capitalize">{run.officialDifficulty?.replace('_', ' ')}</p>
      </div>

      <div className="p-4">
        <div className="bg-slate-100 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Crowd Rating</p>
              <p className="text-3xl font-bold text-slate-900">{avgRating || '—'}</p>
              <p className="text-xs text-slate-400">{ratings.length} ratings</p>
            </div>
            <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-medium text-slate-900 mb-3">Rate This Run</h3>
          <div className="flex items-center gap-2 mb-3">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={newRating}
              onChange={(e) => setNewRating(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-bold text-lg w-8 text-center">{newRating}</span>
          </div>
          <button
            onClick={() => ratingMutation.mutate({ runId: id, rating: newRating })}
            disabled={ratingMutation.isPending}
            className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {ratingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
