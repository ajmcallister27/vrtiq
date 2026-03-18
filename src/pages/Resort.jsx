import React, { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, Plus, Loader2, ArrowDown, ArrowUp,
  ExternalLink, Mountain, Map as MapIcon, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RunCard from '../components/RunCard';
import DifficultyBadge from '../components/DifficultyBadge';
import EmptyState from '../components/EmptyState';

const difficultyOrder = { green: 1, blue: 2, black: 3, double_black: 4, terrain_park: 5 };

export default function Resort() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const resortId = searchParams.get('id');
  
  const [sortBy, setSortBy] = useState('official'); // official, crowd, name
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data: resort, isLoading: resortLoading } = useQuery({
    queryKey: ['resort', resortId],
    queryFn: () => base44.entities.Resort.filter({ id: resortId }),
    enabled: !!resortId,
    select: (data) => data[0]
  });

  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ['runs', resortId],
    queryFn: () => base44.entities.Run.filter({ resort_id: resortId }),
    enabled: !!resortId
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.DifficultyRating.list()
  });

  // Calculate average ratings per run
  const ratingsByRun = ratings.reduce((acc, rating) => {
    if (!acc[rating.run_id]) acc[rating.run_id] = [];
    acc[rating.run_id].push(rating.rating);
    return acc;
  }, {});

  const avgRatingByRun = Object.entries(ratingsByRun).reduce((acc, [runId, ratings]) => {
    acc[runId] = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return acc;
  }, {});

  // Filter and sort runs
  const filteredRuns = runs
    .filter(run => filterDifficulty === 'all' || run.official_difficulty === filterDifficulty)
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'official') {
        comparison = (difficultyOrder[a.official_difficulty] || 0) - (difficultyOrder[b.official_difficulty] || 0);
      } else if (sortBy === 'crowd') {
        comparison = (avgRatingByRun[b.id] || 0) - (avgRatingByRun[a.id] || 0);
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Count runs by difficulty
  const runCounts = runs.reduce((acc, run) => {
    acc[run.official_difficulty] = (acc[run.official_difficulty] || 0) + 1;
    return acc;
  }, {});

  if (resortLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!resort) {
    return (
      <EmptyState
        icon={Mountain}
        title="Resort not found"
        description="This resort may have been removed or you may be offline"
        action={
          <Link to={createPageUrl('Resorts')}>
            <Button variant="outline" className="rounded-xl">
              Browse Resorts
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="pb-6">
      {/* Resort Header */}
      <div className="px-4 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{resort.name}</h1>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">
                {resort.location}{resort.country ? `, ${resort.country}` : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {resort.website && (
              <a 
                href={resort.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <Link
              to={createPageUrl(`SuggestEdit?type=resort&name=${encodeURIComponent(resort.name)}&back=${encodeURIComponent(location.pathname + location.search)}`)}
              className="p-2 text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 text-xs"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{runs.length}</span>
            <span className="text-slate-500">runs</span>
          </div>
          {resort.vertical_drop && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{resort.vertical_drop.toLocaleString()}'</span>
              <span className="text-slate-500">vertical</span>
            </div>
          )}
          {resort.peak_elevation && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{resort.peak_elevation.toLocaleString()}'</span>
              <span className="text-slate-500">peak</span>
            </div>
          )}
        </div>

        {/* Run count badges */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {['green', 'blue', 'black', 'double_black'].map(diff => (
            runCounts[diff] > 0 && (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(filterDifficulty === diff ? 'all' : diff)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                  filterDifficulty === diff 
                    ? 'border-sky-500 bg-sky-50' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <DifficultyBadge difficulty={diff} size="sm" />
                <span className="text-sm font-medium text-slate-700">{runCounts[diff]}</span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="px-4 py-3 flex items-center justify-between">
        <Tabs value={sortBy} onValueChange={setSortBy}>
          <TabsList className="h-8 bg-slate-100 rounded-lg">
            <TabsTrigger value="official" className="text-xs h-6 px-2 rounded">Official</TabsTrigger>
            <TabsTrigger value="crowd" className="text-xs h-6 px-2 rounded">Crowd</TabsTrigger>
            <TabsTrigger value="name" className="text-xs h-6 px-2 rounded">Name</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="h-8 px-2"
        >
          {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Runs List */}
      <div className="px-4">
        {runsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredRuns.length === 0 ? (
          <EmptyState
            icon={MapIcon}
            title={filterDifficulty !== 'all' ? "No runs match filter" : "No runs yet"}
            description={filterDifficulty !== 'all' ? "Try selecting a different difficulty" : "Add runs to this resort"}
            action={
              filterDifficulty !== 'all' ? (
                <Button variant="outline" onClick={() => setFilterDifficulty('all')} className="rounded-xl">
                  Clear Filter
                </Button>
              ) : (
                <Link to={createPageUrl(`AddData?resort=${resortId}`)}>
                  <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Run
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredRuns.map(run => (
              <RunCard
                key={run.id}
                run={run}
                avgRating={avgRatingByRun[run.id]}
                ratingCount={ratingsByRun[run.id]?.length}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trail Map */}
      {resort.map_image_url && (
        <div className="px-4 mt-8">
          <h2 className="font-semibold text-slate-900 mb-3">Trail Map</h2>
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <img 
              src={resort.map_image_url} 
              alt={`${resort.name} trail map`}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Add Run FAB */}
      <Link 
        to={createPageUrl(`AddData?resort=${resortId}`)}
        className="fixed bottom-20 right-4 z-40"
      >
        <Button className="h-12 px-5 rounded-full bg-slate-900 hover:bg-slate-800 shadow-lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Run
        </Button>
      </Link>
    </div>
  );
}