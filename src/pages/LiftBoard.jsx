import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import { Clock3, Loader2, Mountain, Navigation, Search, X } from 'lucide-react';
import { api } from '@/api/apiClient';
import { createPageUrl } from '../utils';
import EmptyState from '../components/EmptyState';
import { estimateLiftWaitMinutes } from '@/lib/liftInsights';
import { getResortTimeZone } from '@/lib/resortTimeZone';

function waitPillClass(minutes, status) {
  if (status === 'closed') {
    return 'bg-rose-100 text-rose-700';
  }
  if (status === 'hold') {
    return 'bg-amber-100 text-amber-800';
  }
  if (minutes <= 5) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (minutes <= 15) {
    return 'bg-sky-100 text-sky-700';
  }
  if (minutes <= 30) {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-orange-100 text-orange-700';
}

export default function LiftBoard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resortSearch, setResortSearch] = useState('');
  const [selectedResorts, setSelectedResorts] = useState(() => {
    const raw = searchParams.get('resorts') || searchParams.get('resort') || '';
    return raw.split(',').map((id) => id.trim()).filter(Boolean);
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  const { data: resorts = [], isLoading: resortsLoading } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => api.entities.Resort.list('name')
  });

  const { data: allRuns = [] } = useQuery({
    queryKey: ['lift-board-all-runs'],
    queryFn: () => api.entities.Run.list('name', 5000)
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['lift-board-ratings'],
    queryFn: () => api.entities.DifficultyRating.list('-created_date', 5000)
  });

  const visitedResortIds = useMemo(() => {
    if (!currentUser?.email) return [];

    return Array.from(new Set([
      ...ratings
        .filter((rating) => rating.created_by === currentUser.email)
        .map((rating) => allRuns.find((run) => run.id === rating.run_id)?.resort_id)
        .filter(Boolean),
    ]));
  }, [allRuns, currentUser?.email, ratings]);

  useEffect(() => {
    const validSelected = selectedResorts.filter((id) => resorts.some((resort) => resort.id === id));
    const fallback = validSelected.length > 0
      ? validSelected
      : (visitedResortIds.length > 0 ? visitedResortIds : (resorts[0]?.id ? [resorts[0].id] : []));

    const next = fallback.join(',');
    const current = searchParams.get('resorts') || searchParams.get('resort') || '';

    if (next !== current) {
      setSearchParams(next ? { resorts: next } : {});
    }

    if (JSON.stringify(fallback) !== JSON.stringify(selectedResorts)) {
      setSelectedResorts(fallback);
    }
  }, [resorts, searchParams, selectedResorts, setSearchParams, visitedResortIds]);

  const activeResortIds = selectedResorts.length > 0 ? selectedResorts : (visitedResortIds.length > 0 ? visitedResortIds : (resorts[0]?.id ? [resorts[0].id] : []));

  const { data: lifts = [], isLoading: liftsLoading } = useQuery({
    queryKey: ['lift-board-lifts', activeResortIds],
    queryFn: () => api.entities.Lift.filter({ resort_id: { $in: activeResortIds } }, 'name', 1000),
    enabled: activeResortIds.length > 0
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['lift-board-runs', activeResortIds],
    queryFn: () => api.entities.Run.filter({ resort_id: { $in: activeResortIds } }, undefined, 3000),
    enabled: activeResortIds.length > 0
  });

  const { data: liftWaitReports = [] } = useQuery({
    queryKey: ['lift-board-reports', activeResortIds],
    queryFn: () => api.entities.LiftWaitReport.filter({ resort_id: { $in: activeResortIds } }, '-created_date', 1000),
    enabled: activeResortIds.length > 0
  });

  const { data: liftStatusUpdates = [] } = useQuery({
    queryKey: ['lift-board-status', activeResortIds],
    queryFn: () => api.entities.LiftStatusUpdate.filter({ resort_id: { $in: activeResortIds } }, '-created_date', 600),
    enabled: activeResortIds.length > 0
  });

  const { data: conditionNotes = [] } = useQuery({
    queryKey: ['lift-board-notes', activeResortIds, lifts.map((lift) => lift.id).join(',')],
    queryFn: () => {
      const liftIds = lifts.map((lift) => lift.id);
      if (liftIds.length === 0) return [];
      return api.entities.ConditionNote.filter({ lift_id: { $in: liftIds } }, '-created_date', 600);
    },
    enabled: activeResortIds.length > 0 && lifts.length > 0
  });

  const resortMap = useMemo(() => resorts.reduce((acc, resort) => ({ ...acc, [resort.id]: resort }), {}), [resorts]);

  const filteredResorts = useMemo(() => {
    const query = resortSearch.trim().toLowerCase();
    if (!query) return [];
    return resorts
      .filter((resort) => !selectedResorts.includes(resort.id))
      .filter((resort) => resort.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [resortSearch, resorts, selectedResorts]);

  const toggleResortSelection = (resortId) => {
    setSelectedResorts((prev) => {
      if (prev.includes(resortId)) {
        return prev.filter((id) => id !== resortId);
      }
      return [...prev, resortId];
    });
  };

  const liftRows = useMemo(() => {
    const latestReportByLift = {};
    for (const report of liftWaitReports) {
      const key = report.lift_id || report.lift_name;
      if (!key) continue;
      if (!latestReportByLift[key]) {
        latestReportByLift[key] = [];
      }
      if (latestReportByLift[key].length < 2 && report.report_status !== 'closed') {
        latestReportByLift[key].push(report);
      }
    }

    const latestStatusByLift = {};
    for (const status of liftStatusUpdates) {
      const key = status.lift_id || status.lift_name;
      if (!latestStatusByLift[key]) {
        latestStatusByLift[key] = status;
      }
    }

    const runCountByLift = {};
    for (const run of runs) {
      const key = run.lift_id || run.lift;
      if (!key) continue;
      runCountByLift[key] = (runCountByLift[key] || 0) + 1;
    }

    return lifts.map((lift) => {
      const resortTimeZone = getResortTimeZone(resortMap[lift.resort_id]);
      const reports = latestReportByLift[lift.id] || latestReportByLift[lift.name] || [];
      const report = reports[0] || null;
      const status = latestStatusByLift[lift.id] || latestStatusByLift[lift.name] || null;
      const inferredStatus = status?.status || report?.report_status || lift.status || 'open';
      const estimate = estimateLiftWaitMinutes({ lift, reports: liftWaitReports, conditionNotes, now: new Date(), resortTimeZone });
      const avgWait = reports.length
        ? Math.round(reports.reduce((sum, item) => sum + item.wait_minutes, 0) / reports.length)
        : estimate.waitMinutes;

      return {
        lift,
        report,
        status,
        avgWait,
        estimated: reports.length === 0,
        inferredStatus,
        runCount: runCountByLift[lift.id] || runCountByLift[lift.name] || 0
      };
    });
  }, [conditionNotes, lifts, liftWaitReports, liftStatusUpdates, resortMap, runs]);

  if (resortsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="pb-8 px-4 pt-6 lg:px-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lift Time Board</h1>
          <p className="text-sm text-slate-500 mt-1">Live crowd-reported waits and closure status by lift.</p>
        </div>
        {activeResortIds.length === 1 && (
          <Link to={createPageUrl(`Resort?id=${activeResortIds[0]}`)}>
            <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Open Resort
            </button>
          </Link>
        )}
      </div>

      <div className="p-3 mb-4 border border-slate-200 rounded-xl bg-white">
        <div className="text-xs text-slate-500 mb-2">Resorts</div>
        {selectedResorts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedResorts.map((id) => {
              const resort = resortMap[id];
              if (!resort) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleResortSelection(id)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border bg-sky-100 border-sky-300 text-sky-700 flex items-center gap-1"
                >
                  {resort.name}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={resortSearch}
            onChange={(e) => setResortSearch(e.target.value)}
            placeholder="Add resorts to this board..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 h-9 text-sm"
          />
        </div>
        {filteredResorts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filteredResorts.map((resort) => (
              <button
                key={resort.id}
                type="button"
                onClick={() => toggleResortSelection(resort.id)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border bg-white border-slate-200 text-slate-700 hover:border-sky-300"
              >
                {resort.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {liftsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : activeResortIds.length === 0 || liftRows.length === 0 ? (
        <EmptyState
          icon={Mountain}
          title="No lifts yet"
          description="Add lifts in Add Data, then assign them to runs."
          action={<Link to={createPageUrl('AddData')} className="text-sky-600 text-sm font-medium">Go to Add Data</Link>}
          className=""
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {liftRows.map(({ lift, report, status, inferredStatus, runCount, avgWait, estimated }) => {
            const displayMinutes = avgWait;
            const badgeText = inferredStatus === 'closed'
              ? 'Closed'
              : inferredStatus === 'hold'
                ? status?.expected_reopen_at
                  ? `Hold until ${new Date(status.expected_reopen_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                  : 'Hold'
                : displayMinutes === null
                  ? 'No wait data'
                  : `${displayMinutes} min${estimated ? ' est.' : ''}`;

            return (
              <Link key={lift.id} to={createPageUrl(`Lift?id=${lift.id}`)} className="block p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{lift.name}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {runCount} run{runCount === 1 ? '' : 's'}
                      </span>
                      <span className="capitalize">{inferredStatus}</span>
                      {status?.verified ? <span>confirmed</span> : status ? <span>awaiting one more report</span> : null}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${waitPillClass(displayMinutes ?? 0, inferredStatus)}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                  <Clock3 className="w-3 h-3" />
                  {report?.created_date
                    ? `Updated ${formatDistanceToNowStrict(new Date(report.created_date), { addSuffix: true })}`
                    : estimated ? 'Estimated from historical patterns and conditions' : 'No recent reports'}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
