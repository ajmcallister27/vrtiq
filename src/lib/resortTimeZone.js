import tzLookup from 'tz-lookup';

const WEEKDAY_TO_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function normalizeCoordinate(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function getResortTimeZone(resort) {
  const lat = normalizeCoordinate(resort?.latitude);
  const lng = normalizeCoordinate(resort?.longitude);

  if (lat === null || lng === null) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  try {
    return tzLookup(lat, lng);
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

export function getDayHourInTimeZone(dateInput, timeZone) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return { dayOfWeek: 0, hourOfDay: 0 };
  }

  const weekdayShort = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(date);

  const hourOfDay = Number(new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hour12: false,
  }).format(date));

  return {
    dayOfWeek: WEEKDAY_TO_INDEX[weekdayShort] ?? 0,
    hourOfDay: Number.isInteger(hourOfDay) ? hourOfDay : 0,
  };
}
