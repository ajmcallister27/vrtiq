import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { api } from '@/api/apiClient';
import { Loader2, Mountain, Clock3, ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import EmptyState from '../components/EmptyState';
import CrowdRating from '../components/CrowdRating';
import { useRatingMode } from '@/lib/RatingModeContext';
import TagBadge, { availableTags } from '@/components/TagBadge';
import { estimateLiftWaitMinutes, normalizeTags } from '@/lib/liftInsights';
import { getResortTimeZone } from '@/lib/resortTimeZone';

const waitPresets = [0, 5, 10, 15, 20, 30];
const REPORT_COOLDOWN_MS = 5 * 60 * 1000;

function formatCooldown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function Lift() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const liftId = searchParams.get('id');
  const resortId = searchParams.get('resort');
  const liftName = searchParams.get('name');
  const { ratingMode } = useRatingMode();

  const [undoReport, setUndoReport] = useState(null);
  const [reportError, setReportError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const [conditionNote, setConditionNote] = useState('');
  const [selectedConditionTags, setSelectedConditionTags] = useState([]);
  const [conditionSubmitting, setConditionSubmitting] = useState(false);
  const [conditionError, setConditionError] = useState('');

  const { data: liftById, isLoading: loadingLiftById } = useQuery({
    queryKey: ['lift', liftId],
    queryFn: () => api.entities.Lift.get(liftId),
    enabled: !!liftId
  });

  const { data: liftByName = [], isLoading: loadingLiftByName } = useQuery({
    queryKey: ['lift-by-name', resortId, liftName],
    queryFn: () => api.entities.Lift.filter({ resort_id: resortId, name: liftName }),
    enabled: !liftId && !!resortId && !!liftName
  });

  const lift = liftById || liftByName[0] || null;

  const { data: resort } = useQuery({
    queryKey: ['resort', lift?.resort_id],
    queryFn: () => api.entities.Resort.get(lift.resort_id),
    enabled: !!lift?.resort_id
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  const { data: runs = [], isLoading: loadingRuns } = useQuery({
    queryKey: ['lift-runs', lift?.id, lift?.name],
    queryFn: () => {
      if (lift?.id) {
        return api.entities.Run.filter({ lift_id: lift.id }, 'name');
      }
      return api.entities.Run.filter({ resort_id: lift.resort_id, lift: lift.name }, 'name');
    },
    enabled: !!lift
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings', ratingMode],
    queryFn: () => api.entities.DifficultyRating.filter({ mode: ratingMode })
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['lift-reports', lift?.id, lift?.name],
    queryFn: () => {
      if (lift?.id) {
        return api.entities.LiftWaitReport.filter({ lift_id: lift.id }, '-created_date', 100);
      }
      return api.entities.LiftWaitReport.filter({ resort_id: lift.resort_id, lift_name: lift.name }, '-created_date', 100);
    },
    enabled: !!lift
  });

  const { data: conditionNotes = [] } = useQuery({
    queryKey: ['lift-condition-notes', lift?.id, lift?.name],
    queryFn: () => api.entities.ConditionNote.filter({ lift_id: lift.id }, '-created_date', 100),
    enabled: !!lift?.id
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['lift-status', lift?.id, lift?.name],
    queryFn: () => {
      if (lift?.id) {
        return api.entities.LiftStatusUpdate.filter({ lift_id: lift.id }, '-created_date', 40);
      }
      return api.entities.LiftStatusUpdate.filter({ resort_id: lift.resort_id, lift_name: lift.name }, '-created_date', 40);
    },
    enabled: !!lift
  });

  const loading = loadingLiftById || loadingLiftByName;
  const latestReport = reports[0] || null;
  const latestStatus = statuses[0] || null;
  const status = latestStatus?.status || latestReport?.report_status || lift?.status || 'open';
  const cooldownRemainingMs = cooldownUntil ? Math.max(0, cooldownUntil - nowTs) : 0;
  const reportLocked = cooldownRemainingMs > 0;
  const latestConditionNote = conditionNotes[0] || null;
  const currentConditionTags = useMemo(() => {
    if (selectedConditionTags.length > 0) {
      return selectedConditionTags.filter((tag) => availableTags.includes(tag));
    }
    return normalizeTags(latestConditionNote?.tags).filter((tag) => availableTags.includes(tag));
  }, [latestConditionNote, selectedConditionTags]);
  const resortTimeZone = useMemo(() => getResortTimeZone(resort), [resort]);
  const waitEstimate = useMemo(() => estimateLiftWaitMinutes({
    lift,
    reports,
    conditionNotes,
    now: new Date(),
    resortTimeZone
  }), [lift, reports, conditionNotes, resortTimeZone]);

  useEffect(() => {
    if (!currentUser?.email || reports.length === 0) {
      return;
    }

    const latestUserReport = reports.find((report) => report.created_by === currentUser.email);
    if (!latestUserReport?.created_date) {
      return;
    }

    const createdAt = new Date(latestUserReport.created_date).getTime();
    const nextAllowed = createdAt + REPORT_COOLDOWN_MS;
    if (nextAllowed > Date.now()) {
      setCooldownUntil(nextAllowed);
    }
  }, [reports, currentUser?.email]);

  useEffect(() => {
    if (!reportLocked) {
      return;
    }

    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [reportLocked]);

  const ratingAverageByRun = runs.reduce((acc, run) => {
    const matched = ratings.filter((rating) => rating.run_id === run.id);
    acc[run.id] = matched.length ? (matched.reduce((sum, rating) => sum + rating.rating, 0) / matched.length) : null;
    acc[run.id + ':count'] = matched.length;
    return acc;
  }, {});

  const recentWaitReports = reports
    .filter((report) => report.report_status !== 'closed')
    .slice(0, 2);
  const currentWaitMinutes = recentWaitReports.length === 0
    ? waitEstimate.waitMinutes
    : Math.round(recentWaitReports.reduce((sum, report) => sum + report.wait_minutes, 0) / recentWaitReports.length);
  const currentWaitDisplay = status === 'closed'
    ? 'Closed'
    : currentWaitMinutes === null
      ? 'No reports yet'
      : `${currentWaitMinutes} min${recentWaitReports.length === 0 && waitEstimate.source === 'historical' ? ' est.' : ''}`;

  const refreshLiftQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['lift-reports', lift?.id, lift?.name] });
    queryClient.invalidateQueries({ queryKey: ['lift-status', lift?.id, lift?.name] });
    queryClient.invalidateQueries({ queryKey: ['lift-condition-notes', lift?.id, lift?.name] });
  };

  const submitConditionNote = async () => {
    if (!lift || !currentUser || conditionSubmitting || (!conditionNote.trim() && selectedConditionTags.length === 0)) {
      return;
    }

    setConditionError('');
    setConditionSubmitting(true);

    try {
      await api.entities.ConditionNote.create({
        lift_id: lift.id,
        note: conditionNote.trim() || selectedConditionTags.join(', '),
        tags: selectedConditionTags,
        date_observed: new Date().toISOString()
      });
      setConditionNote('');
      setSelectedConditionTags([]);
      refreshLiftQueries();
    } catch (error) {
      setConditionError(error?.message || 'Unable to submit conditions right now.');
    } finally {
      setConditionSubmitting(false);
    }
  };

  const toggleConditionTag = (tag) => {
    setSelectedConditionTags((prev) => (
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    ));
  };

  const submitQuickReport = async (waitMinutes, reportStatus = 'open') => {
    if (!lift || !currentUser || isSubmitting) {
      return;
    }

    setReportError('');
    setIsSubmitting(true);

    try {
      const idempotencyKey = `${lift.id}:${waitMinutes}:${reportStatus}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      const created = await api.entities.LiftWaitReport.create({
        resort_id: lift.resort_id,
        lift_id: lift.id,
        lift_name: lift.name,
        wait_minutes: waitMinutes,
        report_status: reportStatus,
        conditions: currentConditionTags.join(', '),
        idempotency_key: idempotencyKey
      });

      refreshLiftQueries();
      setCooldownUntil(Date.now() + REPORT_COOLDOWN_MS);
      setNowTs(Date.now());
      setUndoReport({ id: created.id, expiresAt: Date.now() + 10000 });
      const createdId = created.id;
      setTimeout(() => {
        setUndoReport((current) => (current?.id === createdId ? null : current));
      }, 10000);
    } catch (error) {
      if (error?.status === 429) {
        setCooldownUntil(Date.now() + REPORT_COOLDOWN_MS);
        setNowTs(Date.now());
      }
      setReportError(error?.message || 'Unable to submit lift report right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (!undoReport || undoReport.expiresAt < Date.now() || isUndoing) {
      return;
    }

    setIsUndoing(true);
    try {
      await api.entities.LiftWaitReport.delete(undoReport.id);
      refreshLiftQueries();
      setUndoReport(null);
    } catch (error) {
      setReportError(error?.message || 'Unable to undo right now.');
    } finally {
      setIsUndoing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!lift) {
    return (
      <EmptyState
        icon={Mountain}
        title="Lift not found"
        description="This lift may have been removed or not linked yet."
        action={<Link to={createPageUrl('LiftBoard')} className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Back to Lift Board</Link>}
        className=""
      />
    );
  }

  return (
    <div className="pb-8 px-4 pt-6">
      <Link
        to={resort ? createPageUrl(`Resort?id=${resort.id}`) : createPageUrl('LiftBoard')}
        className="inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" />
        {resort?.name || 'Lift Board'}
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-slate-900">{lift.name}</h1>
        <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-sky-700 font-semibold">Current Wait Time</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {currentWaitDisplay}
          </p>
          {recentWaitReports.length > 1 && status !== 'closed' && (
            <p className="text-xs text-sky-700 mt-1">Based on the last 2 reports</p>
          )}
          {recentWaitReports.length === 0 && waitEstimate.source === 'historical' && (
            <p className="text-xs text-sky-700 mt-1">Estimated from historical patterns and current conditions</p>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Status: <span className="font-medium capitalize text-slate-700">{status}</span>
          {latestStatus ? ` (${latestStatus.verified ? 'confirmed' : 'awaiting one more report'})` : ''}
          {status === 'hold' && latestStatus?.expected_reopen_at ? ` · reopen ${formatDistanceToNowStrict(new Date(latestStatus.expected_reopen_at), { addSuffix: true })}` : ''}
        </p>
        {currentConditionTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {currentConditionTags.map((tag) => (
              <TagBadge key={tag} tag={tag} onClick={() => {}} />
            ))}
          </div>
        )}
        {latestReport?.created_date && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock3 className="w-3 h-3" />
            Last report {formatDistanceToNowStrict(new Date(latestReport.created_date), { addSuffix: true })}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to={createPageUrl(`LiftHistory?id=${lift.id}`)} className="text-sm text-sky-700 font-medium hover:underline">
            View history and conditions
          </Link>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="p-4 border border-slate-200 rounded-xl bg-white">
          <h2 className="font-semibold text-slate-900 mb-3">Report Lift Wait</h2>
          {!currentUser ? (
            <div className="text-sm text-slate-500">
              <Link to={createPageUrl('Login')} className="text-sky-700 hover:underline">Log in</Link> to submit lift wait reports.
            </div>
          ) : (
            <>
              {reportLocked && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  You can report this lift again in {formatCooldown(cooldownRemainingMs)}.
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {waitPresets.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    disabled={isSubmitting || reportLocked}
                    onClick={() => submitQuickReport(minutes, 'open')}
                    className="h-12 rounded-xl text-sm font-semibold border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60"
                  >
                    {minutes === 30 ? '30+ min' : `${minutes} min`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => submitQuickReport(0, 'open')}
                  disabled={isSubmitting || reportLocked}
                  className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Lift Open
                </button>
                <button
                  type="button"
                  onClick={() => submitQuickReport(0, 'closed')}
                  disabled={isSubmitting || reportLocked}
                  className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Lift Closed
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Conditions</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      interactive
                      selected={selectedConditionTags.includes(tag)}
                      onClick={() => toggleConditionTag(tag)}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={conditionNote}
                  onChange={(e) => setConditionNote(e.target.value)}
                  placeholder="Optional note"
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
                />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button type="button" onClick={submitConditionNote} disabled={conditionSubmitting || (!conditionNote.trim() && selectedConditionTags.length === 0)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-base font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                    {conditionSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save conditions'}
                  </button>
                </div>
                {conditionError && <p className="text-xs text-rose-600 mt-2">{conditionError}</p>}
              </div>

              {undoReport && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-amber-800">Report submitted. Undo?</p>
                  <button
                    type="button"
                    disabled={isUndoing || undoReport.expiresAt < Date.now()}
                    onClick={handleUndo}
                    className="h-9 rounded-lg px-3 border border-slate-300 text-sm bg-white hover:bg-slate-50 disabled:opacity-60"
                  >
                    Undo
                  </button>
                </div>
              )}

              {reportError && (
                <p className="text-xs text-rose-600 mt-3">{reportError}</p>
              )}
            </>
          )}
        </div>

        <div className="p-4 border border-slate-200 rounded-xl bg-white">
          <h2 className="font-semibold text-slate-900 mb-3">Lift Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Type:</span>
              <span className="ml-1 font-medium text-slate-800 capitalize">{(lift.lift_type || lift.type || 'unknown').replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-slate-500">Seats:</span>
              <span className="ml-1 font-medium text-slate-800">{lift.seat_count ?? 'unknown'}</span>
            </div>
            <div>
              <span className="text-slate-500">Lift Vert:</span>
              <span className="ml-1 font-medium text-slate-800">{lift.vertical_rise_ft ? `${lift.vertical_rise_ft}'` : 'unknown'}</span>
            </div>
            <div>
              <span className="text-slate-500">Ride Length:</span>
              <span className="ml-1 font-medium text-slate-800">{lift.ride_minutes_avg ? `${lift.ride_minutes_avg} min` : 'unknown'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border border-slate-200 rounded-xl bg-white">
          <h2 className="font-semibold text-slate-900 mb-3">Runs Served</h2>
          {loadingRuns ? (
            <div className="py-4 text-sm text-slate-500">Loading runs...</div>
          ) : runs.length === 0 ? (
            <div className="py-4 text-sm text-slate-500">No runs linked to this lift yet.</div>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <Link key={run.id} to={createPageUrl(`RunDetail?id=${run.id}`)} className="block p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{run.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{run.official_difficulty.replace('_', ' ')}</p>
                    </div>
                    <CrowdRating
                      rating={ratingAverageByRun[run.id]}
                      count={ratingAverageByRun[run.id + ':count'] || 0}
                      size="sm"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border border-slate-200 rounded-xl bg-white">
          <h2 className="font-semibold text-slate-900 mb-3">Recent Wait Reports</h2>
          {reports.length === 0 ? (
            <div className="py-4 text-sm text-slate-500">No reports yet.</div>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 8).map((report) => (
                <div key={report.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">{report.report_status}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDistanceToNowStrict(new Date(report.created_date), { addSuffix: true })}</p>
                    {normalizeTags(report.conditions).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {normalizeTags(report.conditions).map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {report.report_status === 'closed' ? 'Closed' : `${report.wait_minutes} min`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
