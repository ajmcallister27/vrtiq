import { getDayHourInTimeZone } from '@/lib/resortTimeZone';

const CONDITION_WEIGHTS = {
  powder: 0.16,
  groomed: 0.08,
  icy: -0.12,
  'thin cover': -0.12,
  spring: -0.02
};

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
      }
    } catch {
      // fall through to comma splitting
    }

    return tags
      .split(',')
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

export function getLiftKey(lift) {
  if (!lift) return '';
  if (lift.id) return `id:${lift.id}`;
  if (lift.resort_id && lift.name) return `name:${lift.resort_id}:${lift.name}`;
  if (lift.name) return `name:${lift.name}`;
  return '';
}

export function getReportLiftKey(report) {
  if (!report) return '';
  if (report.lift_id) return `id:${report.lift_id}`;
  if (report.resort_id && report.lift_name) return `name:${report.resort_id}:${report.lift_name}`;
  if (report.lift_name) return `name:${report.lift_name}`;
  return '';
}

export function getNoteLiftKey(note) {
  if (!note) return '';
  if (note.lift_id) return `id:${note.lift_id}`;
  if (note.run?.lift_id) return `id:${note.run.lift_id}`;
  if (note.run?.resort_id && note.run?.lift) return `name:${note.run.resort_id}:${note.run.lift}`;
  return '';
}

function getConditionWeight(tags) {
  return normalizeTags(tags).reduce((score, tag) => score + (CONDITION_WEIGHTS[tag] || 0), 0);
}

function chooseRecentConditionTags(conditionNotes, liftKey, beforeDate) {
  const pivot = toDate(beforeDate);
  if (!pivot) return [];

  const recent = (conditionNotes || [])
    .filter((note) => getNoteLiftKey(note) === liftKey)
    .map((note) => ({ ...note, createdAt: toDate(note.created_date) }))
    .filter((note) => note.createdAt && note.createdAt <= pivot)
    .sort((a, b) => b.createdAt - a.createdAt)[0];

  return normalizeTags(recent?.tags);
}

export function buildLiftWaitSamples(reports = [], conditionNotes = [], lift, resortTimeZone) {
  const liftKey = getLiftKey(lift);
  if (!liftKey) return [];

  return (reports || [])
    .filter((report) => getReportLiftKey(report) === liftKey)
    .map((report) => {
      const createdAt = toDate(report.created_date);
      const reportTags = normalizeTags(report.conditions);
      const noteTags = reportTags.length > 0
        ? reportTags
        : chooseRecentConditionTags(conditionNotes, liftKey, createdAt);
      const { dayOfWeek, hourOfDay } = getDayHourInTimeZone(createdAt, resortTimeZone);

      return {
        report,
        status: String(report.report_status || 'open').toLowerCase(),
        waitMinutes: Number(report.wait_minutes) || 0,
        dayOfWeek,
        hourOfDay,
        tags: noteTags,
        createdAt
      };
    })
    .filter((sample) => sample.createdAt);
}

export function estimateLiftWaitMinutes({ lift, reports = [], conditionNotes = [], now = new Date(), resortTimeZone }) {
  const samples = buildLiftWaitSamples(reports, conditionNotes, lift, resortTimeZone);
  if (samples.length === 0) {
    return { waitMinutes: null, source: 'no-data', tags: [] };
  }

  const liftKey = getLiftKey(lift);
  const currentTags = chooseRecentConditionTags(conditionNotes, liftKey, now);
  const { dayOfWeek: currentDow, hourOfDay: currentHour } = getDayHourInTimeZone(now, resortTimeZone);

  const recentOpenReports = samples
    .filter((sample) => sample.report.report_status !== 'closed')
    .slice(0, 2);

  if (recentOpenReports.length > 0) {
    const avg = recentOpenReports.reduce((sum, sample) => sum + sample.waitMinutes, 0) / recentOpenReports.length;
    return { waitMinutes: Math.round(avg), source: 'recent-reports', tags: currentTags };
  }

  const weighted = samples
    .map((sample) => {
      const hourDistance = Math.min(Math.abs(sample.hourOfDay - currentHour), 24 - Math.abs(sample.hourOfDay - currentHour));
      const dayDistance = Math.min(Math.abs(sample.dayOfWeek - currentDow), 7 - Math.abs(sample.dayOfWeek - currentDow));
      const timeWeight = hourDistance === 0 ? 1 : hourDistance === 1 ? 0.8 : hourDistance <= 2 ? 0.6 : 0.3;
      const dayWeight = dayDistance === 0 ? 1 : dayDistance === 1 ? 0.75 : dayDistance <= 2 ? 0.5 : 0.25;
      const tagOverlap = currentTags.filter((tag) => sample.tags.includes(tag)).length;
      const tagWeight = 1 + (tagOverlap * 0.15);
      return {
        waitMinutes: sample.waitMinutes,
        weight: timeWeight * dayWeight * tagWeight
      };
    })
    .filter((sample) => sample.weight > 0);

  const totalWeight = weighted.reduce((sum, sample) => sum + sample.weight, 0);
  const baseEstimate = totalWeight > 0
    ? weighted.reduce((sum, sample) => sum + (sample.waitMinutes * sample.weight), 0) / totalWeight
    : samples.reduce((sum, sample) => sum + sample.waitMinutes, 0) / samples.length;

  const conditionMultiplier = 1 + getConditionWeight(currentTags);
  const estimated = Math.min(240, Math.max(0, Math.round(baseEstimate * conditionMultiplier)));

  return { waitMinutes: estimated, source: 'historical', tags: currentTags };
}

export function buildLiftHistoryBuckets({ lift, reports = [], conditionNotes = [], selectedCondition = '', dayOfWeek = null, resortTimeZone }) {
  const samples = buildLiftWaitSamples(reports, conditionNotes, lift, resortTimeZone);
  const buckets = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => []));
  const selectedTag = String(selectedCondition || '').trim().toLowerCase();

  for (const sample of samples) {
    if (selectedTag && !sample.tags.includes(selectedTag)) {
      continue;
    }
    if (dayOfWeek !== null && Number.isInteger(dayOfWeek) && sample.dayOfWeek !== dayOfWeek) {
      continue;
    }
    buckets[sample.dayOfWeek][sample.hourOfDay].push(sample);
  }

  return buckets.map((hours, dayIndex) => ({
    dayIndex,
    hours: hours.map((values, hourIndex) => {
      const openValues = values
        .filter((sample) => sample.status !== 'closed')
        .map((sample) => sample.waitMinutes);
      const closedCount = values.filter((sample) => sample.status === 'closed').length;
      const openCount = openValues.length;

      return ({
      hourIndex,
      values,
      average: openValues.length > 0 ? openValues.reduce((sum, value) => sum + value, 0) / openValues.length : null,
      count: values.length,
      openCount,
      closedCount,
      isMostlyClosed: closedCount > openCount
    });
    })
  }));
}

export function describeConditionTags(tags) {
  const normalized = normalizeTags(tags);
  if (normalized.length === 0) return 'no conditions reported';
  return normalized.join(', ');
}
