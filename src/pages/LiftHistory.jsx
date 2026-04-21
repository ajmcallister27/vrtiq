import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Mountain, TrendingUp } from 'lucide-react';
import { createPageUrl } from '../utils';
import { api } from '@/api/apiClient';
import EmptyState from '../components/EmptyState';
import TagBadge, { availableTags } from '../components/TagBadge';
import { buildLiftHistoryBuckets, describeConditionTags, estimateLiftWaitMinutes } from '@/lib/liftInsights';
import { getResortTimeZone } from '@/lib/resortTimeZone';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const START_HOUR = 8;
const END_HOUR = 22;
const DISPLAY_HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

function formatHourLabel(hour) {
  const suffix = hour >= 12 ? 'pm' : 'am';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}${suffix}`;
}

function heatColor(value) {
  if (value === null || value === undefined) return 'bg-slate-100';
  if (value <= 5) return 'bg-emerald-100 text-emerald-800';
  if (value <= 10) return 'bg-sky-100 text-sky-800';
  if (value <= 20) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
}

function closedHeatColor(isMostlyClosed) {
  return isMostlyClosed
    ? 'bg-slate-700 text-white border-slate-600'
    : 'bg-slate-200 text-slate-700 border-slate-300';
}

export default function LiftHistory() {
  const [searchParams] = useSearchParams();
  const liftId = searchParams.get('id');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');

  const { data: lift, isLoading: liftLoading } = useQuery({
    queryKey: ['lift-history-lift', liftId],
    queryFn: () => api.entities.Lift.get(liftId),
    enabled: !!liftId
  });

  const { data: resort } = useQuery({
    queryKey: ['lift-history-resort', lift?.resort_id],
    queryFn: () => api.entities.Resort.get(lift.resort_id),
    enabled: !!lift?.resort_id
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['lift-history-reports', lift?.id],
    queryFn: () => api.entities.LiftWaitReport.filter({ lift_id: lift.id }, '-created_date', 1000),
    enabled: !!lift?.id
  });

  const { data: conditionNotes = [] } = useQuery({
    queryKey: ['lift-history-notes', lift?.id],
    queryFn: () => api.entities.ConditionNote.filter({ lift_id: lift.id }, '-created_date', 1000),
    enabled: !!lift?.id
  });

  const resortTimeZone = useMemo(() => getResortTimeZone(resort), [resort]);

  const buckets = useMemo(() => {
    if (!lift) return [];
    return buildLiftHistoryBuckets({
      lift,
      reports,
      conditionNotes,
      selectedCondition,
      dayOfWeek: null,
      resortTimeZone
    });
  }, [lift, reports, conditionNotes, resortTimeZone, selectedCondition]);

  const currentEstimate = useMemo(() => {
    if (!lift) return null;
    return estimateLiftWaitMinutes({ lift, reports, conditionNotes, now: new Date(), resortTimeZone });
  }, [lift, reports, conditionNotes, resortTimeZone]);

  const allTags = useMemo(() => {
    return availableTags;
  }, []);

  if (liftLoading) {
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
      <Link to={createPageUrl(`Lift?id=${lift.id}`)} className="inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="w-4 h-4" />
        Back to Lift
      </Link>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lift.name} History</h1>
            <p className="text-sm text-slate-500 mt-1">{resort?.name || 'Lift history'} · wait patterns by hour, day, and conditions.</p>
          </div>
          <Link to={createPageUrl(`Lift?id=${lift.id}`)} className="text-sm text-sky-700 font-medium">Open lift page</Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Current estimate</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {currentEstimate?.waitMinutes === null ? 'No data' : `${currentEstimate.waitMinutes} min`}
            </p>
            <p className="text-xs text-slate-500 mt-1">{currentEstimate?.source === 'recent-reports' ? 'Based on the latest reports' : 'Historical + conditions estimate'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Current conditions</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{describeConditionTags(currentEstimate?.tags)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Reports</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{reports.length}</p>
            <p className="text-xs text-slate-500 mt-1">Historical samples used for the heatmap</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <h2 className="font-semibold text-slate-900">Filter by condition</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCondition('')}
              className={`px-3 py-1.5 rounded-full text-sm border ${selectedCondition === '' ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              All conditions
            </button>
            {allTags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                interactive
                selected={selectedCondition === tag}
                onClick={() => setSelectedCondition((current) => (current === tag ? '' : tag))}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-semibold text-slate-900">Hour by day heatmap (8am - 10pm)</h2>
          </div>

          <div className="min-w-[700px] space-y-2">
            <div className="grid grid-cols-[64px_repeat(15,minmax(28px,1fr))] gap-1 items-stretch">
              <div className="flex items-center text-[10px] font-semibold text-slate-400">Day</div>
              {DISPLAY_HOURS.map((hour) => (
                <div key={`hour-label-${hour}`} className="h-6 rounded-md text-[10px] font-semibold text-slate-500 flex items-center justify-center">
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>
            {buckets.map((day) => (
              <div key={day.dayIndex} className="grid grid-cols-[64px_repeat(15,minmax(28px,1fr))] gap-1 items-stretch">
                <div className="flex items-center text-xs font-semibold text-slate-500">{DAYS[day.dayIndex]}</div>
                {DISPLAY_HOURS.map((hourValue) => {
                  const hour = day.hours[hourValue];
                  const showClosed = hour.closedCount > 0;
                  return (
                  <div
                    key={hour.hourIndex}
                    title={`${DAYS[day.dayIndex]} ${hour.hourIndex}:00${showClosed ? ` · closed reports: ${hour.closedCount}` : ''}${hour.average === null ? '' : ` · ${Math.round(hour.average)} min (${hour.openCount} open reports)`}`}
                    className={`h-9 rounded-md border text-[10px] font-semibold flex items-center justify-center ${showClosed ? closedHeatColor(hour.isMostlyClosed) : `border-white ${heatColor(hour.average)}`}`}
                  >
                    {showClosed ? 'C' : hour.average === null ? '' : Math.round(hour.average)}
                  </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">C = lift reported closed during that hour.</p>
        </div>
      </div>
    </div>
  );
}
