import React, { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Loader2, Cog, Mountain, MessageSquare, 
  Send, Calendar, GitCompare, Pencil, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DifficultyBadge from '../components/DifficultyBadge';
import CrowdRating from '../components/CrowdRating';
import TagBadge, { availableTags } from '../components/TagBadge';
import RatingSlider from '../components/RatingSlider';
import EmptyState from '../components/EmptyState';
import { useRatingMode } from '@/lib/RatingModeContext';
import { getRatingModeLabel } from '@/lib/ratingMode';
import { format } from 'date-fns';

export default function RunDetail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const runId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { ratingMode } = useRatingMode();
  
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [conditions, setConditions] = useState('groomed');
  const [ratingComment, setRatingComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const { data: run, isLoading: runLoading } = useQuery({
    queryKey: ['run', runId],
    queryFn: () => api.entities.Run.filter({ id: runId }),
    enabled: !!runId,
    select: (data) => data[0]
  });

  const { data: resort } = useQuery({
    queryKey: ['resort', run?.resort_id],
    queryFn: () => api.entities.Resort.filter({ id: run.resort_id }),
    enabled: !!run?.resort_id,
    select: (data) => data[0]
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings', runId, ratingMode],
    queryFn: () => api.entities.DifficultyRating.filter({ run_id: runId, mode: ratingMode }),
    enabled: !!runId
  });

  // Base rating from official difficulty (green=2, blue=4, black=7, double_black=9)
  const baseRatingByDiff = { green: 2, blue: 4, black: 7, double_black: 9, terrain_park: 3 };

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', runId],
    queryFn: () => api.entities.ConditionNote.filter({ run_id: runId }),
    enabled: !!runId
  });

  const { data: allRuns = [] } = useQuery({
    queryKey: ['all-runs'],
    queryFn: () => api.entities.Run.list(),
  });

  const { data: allResorts = [] } = useQuery({
    queryKey: ['all-resorts'],
    queryFn: () => api.entities.Resort.list(),
  });

  const { data: comparisons = [] } = useQuery({
    queryKey: ['comparisons', runId],
    queryFn: async () => {
      const all = await api.entities.CrossResortComparison.list();
      return all.filter(c => c.run1_id === runId || c.run2_id === runId);
    },
    enabled: !!runId
  });

  const runMap = allRuns.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
  const resortMap = allResorts.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

  // Calculate average rating — include base rating from official difficulty
  const baseRating = run ? (baseRatingByDiff[run.official_difficulty] || 5) : null;
  const allRatingsWithBase = run ? [{ rating: baseRating, _isBase: true }, ...ratings] : ratings;
  const avgRating = allRatingsWithBase.length > 0
    ? allRatingsWithBase.reduce((sum, r) => sum + r.rating, 0) / allRatingsWithBase.length
    : null;

  // Check if user already rated today
  const today = new Date().toISOString().split('T')[0];
  const userRatedToday = currentUser && ratings.some(r =>
    r.created_by === currentUser.email &&
    r.created_date?.split('T')[0] === today
  );

  // Get all unique tags from notes
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

  // Mutations
  const ratingMutation = useMutation({
    mutationFn: (data) => api.entities.DifficultyRating.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ratings']);
      setShowRatingForm(false);
      setNewRating(5);
      setRatingComment('');
    }
  });

  const noteMutation = useMutation({
    mutationFn: (data) => api.entities.ConditionNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', runId]);
      setShowNoteForm(false);
      setNewNote('');
      setSelectedTags([]);
    }
  });

  const handleSubmitRating = () => {
    ratingMutation.mutate({
      run_id: runId,
      mode: ratingMode,
      rating: newRating,
      skill_level: skillLevel,
      conditions: conditions,
      comment: ratingComment || undefined
    });
  };

  const handleSubmitNote = () => {
    noteMutation.mutate({
      run_id: runId,
      note: newNote || selectedTags.join(', '),
      tags: selectedTags,
      date_observed: new Date().toISOString().split('T')[0]
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (runLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!run) {
    return (
      <EmptyState
        icon={Mountain}
        title="Run not found"
        description="This run may have been removed"
        action={
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="rounded-xl">
              Go Home
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <Link 
            to={resort ? createPageUrl(`Resort?id=${resort.id}`) : createPageUrl('Resorts')}
            className="inline-flex items-center gap-1 text-sm text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
            {resort?.name || 'Back'}
          </Link>
          <Link
            to={createPageUrl(`SuggestEdit?type=run&id=${encodeURIComponent(runId)}&name=${encodeURIComponent(run?.name || '')}&back=${encodeURIComponent(location.pathname + location.search)}`)}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <Pencil className="w-3 h-3" />
            Suggest Edit
          </Link>
        </div>

        <div className="flex items-start gap-4">
          <DifficultyBadge difficulty={run.official_difficulty} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{run.name}</h1>
            {run.lift && (
              <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                <Cog className="w-3.5 h-3.5" />
                <span className="text-sm">{run.lift}</span>
              </div>
            )}
          </div>
        </div>

        {/* Crowd Rating */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">{getRatingModeLabel(ratingMode)} Crowd Rating</span>
              <div className="mt-1">
                <CrowdRating rating={avgRating} count={ratings.length} size="lg" />
              </div>
            </div>
            {userRatedToday ? (
              <span className="text-xs text-slate-400 text-right max-w-24">Already rated {getRatingModeLabel(ratingMode).toLowerCase()} today</span>
            ) : (
              <Button 
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="bg-slate-900 hover:bg-slate-800 rounded-xl"
              >
                Rate This Run
              </Button>
            )}
          </div>
        </div>

        {/* Rating Form */}
        {showRatingForm && (
          <Card className="mt-4 p-4 border-sky-200 bg-sky-50/50">
            <h3 className="font-semibold text-slate-900 mb-2">Submit Your Rating</h3>
            <p className="text-xs text-slate-500 mb-4">Submitting in {getRatingModeLabel(ratingMode)} mode.</p>
            
            <RatingSlider value={newRating} onChange={setNewRating} />
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Your Skill Level</label>
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger className="h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Conditions</label>
                <Select value={conditions} onValueChange={setConditions}>
                  <SelectTrigger className="h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="powder">Powder</SelectItem>
                    <SelectItem value="groomed">Groomed</SelectItem>
                    <SelectItem value="packed">Packed</SelectItem>
                    <SelectItem value="icy">Icy</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Textarea
              placeholder="Add a comment (optional)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="mt-3 rounded-lg"
              rows={2}
            />

            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowRatingForm(false)}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitRating}
                disabled={ratingMutation.isPending}
                className="flex-1 bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                {ratingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Run Details */}
      {(run.description || run.vertical_drop || run.average_pitch) && (
        <div className="px-4 py-4 border-b border-slate-100">
          {run.description && (
            <p className="text-slate-600 text-sm mb-3">{run.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            {run.vertical_drop && (
              <div>
                <span className="text-slate-400">Drop:</span>
                <span className="ml-1 font-medium text-slate-700">{run.vertical_drop}'</span>
              </div>
            )}
            {run.average_pitch && (
              <div>
                <span className="text-slate-400">Avg Pitch:</span>
                <span className="ml-1 font-medium text-slate-700">{run.average_pitch}°</span>
              </div>
            )}
            {run.max_pitch && (
              <div>
                <span className="text-slate-400">Max Pitch:</span>
                <span className="ml-1 font-medium text-slate-700">{run.max_pitch}°</span>
              </div>
            )}
            {run.groomed !== undefined && (
              <div>
                <span className="text-slate-400">Groomed:</span>
                <span className="ml-1 font-medium text-slate-700">{run.groomed ? 'Yes' : 'No'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Reported Conditions</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      )}

      {/* Condition Notes */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Condition Notes ({notes.length})
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="text-sky-600"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        </div>

        {/* Note Form */}
        {showNoteForm && (
          <Card className="p-4 mb-4 border-sky-200 bg-sky-50/50">
            <Textarea
              placeholder="Describe conditions (optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="rounded-lg"
              rows={2}
            />
            
            <div className="mt-3">
              <span className="text-xs text-slate-500 mb-2 block">Add tags:</span>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <TagBadge 
                    key={tag} 
                    tag={tag} 
                    interactive 
                    selected={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNoteForm(false)}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitNote}
                disabled={selectedTags.length === 0 && !newNote.trim() || noteMutation.isPending}
                className="flex-1 bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                {noteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No condition notes yet. Be the first to add one!
          </p>
        ) : (
          <div className="space-y-3">
            {notes
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
              .map(note => (
                <Card key={note.id} className="p-3">
                  <p className="text-sm text-slate-700">{note.note}</p>
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {note.tags.map(tag => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(note.created_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Comparisons */}
      {comparisons.length > 0 && (
        <div className="px-4 py-4 border-t border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Cross-Resort Comparisons
          </h2>
          <div className="space-y-2">
            {comparisons.map(comp => {
              const isRun1 = comp.run1_id === runId;
              const otherRunId = isRun1 ? comp.run2_id : comp.run1_id;
              const otherRun = runMap[otherRunId];
              const otherResort = otherRun ? resortMap[otherRun.resort_id] : null;
              const compType = isRun1 ? comp.comparison_type : 
                comp.comparison_type === 'easier' ? 'harder' :
                comp.comparison_type === 'harder' ? 'easier' : 'similar';
              return (
                <Card key={comp.id} className="p-3 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      compType === 'easier' ? 'bg-green-100 text-green-700' :
                      compType === 'harder' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {compType === 'easier' ? 'Easier than' : compType === 'harder' ? 'Harder than' : 'Similar to'}
                    </span>
                    {otherRun ? (
                      <Link to={createPageUrl(`RunDetail?id=${otherRunId}`)} className="flex items-center gap-1.5 hover:text-sky-600 font-medium">
                        <DifficultyBadge difficulty={otherRun.official_difficulty} size="sm" />
                        {otherRun.name}
                        {otherResort && <span className="text-xs text-slate-400 font-normal">at {otherResort.name}</span>}
                      </Link>
                    ) : (
                      <span className="text-slate-400">Unknown run</span>
                    )}
                  </div>
                  {comp.note && (
                    <p className="text-xs text-slate-500 mt-1">{comp.note}</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {ratings.length > 0 && (
        <div className="px-4 py-4 border-t border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Recent {getRatingModeLabel(ratingMode)} Ratings
          </h2>
          <div className="space-y-2">
            {ratings
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
              .slice(0, 5)
              .map(rating => (
                <Card key={rating.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <CrowdRating rating={rating.rating} size="sm" />
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="capitalize">{rating.skill_level}</span>
                      <span>•</span>
                      <span className="capitalize">{rating.conditions}</span>
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-slate-600 mt-2">{rating.comment}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {rating.created_date ? format(new Date(rating.created_date), 'MMM d, yyyy · h:mm a') : ''}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}