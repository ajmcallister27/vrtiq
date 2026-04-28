import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Mountain, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ResortCard from '../components/ResortCard';
import EmptyState from '../components/EmptyState';

export default function Resorts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, runs, location

  const { data: resorts = [], isLoading } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => api.entities.Resort.list()
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['runs'],
    queryFn: () => api.entities.Run.list()
  });

  // Calculate run counts
  const runCountByResort = runs.reduce((acc, run) => {
    acc[run.resort_id] = (acc[run.resort_id] || 0) + 1;
    return acc;
  }, {});

  // Filter and sort
  const filteredResorts = resorts
    .filter(resort =>
      resort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resort.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resort.country?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'runs') {
        return (runCountByResort[b.id] || 0) - (runCountByResort[a.id] || 0);
      }
      if (sortBy === 'location') {
        return (a.location || '').localeCompare(b.location || '');
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="px-4 pt-6 pb-5 lg:px-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-slate-900">All Resorts</h1>
          <Link to={createPageUrl('AddData')}>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 rounded-lg">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search resorts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 rounded-lg"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-slate-200">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Sort by Name {sortBy === 'name' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('runs')}>
                Sort by Runs {sortBy === 'runs' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('location')}>
                Sort by Location {sortBy === 'location' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 lg:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredResorts.length === 0 ? (
          <EmptyState
            icon={Mountain}
            title="No resorts found"
            description={searchQuery ? "Try a different search term" : "Add the first resort to get started"}
            action={
              <Link to={createPageUrl('AddData')}>
                <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resort
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <p className="text-xs text-slate-400 mb-1 sm:col-span-2 xl:col-span-3">
              {filteredResorts.length} resort{filteredResorts.length !== 1 ? 's' : ''}
            </p>
            {filteredResorts.map(resort => (
              <ResortCard
                key={resort.id}
                resort={resort}
                runCount={runCountByResort[resort.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}