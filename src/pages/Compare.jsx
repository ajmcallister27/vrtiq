import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  GitCompare, Loader2, Plus, Check, 
  ArrowLeftRight, ChevronDown, List, X, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import DifficultyBadge from '../components/DifficultyBadge';
import CrowdRating from '../components/CrowdRating';
import EmptyState from '../components/EmptyState';

export default function Compare() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedResorts, setSelectedResorts] = useState([]);
  const [resortSearch, setResortSearch] = useState('');
  
  const [resort1, setResort1] = useState('');
  const [run1, setRun1] = useState('');
  const [resort2, setResort2] = useState('');
  const [run2, setRun2] = useState('');
  const [comparisonType, setComparisonType] = useState('similar');
  const [note, setNote] = useState('');

  const { data: resorts = [] } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => base44.entities.Resort.list()
  });

  const { data: allRuns = [] } = useQuery({
    queryKey: ['runs'],
    queryFn: () => base44.entities.Run.list()
  });

  const { data: comparisons = [], isLoading } = useQuery({
    queryKey: ['comparisons'],
    queryFn: () => base44.entities.CrossResortComparison.list()
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.DifficultyRating.list()
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  // Resorts where the current user has rated a run
  const visitedResortIds = new Set(
    ratings
      .filter(r => currentUser && r.created_by === currentUser?.email)
      .map(r => {
        const run = allRuns.find(run => run.id === r.run_id);
        return run?.resort_id;
      })
      .filter(Boolean)
  );

  // Resorts to show in selector: visited first, then search
  const visitedResorts = resorts.filter(r => visitedResortIds.has(r.id));
  const searchResults = resortSearch.length > 1
    ? resorts.filter(r =>
        !visitedResortIds.has(r.id) &&
        r.name.toLowerCase().includes(resortSearch.toLowerCase())
      ).slice(0, 6)
    : [];

  // Calculate average ratings
  const avgRatingByRun = ratings.reduce((acc, r) => {
    if (!acc[r.run_id]) acc[r.run_id] = { sum: 0, count: 0 };
    acc[r.run_id].sum += r.rating;
    acc[r.run_id].count += 1;
    return acc;
  }, {});

  Object.keys(avgRatingByRun).forEach(key => {
    avgRatingByRun[key] = avgRatingByRun[key].sum / avgRatingByRun[key].count;
  });

  // Maps for easy lookup
  const resortMap = resorts.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
  const runMap = allRuns.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

  // Filter runs by selected resort
  const runs1 = allRuns.filter(r => r.resort_id === resort1);
  const runs2 = allRuns.filter(r => r.resort_id === resort2);

  // Cross-resort difficulty ranking
  const crossResortRuns = selectedResorts.length > 0
    ? allRuns
        .filter(r => selectedResorts.includes(r.resort_id))
        .map(r => ({
          ...r,
          avgRating: avgRatingByRun[r.id] || null,
          resortName: resortMap[r.resort_id]?.name
        }))
        .sort((a, b) => {
          // Sort by crowd rating if available, otherwise by official difficulty
          if (a.avgRating && b.avgRating) return a.avgRating - b.avgRating;
          if (a.avgRating) return -1;
          if (b.avgRating) return 1;
          const diffOrder = { green: 1, blue: 2, black: 3, double_black: 4, terrain_park: 5 };
          return (diffOrder[a.official_difficulty] || 0) - (diffOrder[b.official_difficulty] || 0);
        })
    : [];

  const comparisonMutation = useMutation({
    mutationFn: (data) => base44.entities.CrossResortComparison.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comparisons']);
      setShowForm(false);
      setRun1('');
      setRun2('');
      setNote('');
      setComparisonType('similar');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    comparisonMutation.mutate({
      run1_id: run1,
      run2_id: run2,
      comparison_type: comparisonType,
      note: note || `${runMap[run1]?.name} is ${comparisonType === 'easier' ? 'easier than' : comparisonType === 'harder' ? 'harder than' : 'similar to'} ${runMap[run2]?.name}`
    });
  };

  const toggleResortSelection = (resortId) => {
    setSelectedResorts(prev => 
      prev.includes(resortId) 
        ? prev.filter(id => id !== resortId)
        : [...prev, resortId]
    );
  };

  // Group comparisons by resort pairs
  const groupedComparisons = comparisons.reduce((acc, comp) => {
    const run1 = runMap[comp.run1_id];
    const run2 = runMap[comp.run2_id];
    if (!run1 || !run2) return acc;
    
    const resort1 = resortMap[run1.resort_id];
    const resort2 = resortMap[run2.resort_id];
    if (!resort1 || !resort2) return acc;

    const key = [resort1.name, resort2.name].sort().join(' — ');
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...comp, run1, run2, resort1, resort2 });
    return acc;
  }, {});

  const selectedRun1 = runMap[run1];
  const selectedRun2 = runMap[run2];

  return (
    <div className="pb-8">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Compare Runs</h1>
            <p className="text-sm text-slate-500">Match difficulty across resorts</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 hover:bg-slate-800 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Resort Multi-Select for Ranking */}
      <div className="px-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-sky-500" />
            <h3 className="font-semibold text-slate-900 text-sm">Cross-Resort Difficulty Ranking</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">Your visited resorts appear first. Search to add others.</p>

          {/* Selected chips */}
          {selectedResorts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedResorts.map(id => {
                const r = resortMap[id];
                return r ? (
                  <button
                    key={id}
                    onClick={() => toggleResortSelection(id)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border bg-sky-100 border-sky-300 text-sky-700 flex items-center gap-1"
                  >
                    {r.name}
                    <X className="w-3 h-3" />
                  </button>
                ) : null;
              })}
            </div>
          )}

          {/* Visited resorts */}
          {visitedResorts.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-slate-400 mb-1.5">Resorts you've rated</p>
              <div className="flex flex-wrap gap-2">
                {visitedResorts.map(resort => (
                  <button
                    key={resort.id}
                    onClick={() => toggleResortSelection(resort.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selectedResorts.includes(resort.id)
                        ? 'opacity-40 cursor-default'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                    }`}
                    disabled={selectedResorts.includes(resort.id)}
                  >
                    {resort.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search for more */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search other resorts..."
              value={resortSearch}
              onChange={e => setResortSearch(e.target.value)}
              className="pl-9 h-8 text-sm rounded-lg"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {searchResults.map(resort => (
                <button
                  key={resort.id}
                  onClick={() => { toggleResortSelection(resort.id); setResortSearch(''); }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border bg-white border-slate-200 text-slate-600 hover:border-sky-300 transition-all"
                >
                  + {resort.name}
                </button>
              ))}
            </div>
          )}

          {/* Ranked List */}
          {selectedResorts.length > 0 && (
            <div className="border-t pt-4">
              <div className="text-xs text-slate-400 mb-2">
                {crossResortRuns.length} runs • Easiest to Hardest
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {crossResortRuns.map((run, index) => (
                  <Link
                    key={run.id}
                    to={createPageUrl(`RunDetail?id=${run.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs text-slate-400 w-5">{index + 1}</span>
                    <DifficultyBadge difficulty={run.official_difficulty} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-900 text-sm truncate block">{run.name}</span>
                      <span className="text-xs text-slate-400">{run.resortName}</span>
                    </div>
                    {run.avgRating && (
                      <CrowdRating rating={run.avgRating} size="sm" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add Comparison Form */}
      {showForm && (
        <div className="px-4 mb-6">
          <Card className="p-4 border-sky-200 bg-sky-50/50">
            <h3 className="font-semibold text-slate-900 mb-4">New Comparison</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Run 1 Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">First Run</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={resort1} onValueChange={(val) => { setResort1(val); setRun1(''); }}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Resort" />
                    </SelectTrigger>
                    <SelectContent>
                      {resorts.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={run1} onValueChange={setRun1} disabled={!resort1}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Run" />
                    </SelectTrigger>
                    <SelectContent>
                      {runs1.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          <div className="flex items-center gap-2">
                            <DifficultyBadge difficulty={r.official_difficulty} size="sm" />
                            {r.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Comparison Type */}
              <div className="flex justify-center py-2">
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border">
                  <button
                    type="button"
                    onClick={() => setComparisonType('easier')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      comparisonType === 'easier' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Easier
                  </button>
                  <button
                    type="button"
                    onClick={() => setComparisonType('similar')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      comparisonType === 'similar' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Similar
                  </button>
                  <button
                    type="button"
                    onClick={() => setComparisonType('harder')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      comparisonType === 'harder' 
                        ? 'bg-red-100 text-red-700' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Harder
                  </button>
                </div>
              </div>

              {/* Run 2 Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Second Run</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={resort2} onValueChange={(val) => { setResort2(val); setRun2(''); }}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Resort" />
                    </SelectTrigger>
                    <SelectContent>
                      {resorts.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={run2} onValueChange={setRun2} disabled={!resort2}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Run" />
                    </SelectTrigger>
                    <SelectContent>
                      {runs2.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          <div className="flex items-center gap-2">
                            <DifficultyBadge difficulty={r.official_difficulty} size="sm" />
                            {r.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              {selectedRun1 && selectedRun2 && (
                <div className="bg-white rounded-lg p-3 border text-center">
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={selectedRun1.official_difficulty} size="sm" />
                      <span className="font-medium">{selectedRun1.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      comparisonType === 'easier' ? 'bg-green-100 text-green-700' :
                      comparisonType === 'harder' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      is {comparisonType} than
                    </span>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={selectedRun2.official_difficulty} size="sm" />
                      <span className="font-medium">{selectedRun2.name}</span>
                    </div>
                  </div>
                </div>
              )}

              <Textarea
                placeholder="Add details about the comparison (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-lg"
                rows={2}
              />

              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!run1 || !run2 || run1 === run2 || comparisonMutation.isPending}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {comparisonMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Comparisons List */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">User Comparisons</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : Object.keys(groupedComparisons).length === 0 ? (
          <EmptyState
            icon={GitCompare}
            title="No comparisons yet"
            description="Be the first to compare runs across resorts"
            action={
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-slate-900 hover:bg-slate-800 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Comparison
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedComparisons).map(([key, comps]) => (
              <Collapsible key={key} defaultOpen>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-sky-500" />
                      <span className="font-medium text-slate-900">{key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">{comps.length}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t divide-y">
                      {comps.map(comp => (
                        <div key={comp.id} className="p-3 bg-slate-50/50">
                          <div className="flex items-center gap-2 text-sm flex-wrap">
                            <Link 
                              to={createPageUrl(`RunDetail?id=${comp.run1.id}`)}
                              className="flex items-center gap-1.5 hover:bg-white px-2 py-1 rounded-lg transition-colors"
                            >
                              <DifficultyBadge difficulty={comp.run1.official_difficulty} size="sm" />
                              <span className="font-medium hover:text-sky-600">{comp.run1.name}</span>
                              <span className="text-xs text-slate-400">({comp.resort1.name})</span>
                              {avgRatingByRun[comp.run1.id] && (
                                <CrowdRating rating={avgRatingByRun[comp.run1.id]} size="sm" />
                              )}
                            </Link>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              comp.comparison_type === 'easier' ? 'bg-green-100 text-green-700' :
                              comp.comparison_type === 'harder' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {comp.comparison_type}
                            </span>
                            <Link 
                              to={createPageUrl(`RunDetail?id=${comp.run2.id}`)}
                              className="flex items-center gap-1.5 hover:bg-white px-2 py-1 rounded-lg transition-colors"
                            >
                              <DifficultyBadge difficulty={comp.run2.official_difficulty} size="sm" />
                              <span className="font-medium hover:text-sky-600">{comp.run2.name}</span>
                              <span className="text-xs text-slate-400">({comp.resort2.name})</span>
                              {avgRatingByRun[comp.run2.id] && (
                                <CrowdRating rating={avgRatingByRun[comp.run2.id]} size="sm" />
                              )}
                            </Link>
                          </div>
                          {comp.note && comp.note !== `${comp.run1.name} is ${comp.comparison_type === 'easier' ? 'easier than' : comp.comparison_type === 'harder' ? 'harder than' : 'similar to'} ${comp.run2.name}` && (
                            <p className="text-xs text-slate-500 mt-2">{comp.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}