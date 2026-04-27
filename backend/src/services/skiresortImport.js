import * as cheerio from 'cheerio';
import Tesseract from 'tesseract.js';
import prisma from '../prismaClient.js';

const SKIRESORT_HOST_RE = /(^|\.)skiresort\.info$/i;
const SKIRESORT_AD_HOST_RE = /(^|\.)skiresort-service\.com$/i;
const MAX_MAP_ASSETS = 12;
const MAX_CRAWL_PAGES = 10;
const MAX_DISCOVERED_LINKS = 40;
const MAX_OFFICIAL_MAP_PAGES = 6;

const RUN_INVALID_KEYWORDS = [
  'lift',
  'chair',
  'gondola',
  'tram',
  'hotel',
  'parking',
  'ticket',
  'weather',
  'report',
  'ski resort',
  'slope offering',
  'trail map',
  'operating times',
  'contact',
  'book',
  'accommodation',
  'details',
  'show',
  'webcam',
  'video',
  'forecast',
  'event',
  'press',
  'legal',
  'copyright',
  'facebook'
];

const LIFT_TYPE_MAP = [
  { key: 'gondola', value: 'gondola' },
  { key: 'tram', value: 'tram' },
  { key: 'funicular', value: 'funicular' },
  { key: 'magic carpet', value: 'magic_carpet' },
  { key: 'rope tow', value: 'rope_tow' },
  { key: 't-bar', value: 't_bar' },
  { key: 'chair', value: 'chairlift' }
];

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeName(value) {
  return normalizeKey(value).replace(/\b(lift|chair|gondola|tram)\b/g, '').replace(/\s+/g, ' ').trim();
}

function getResortPathPrefix(urlString) {
  const url = new URL(urlString);
  const parts = url.pathname.split('/').filter(Boolean);
  const skiResortIndex = parts.findIndex((part) => part === 'ski-resort');
  if (skiResortIndex >= 0 && parts[skiResortIndex + 1]) {
    return `/${parts.slice(0, skiResortIndex + 2).join('/')}/`;
  }

  if (parts.length >= 2) {
    return `/${parts.slice(0, 2).join('/')}/`;
  }

  return '/';
}

function getResortSlug(urlString) {
  try {
    const url = new URL(urlString);
    const parts = url.pathname.split('/').filter(Boolean);
    const index = parts.findIndex((part) => part === 'ski-resort');
    return index >= 0 ? parts[index + 1] || '' : '';
  } catch {
    return '';
  }
}

function cleanResortDisplayName(value) {
  return normalizeWhitespace(String(value || '').replace(/^ski\s+resort\s+/i, ''));
}

function isTrustedExternalResortUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return false;
  }

  if (!/^https?:$/i.test(parsed.protocol)) return false;
  if (SKIRESORT_HOST_RE.test(parsed.hostname)) return false;
  if (SKIRESORT_AD_HOST_RE.test(parsed.hostname)) return false;
  if (/adserver/i.test(parsed.hostname)) return false;
  if (/utm_source=skiresort/i.test(parsed.search || '')) return false;
  if (/oadest=/i.test(parsed.search || '')) return false;

  return true;
}

function absoluteUrl(baseUrl, href) {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function isLikelyOcrImageUrl(urlString) {
  return /\.(png|jpg|jpeg|webp)(\?|$)/i.test(urlString);
}

function isLikelyMapDocumentUrl(urlString) {
  return /\.(pdf|png|jpg|jpeg|webp|svg)(\?|$)/i.test(urlString);
}

function hasSkiresortHost(urlString) {
  try {
    return SKIRESORT_HOST_RE.test(new URL(urlString).hostname);
  } catch {
    return false;
  }
}

function ensureSkiresortUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Please provide a valid URL.');
  }

  if (!SKIRESORT_HOST_RE.test(parsed.hostname)) {
    throw new Error('Only skiresort.info URLs are supported by this importer.');
  }

  return parsed.toString();
}

function convertToFeet(value, unitHint) {
  if (value === undefined || value === null) return undefined;
  if (unitHint && /\bm\b|meter/i.test(unitHint)) {
    return Math.round(value * 3.28084);
  }
  return value;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'vrtIQ importer/1.0 (+https://vrtiq.app)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status}).`);
  }

  return response.text();
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'vrtIQ importer/1.0 (+https://vrtiq.app)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function parseIntLoose(value) {
  if (value === null || value === undefined) return undefined;
  const match = String(value).replace(/,/g, '').match(/-?\d+/);
  if (!match) return undefined;
  return Number.parseInt(match[0], 10);
}

function parseFloatLoose(value) {
  if (value === null || value === undefined) return undefined;
  const match = String(value).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) return undefined;
  return Number.parseFloat(match[0]);
}

function normalizeDifficulty(raw) {
  const value = normalizeKey(raw);
  if (!value) return undefined;

  if (value.includes('terrain park') || value.includes('park')) return 'terrain_park';
  if (value.includes('double') && value.includes('black')) return 'double_black';
  if (value.includes('double') && value.includes('diamond')) return 'double_black';
  if (value.includes('expert only') || value.includes('extreme') || value.includes('freeride')) return 'double_black';
  if (value.includes('expert')) return 'double_black';
  if (value.includes('single') && value.includes('black')) return 'black';
  if (value.includes('black diamond')) return 'black';
  if (value.includes('advanced') || value.includes('black')) return 'black';
  if (value.includes('intermediate') || value.includes('blue') || value.includes('red')) return 'blue';
  if (value.includes('easy') || value.includes('green') || value.includes('beginner')) return 'green';

  return undefined;
}

function isActualRunName(name) {
  const value = normalizeWhitespace(name);
  const normalized = normalizeKey(value);
  if (!value || value.length < 2 || value.length > 50) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^\d+$/.test(value)) return false;
  if (/^(ski|run|trail|piste|slope)\s*$/i.test(value)) return false;
  if (value.split(/\s+/).length > 5) return false;
  if (RUN_INVALID_KEYWORDS.some((word) => normalized.includes(word))) return false;
  if (/\b(express|detachable|fixed grip|yoc|manufacturer)\b/i.test(value)) return false;
  if (/[^A-Za-z0-9'\-\s&/.]/.test(value)) return false;
  return true;
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function tokenizeName(value) {
  return normalizeKey(value)
    .split(' ')
    .filter(Boolean)
    .filter((token) => token.length > 2);
}

function fuzzyMatchLiftByName(liftHint, liftRecords = []) {
  if (!liftHint || liftRecords.length === 0) return null;
  const hintNormalized = normalizeName(liftHint);
  if (!hintNormalized) return null;

  const exact = liftRecords.find((lift) => normalizeName(lift.name) === hintNormalized);
  if (exact) return exact;

  const hintTokens = tokenizeName(liftHint);
  if (hintTokens.length === 0) return null;

  let best = null;
  let bestScore = 0;
  liftRecords.forEach((lift) => {
    const liftTokens = tokenizeName(lift.name);
    if (liftTokens.length === 0) return;
    const overlap = hintTokens.filter((token) => liftTokens.includes(token)).length;
    const score = overlap / Math.max(hintTokens.length, liftTokens.length);
    if (score > bestScore) {
      bestScore = score;
      best = lift;
    }
  });

  return bestScore >= 0.45 ? best : null;
}

function estimateRunMetrics(run, resortVerticalDrop) {
  const result = { ...run };
  const vertical = Number(resortVerticalDrop) || 0;

  if (!result.vertical_drop && vertical > 0) {
    const ratioByDifficulty = {
      green: 0.24,
      blue: 0.42,
      black: 0.62,
      double_black: 0.78,
      terrain_park: 0.2
    };
    const ratio = ratioByDifficulty[result.official_difficulty] || 0.4;
    result.vertical_drop = Math.max(100, Math.round(vertical * ratio));
  }

  if (!result.average_pitch) {
    const avgByDifficulty = {
      green: 11,
      blue: 17,
      black: 24,
      double_black: 29,
      terrain_park: 12
    };
    result.average_pitch = avgByDifficulty[result.official_difficulty] || 16;
  }

  if (!result.max_pitch) {
    const deltaByDifficulty = {
      green: 4,
      blue: 7,
      black: 10,
      double_black: 12,
      terrain_park: 5
    };
    result.max_pitch = result.average_pitch + (deltaByDifficulty[result.official_difficulty] || 6);
  }

  if (!result.length_ft && result.vertical_drop && result.average_pitch) {
    const radians = (result.average_pitch * Math.PI) / 180;
    const sin = Math.sin(Math.max(0.08, radians));
    result.length_ft = Math.max(result.vertical_drop, Math.round(result.vertical_drop / sin));
  }

  return result;
}

async function geocodeResortCoordinates({ name, location, country }) {
  const queries = [
    `${name} ski resort ${location || ''} ${country || ''}`.trim(),
    `${name} ${location || ''} ${country || ''}`.trim(),
    `${name} ski area ${country || ''}`.trim()
  ];

  for (const query of queries) {
    if (!query) continue;

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '3');

      const response = await fetch(url.toString(), {
        headers: {
          'user-agent': 'vrtIQ importer/1.0 (+https://vrtiq.app)'
        }
      });

      if (!response.ok) continue;
      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) continue;

      const best = results.find((item) => /ski|resort|winter sports/i.test(String(item.display_name || ''))) || results[0];
      const lat = Number.parseFloat(best.lat);
      const lon = Number.parseFloat(best.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return { latitude: lat, longitude: lon };
      }
    } catch {
      // Continue trying with the next query variant.
    }
  }

  return {};
}

async function fetchRunsFromOpenStreetMap({ latitude, longitude }) {
  if (!latitude || !longitude) {
    return [];
  }

  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return [];
  }

  const radiusMeters = 9000;
  const query = `
    [out:json][timeout:35];
    (
      way(around:${radiusMeters},${lat},${lon})["piste:type"="downhill"]["name"];
      relation(around:${radiusMeters},${lat},${lon})["piste:type"="downhill"]["name"];
      way(around:${radiusMeters},${lat},${lon})["aerialway"]["name"];
      relation(around:${radiusMeters},${lat},${lon})["aerialway"]["name"];
    );
    out tags center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent': 'vrtIQ importer/1.0 (+https://vrtiq.app)'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];
    const liftElements = elements
      .filter((el) => Boolean(el?.tags?.aerialway) && Boolean(el?.tags?.name))
      .map((el) => ({
        name: normalizeWhitespace(el?.tags?.name || ''),
        lat: Number.parseFloat(el?.lat ?? el?.center?.lat),
        lon: Number.parseFloat(el?.lon ?? el?.center?.lon)
      }))
      .filter((lift) => lift.name && Number.isFinite(lift.lat) && Number.isFinite(lift.lon));

    const mapped = elements
      .filter((el) => normalizeKey(el?.tags?.['piste:type']) === 'downhill')
      .map((el) => {
        const runLat = Number.parseFloat(el?.lat ?? el?.center?.lat);
        const runLon = Number.parseFloat(el?.lon ?? el?.center?.lon);

        let nearestLift = null;
        let nearestLiftDistance = Infinity;
        if (Number.isFinite(runLat) && Number.isFinite(runLon)) {
          liftElements.forEach((lift) => {
            const d = distanceMeters(runLat, runLon, lift.lat, lift.lon);
            if (d < nearestLiftDistance) {
              nearestLiftDistance = d;
              nearestLift = lift;
            }
          });
        }

        return {
        name: normalizeWhitespace(el?.tags?.name || ''),
        official_difficulty: normalizeDifficulty(el?.tags?.['piste:difficulty'] || ''),
        groomed: String(el?.tags?.grooming || '').toLowerCase().includes('groom'),
        lift: nearestLiftDistance <= 2200 ? nearestLift?.name : undefined
      };
      })
      .filter((run) => isActualRunName(run.name));

    const deduped = [];
    const seen = new Set();
    mapped.forEach((run) => {
      const key = normalizeName(run.name);
      if (!key || seen.has(key)) return;
      seen.add(key);
      deduped.push({
        name: run.name,
        official_difficulty: run.official_difficulty || 'blue',
        groomed: run.groomed,
        lift: run.lift
      });
    });

    return deduped;
  } catch {
    return [];
  }
}

async function discoverOfficialTrailMapUrl(officialWebsite, resortName) {
  if (!officialWebsite) return null;

  const queue = [officialWebsite];
  const visited = new Set();

  while (queue.length > 0 && visited.size < MAX_OFFICIAL_MAP_PAGES) {
    const nextUrl = queue.shift();
    if (!nextUrl || visited.has(nextUrl)) continue;
    visited.add(nextUrl);

    try {
      const html = await fetchText(nextUrl);
      const $ = cheerio.load(html);

      const directMap = $('a[href], img[src]').toArray().map((el) => {
        const href = $(el).attr('href') || $(el).attr('src');
        const text = normalizeKey($(el).text() || '');
        const abs = absoluteUrl(nextUrl, href);
        return { abs, text };
      }).find((entry) => {
        if (!entry.abs) return false;
        if (!isLikelyMapDocumentUrl(entry.abs)) return false;
        if (/trail|piste|ski\s*map|mountain\s*map|map/i.test(entry.text) || /trail|piste|ski-map|mountain-map|trail-map/i.test(entry.abs)) {
          return true;
        }
        return false;
      });

      if (directMap?.abs && !hasSkiresortHost(directMap.abs)) {
        return directMap.abs;
      }

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const text = normalizeKey($(el).text());
        const abs = absoluteUrl(nextUrl, href);
        if (!abs) return;
        if (visited.has(abs) || queue.includes(abs)) return;

        let parsed;
        try {
          parsed = new URL(abs);
        } catch {
          return;
        }

        const sameHost = new URL(officialWebsite).hostname === parsed.hostname;
        if (!sameHost) return;

        const relevant = /trail|map|mountain|winter map|resort map|ski area map/i.test(text)
          || /trail|map|mountain/i.test(parsed.pathname);

        const mentionsResort = normalizeKey(abs).includes(normalizeKey(resortName || ''));
        if (relevant || mentionsResort) {
          queue.push(abs);
        }
      });
    } catch {
      // Ignore and continue with remaining pages.
    }
  }

  // Deterministic fallback probes for common resort trail-map routes.
  try {
    const base = new URL(officialWebsite);
    const probes = [
      '/trail-map',
      '/trail-map/',
      '/ski-map',
      '/ski-map/',
      '/mountain-map',
      '/mountain-map/',
      '/the-mountain/trail-map',
      '/the-mountain/trail-map/',
      '/the-mountain/about-the-mountain/trail-map.aspx'
    ];

    for (const path of probes) {
      const probeUrl = new URL(path, base).toString();
      try {
        const html = await fetchText(probeUrl);
        if (/trail map|ski map|mountain map|piste/i.test(html)) {
          return probeUrl;
        }
      } catch {
        // Continue probing.
      }
    }
  } catch {
    // Ignore malformed website URLs.
  }

  return null;
}

function isLikelyRunName(value) {
  const text = normalizeWhitespace(value);
  if (!text || text.length < 3 || text.length > 32) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (/\d{3,}/.test(text)) return false;
  if (/ski|resort|weather|hotel|report|map|parking|ticket|open|closed|lifts?/i.test(text)) return false;
  if (!/^[A-Za-z][A-Za-z0-9'\-\s&]+$/.test(text)) return false;
  return true;
}

function detectLiftType(raw) {
  const value = normalizeKey(raw);
  const matched = LIFT_TYPE_MAP.find((entry) => value.includes(entry.key));
  return matched ? matched.value : undefined;
}

function pickHeaderIndex(headers, aliases) {
  for (let index = 0; index < headers.length; index += 1) {
    const key = normalizeKey(headers[index]);
    if (aliases.some((alias) => key.includes(alias))) {
      return index;
    }
  }
  return -1;
}

function extractMetricValue(text, labelRegex) {
  const match = text.match(labelRegex);
  if (!match) return undefined;
  const numeric = parseIntLoose(match[1]);
  if (numeric === undefined) return undefined;
  return convertToFeet(numeric, match[2]);
}

function parseTable($, $table) {
  const rows = [];
  $table.find('tr').each((_, tr) => {
    const cells = [];
    $(tr)
      .find('th,td')
      .each((__, cell) => {
        cells.push(normalizeWhitespace($(cell).text()));
      });

    if (cells.some(Boolean)) {
      rows.push(cells);
    }
  });

  if (rows.length < 2) return null;

  const headers = rows[0];
  const body = rows.slice(1).filter((row) => row.length > 0);
  return { headers, body };
}

function extractResortData($, sourceUrl) {
  const title = normalizeWhitespace($('h1').first().text()) || normalizeWhitespace($('title').first().text());

  const breadcrumb = [];
  $('.breadcrumb li, nav.breadcrumb li, .breadcrumbs li').each((_, el) => {
    const value = normalizeWhitespace($(el).text());
    if (value) breadcrumb.push(value);
  });

  const location = breadcrumb.slice(-2).join(', ');

  const descriptionText = normalizeWhitespace($('body').text());
  const latMatch = descriptionText.match(/latitude\s*[:=]?\s*(-?\d{1,2}\.\d+)/i);
  const lngMatch = descriptionText.match(/longitude\s*[:=]?\s*(-?\d{1,3}\.\d+)/i);

  const verticalDrop = parseIntLoose(descriptionText.match(/vertical\s+drop[^\d]*(\d[\d,]*)/i)?.[1]);
  const baseElevation = parseIntLoose(descriptionText.match(/base\s+elevation[^\d]*(\d[\d,]*)/i)?.[1]);
  const peakElevation = parseIntLoose(descriptionText.match(/summit\s+elevation[^\d]*(\d[\d,]*)/i)?.[1]);

  const websiteHref =
    $('a[href*="http"]').filter((_, el) => /official\s+website|resort\s+website/i.test(normalizeWhitespace($(el).text()))).attr('href') ||
    $('link[rel="canonical"]').attr('href') ||
    sourceUrl;

  const mapLink =
    $('a[href*="piste-map"], a[href*="trail-map"], a[href*="ski-map"], a[title*="map" i]').first().attr('href') ||
    $('img[src*="piste"], img[src*="trail"], img[src*="map"]').first().attr('src') ||
    null;

  return {
    name: title || 'Unknown Resort',
    location: location || 'Unknown',
    country: breadcrumb[breadcrumb.length - 1] || undefined,
    latitude: latMatch ? Number.parseFloat(latMatch[1]) : undefined,
    longitude: lngMatch ? Number.parseFloat(lngMatch[1]) : undefined,
    vertical_drop: verticalDrop,
    base_elevation: baseElevation,
    peak_elevation: peakElevation,
    website: absoluteUrl(sourceUrl, websiteHref) || sourceUrl,
    map_image_url: absoluteUrl(sourceUrl, mapLink)
  };
}

function discoverResortLinks($, pageUrl, pathPrefix) {
  const links = new Set();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const abs = absoluteUrl(pageUrl, href);
    if (!abs) return;

    let parsed;
    try {
      parsed = new URL(abs);
    } catch {
      return;
    }

    if (!SKIRESORT_HOST_RE.test(parsed.hostname)) return;
    if (!parsed.pathname.startsWith(pathPrefix)) return;
    if (href && /^javascript:/i.test(href)) return;
    if (parsed.hash && parsed.hash.length > 1) return;
    if (/\.(pdf|zip|docx?|xlsx?)$/i.test(parsed.pathname)) return;

    const anchorText = normalizeKey($(el).text());
    const hrefText = normalizeKey(parsed.pathname);
    const isInteresting = /lift|ropeway|slope|run|trail|piste|ski map|trail map|facts|data/.test(anchorText)
      || /lift|ropeway|slope|run|trail|piste|ski-map|trail-map|facts|data/.test(hrefText);

    if (isInteresting || parsed.pathname === new URL(pageUrl).pathname) {
      links.add(parsed.toString());
    }
  });

  return Array.from(links).slice(0, MAX_DISCOVERED_LINKS);
}

async function crawlResortPages(startUrl) {
  const pathPrefix = getResortPathPrefix(startUrl);
  const visited = new Set();
  const queue = [startUrl];
  const pages = [];
  const warnings = [];

  while (queue.length > 0 && pages.length < MAX_CRAWL_PAGES) {
    const nextUrl = queue.shift();
    if (!nextUrl || visited.has(nextUrl)) continue;
    visited.add(nextUrl);

    try {
      const html = await fetchText(nextUrl);
      const $ = cheerio.load(html);
      pages.push({ url: nextUrl, $, text: normalizeWhitespace($('body').text()) });

      const discovered = discoverResortLinks($, nextUrl, pathPrefix);
      discovered.forEach((link) => {
        if (!visited.has(link) && !queue.includes(link) && queue.length < MAX_DISCOVERED_LINKS) {
          queue.push(link);
        }
      });
    } catch (error) {
      warnings.push(`Could not fetch linked page ${nextUrl}: ${error.message}`);
    }
  }

  return { pages, warnings };
}

function mergeResortFacts(primaryResort, pages, sourceUrl) {
  const pathPrefix = getResortPathPrefix(sourceUrl);
  const resortSlug = getResortSlug(sourceUrl);
  const combinedText = pages.map((page) => page.text).join(' ');

  const canonicalOverview = combinedText.match(/The ski resort\s+([^\.]+?)\s+is located in\s+([^\(\.]+?)\s*\(([^\)]+)\)\./i);
  const elevationSentence = combinedText.match(/between the elevations\s+of\s+([\d,.]+)\s+and\s+([\d,.]+)\s*m/i);

  const firstHeading = pages
    .map((page) => normalizeWhitespace(page.$('h1').first().text()))
    .find((value) => value && !/ski resort in|snow report|weather/i.test(normalizeKey(value)));

  const countryMatch = combinedText.match(/\b(country|nation)\b\s*:?\s*([A-Za-z][A-Za-z .'-]{2,40})/i);

  const locationMatch =
    combinedText.match(/\b(in|near)\s+([A-Za-z][A-Za-z .'-]{2,60},\s*[A-Za-z][A-Za-z .'-]{2,60})/i)
    || combinedText.match(/\blocation\b\s*:?\s*([A-Za-z][A-Za-z .'-]{2,60},\s*[A-Za-z][A-Za-z .'-]{2,60})/i);

  const latMatch = combinedText.match(/latitude\s*[:=]?\s*(-?\d{1,2}\.\d+)/i);
  const lngMatch = combinedText.match(/longitude\s*[:=]?\s*(-?\d{1,3}\.\d+)/i);

  const verticalDrop = extractMetricValue(combinedText, /vertical\s+drop[^\d]{0,20}(\d[\d,.]*)\s*(m|meters|ft|feet)?/i);
  const baseElevation = extractMetricValue(combinedText, /base\s+elevation[^\d]{0,20}(\d[\d,.]*)\s*(m|meters|ft|feet)?/i);
  const peakElevation = extractMetricValue(combinedText, /(?:summit|peak|top)\s+elevation[^\d]{0,20}(\d[\d,.]*)\s*(m|meters|ft|feet)?/i);

  const nameFromOverview = canonicalOverview?.[1] ? cleanResortDisplayName(canonicalOverview[1]) : '';

  const websiteCandidates = [];
  pages.forEach((page) => {
    page.$('a[href]').each((_, el) => {
      const text = normalizeKey(page.$(el).text());
      const href = page.$(el).attr('href');
      if (!href) return;
      const abs = absoluteUrl(page.url, href);
      if (!abs) return;
      const linkText = normalizeWhitespace(page.$(el).text());
      const looksLikeResortName = normalizeKey(linkText).includes(normalizeKey(nameFromOverview || primaryResort.name || resortSlug.replace(/-/g, ' ')));
      if (isTrustedExternalResortUrl(abs) && (looksLikeResortName || /official website|resort website|website/i.test(linkText))) {
        websiteCandidates.push(abs);
      }
    });
  });

  const mapCandidates = [];
  pages.forEach((page) => {
    page.$('a[href], img[src]').each((_, el) => {
      const href = page.$(el).attr('href') || page.$(el).attr('src');
      const abs = absoluteUrl(page.url, href);
      if (!abs) return;
      if (abs.includes(pathPrefix) && /\/trail-map\/?|\/piste-trail-maps\//i.test(abs)) {
        mapCandidates.push(abs);
      }
    });
  });

  const baseM = parseIntLoose(elevationSentence?.[1]);
  const peakM = parseIntLoose(elevationSentence?.[2]);
  const baseFtFromSummary = baseM !== undefined ? Math.round(baseM * 3.28084) : undefined;
  const peakFtFromSummary = peakM !== undefined ? Math.round(peakM * 3.28084) : undefined;
  const verticalFtFromSummary = baseFtFromSummary !== undefined && peakFtFromSummary !== undefined
    ? Math.max(0, peakFtFromSummary - baseFtFromSummary)
    : undefined;

  const normalizedWebsiteCandidates = websiteCandidates.filter((value, index, arr) => arr.indexOf(value) === index);
  const normalizedMapCandidates = mapCandidates.filter((value, index, arr) => arr.indexOf(value) === index);

  return {
    ...primaryResort,
    name: cleanResortDisplayName(nameFromOverview || firstHeading || primaryResort.name),
    location: normalizeWhitespace(canonicalOverview?.[2] || locationMatch?.[2] || locationMatch?.[1] || primaryResort.location || 'Unknown'),
    country: normalizeWhitespace(canonicalOverview?.[3] || countryMatch?.[2] || primaryResort.country || '' ) || undefined,
    latitude: latMatch ? Number.parseFloat(latMatch[1]) : primaryResort.latitude,
    longitude: lngMatch ? Number.parseFloat(lngMatch[1]) : primaryResort.longitude,
    vertical_drop: verticalFtFromSummary ?? verticalDrop ?? primaryResort.vertical_drop,
    base_elevation: baseFtFromSummary ?? baseElevation ?? primaryResort.base_elevation,
    peak_elevation: peakFtFromSummary ?? peakElevation ?? primaryResort.peak_elevation,
    website: normalizedWebsiteCandidates[0] || primaryResort.website || sourceUrl,
    map_image_url: normalizedMapCandidates[0] || absoluteUrl(sourceUrl, './trail-map/') || primaryResort.map_image_url
  };
}

function mergeEntityLists(...lists) {
  const merged = new Map();
  lists.flat().forEach((item) => {
    const key = normalizeName(item.name);
    if (!key) return;
    const existing = merged.get(key) || {};
    merged.set(key, {
      ...existing,
      ...Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined && value !== null && value !== ''))
    });
  });
  return Array.from(merged.values());
}

function extractLiftsAndRunsFromPages(pages) {
  const liftsCollection = [];
  const runsCollection = [];

  pages.forEach((page) => {
    const isLiftPage = /\/ski-lifts\//i.test(page.url);
    const isRunPage = /\/slope-offering\//i.test(page.url) || /\/ski-runs-slopes\//i.test(page.url);

    const extracted = extractLiftsAndRuns(page.$);
    if (isRunPage) {
      runsCollection.push(...extracted.runs);
    }

    if (!isLiftPage) {
      return;
    }

    page.$('h4 a[href*="/ski-lifts/l"]').each((_, el) => {
      const heading = normalizeWhitespace(page.$(el).text());
      const cleanName = normalizeWhitespace(heading.replace(/\(\s*yoc\s*\d{4}\s*\)/i, '').trim());
      if (!cleanName) return;

      const meta = normalizeWhitespace(page.$(el).closest('h4').parent().text());
      liftsCollection.push({
        name: cleanName,
        lift_type: detectLiftType(meta) || detectLiftType(cleanName) || 'other',
        seat_count: parseIntLoose(meta.match(/(\d+)\s*pers/i)?.[1]),
        vertical_rise_ft: convertToFeet(parseIntLoose(meta.match(/vertical\s*[:]?\s*([\d,.]+)/i)?.[1]), /\bm\b/i.test(meta) ? 'm' : 'ft'),
        ride_minutes_avg: parseFloatLoose(meta.match(/(?:duration|ride\s*time|travel\s*time)\s*[:]?\s*([\d,.]+)/i)?.[1])
      });
    });
  });

  const lifts = mergeEntityLists(liftsCollection).filter((item) => item.name && item.name.length >= 2);
  const runs = mergeEntityLists(runsCollection).filter((item) => item.name && item.name.length >= 2);
  return { lifts, runs };
}

function extractLiftsAndRuns($) {
  const lifts = [];
  const runs = [];

  $('table').each((_, tableEl) => {
    const parsed = parseTable($, $(tableEl));
    if (!parsed) return;

    const { headers, body } = parsed;
    const joinedHeader = normalizeKey(headers.join(' '));

    const looksLikeLiftTable = /lift|chair|gondola|ropeway|cable car/.test(joinedHeader);
    const looksLikeRunTable = /slope|trail|run|piste/.test(joinedHeader);

    if (!looksLikeLiftTable && !looksLikeRunTable) return;

    if (looksLikeLiftTable) {
      const nameIndex = pickHeaderIndex(headers, ['name', 'lift', 'ropeway']);
      const typeIndex = pickHeaderIndex(headers, ['type', 'system']);
      const seatIndex = pickHeaderIndex(headers, ['seat']);
      const riseIndex = pickHeaderIndex(headers, ['vertical', 'rise']);
      const durationIndex = pickHeaderIndex(headers, ['duration', 'ride', 'time']);

      body.forEach((row) => {
        const name = normalizeWhitespace(row[nameIndex] || row[0]);
        if (!name) return;

        const typeRaw = normalizeWhitespace(row[typeIndex] || '');
        const seatRaw = normalizeWhitespace(row[seatIndex] || '');
        const riseRaw = normalizeWhitespace(row[riseIndex] || '');
        const durationRaw = normalizeWhitespace(row[durationIndex] || '');

        lifts.push({
          name,
          lift_type: detectLiftType(typeRaw) || detectLiftType(name) || 'other',
          seat_count: parseIntLoose(seatRaw),
          vertical_rise_ft: parseIntLoose(riseRaw),
          ride_minutes_avg: parseFloatLoose(durationRaw)
        });
      });
    }

    if (looksLikeRunTable) {
      const nameIndex = pickHeaderIndex(headers, ['name', 'trail', 'run', 'slope', 'piste']);
      const difficultyIndex = pickHeaderIndex(headers, ['difficulty', 'level', 'grade']);
      const liftIndex = pickHeaderIndex(headers, ['lift', 'served']);
      const lengthIndex = pickHeaderIndex(headers, ['length']);
      const verticalIndex = pickHeaderIndex(headers, ['vertical', 'drop']);

      body.forEach((row) => {
        const name = normalizeWhitespace(row[nameIndex] || row[0]);
        if (!name) return;

        const difficultyRaw = normalizeWhitespace(row[difficultyIndex] || '');
        const liftName = normalizeWhitespace(row[liftIndex] || '');

        runs.push({
          name,
          official_difficulty: normalizeDifficulty(difficultyRaw),
          lift: liftName || undefined,
          length_ft: parseIntLoose(row[lengthIndex] || ''),
          vertical_drop: parseIntLoose(row[verticalIndex] || '')
        });
      });
    }
  });

  const dedupeByName = (items) => {
    const map = new Map();
    items.forEach((item) => {
      const key = normalizeName(item.name);
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  };

  return {
    lifts: dedupeByName(lifts),
    runs: dedupeByName(runs)
  };
}

function extractMapAssetLinks($, pageUrl) {
  const candidates = new Set();

  $('img[src], source[srcset]').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('srcset')?.split(',').pop()?.trim()?.split(' ')[0];
    const abs = absoluteUrl(pageUrl, src);
    if (!abs) return;

    if (isLikelyOcrImageUrl(abs) && (/map|piste|trail|slope|ski/i.test(abs) || /trail-map|piste-map|ski-map/i.test(pageUrl))) {
      candidates.add(abs);
    }
  });

  const ogImage = $('meta[property="og:image"]').attr('content');
  const absOg = absoluteUrl(pageUrl, ogImage);
  if (absOg && /map|piste|trail|ski/i.test(absOg) && isLikelyOcrImageUrl(absOg)) {
    candidates.add(absOg);
  }

  return Array.from(candidates).slice(0, MAX_MAP_ASSETS);
}

function extractRunHintsFromMapPageHtml(html, knownRuns = []) {
  const hints = [];
  const body = String(html || '');

  const jsonNameMatches = body.match(/"name"\s*:\s*"([^"]{2,60})"/g) || [];
  jsonNameMatches.forEach((entry) => {
    const match = entry.match(/"name"\s*:\s*"([^"]{2,60})"/);
    const candidate = normalizeWhitespace(match?.[1] || '');
    if (!isActualRunName(candidate)) return;
    hints.push({
      name: candidate,
      official_difficulty: undefined,
      confidence: 0.45,
      source_asset: 'map-page-json'
    });
  });

  const titleCaseTokens = body.match(/[A-Z][A-Za-z'\-]{2,}(?:\s+[A-Z][A-Za-z'\-]{2,}){0,3}/g) || [];
  titleCaseTokens.forEach((token) => {
    const candidate = normalizeWhitespace(token);
    if (!isActualRunName(candidate)) return;

    if (knownRuns.length > 0) {
      const appearsInKnownRuns = knownRuns.some((run) => normalizeName(run.name) === normalizeName(candidate));
      if (!appearsInKnownRuns) return;
    }

    hints.push({
      name: candidate,
      official_difficulty: undefined,
      confidence: knownRuns.some((run) => normalizeName(run.name) === normalizeName(candidate)) ? 0.55 : 0.42,
      source_asset: 'map-page-text'
    });
  });

  const deduped = [];
  const seen = new Set();
  hints.forEach((hint) => {
    const key = normalizeName(hint.name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    deduped.push(hint);
  });

  return deduped;
}

async function analyzeTrailMap(mapUrl, knownRuns = []) {
  if (!mapUrl) {
    return {
      mapAssetsAnalyzed: 0,
      runHints: [],
      warnings: ['No trail map URL detected on skiresort.info page.']
    };
  }

  const warnings = [];
  const runHints = [];
  const ocrHitCounts = new Map();

  let assets = [];
  if (isLikelyOcrImageUrl(mapUrl)) {
    assets = [mapUrl];
  } else {
    try {
      const html = await fetchText(mapUrl);
      const $ = cheerio.load(html);
      const htmlHints = extractRunHintsFromMapPageHtml(html, knownRuns);
      runHints.push(...htmlHints);
      assets = extractMapAssetLinks($, mapUrl);
      if (assets.length === 0) {
        warnings.push('Map page found, but no image assets were detected for OCR.');
      }
    } catch (error) {
      warnings.push(`Map page fetch failed: ${error.message}`);
    }
  }

  if (assets.length === 0) {
    return { mapAssetsAnalyzed: 0, runHints: [], warnings };
  }

  for (const assetUrl of assets) {
    try {
      const buffer = await fetchBuffer(assetUrl);
      const { data } = await Tesseract.recognize(buffer, 'eng', {
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1'
      });
      const lines = String(data?.text || '')
        .split(/\r?\n/)
        .map((line) => normalizeWhitespace(line))
        .filter((line) => line.length >= 3);

      lines.forEach((line) => {
        const normalizedLine = normalizeName(line);
        const matchedRun = knownRuns.find((run) => normalizeName(run.name) === normalizedLine);
        const cleanedCandidate = normalizeWhitespace(
          line
            .replace(/\b(green|blue|black|double black|intermediate|advanced|expert|easy)\b/gi, '')
            .replace(/[^A-Za-z0-9'\-\s&/.]/g, ' ')
        );

        const candidateName = matchedRun?.name || (isActualRunName(cleanedCandidate) ? cleanedCandidate : null);
        if (!candidateName || !isActualRunName(candidateName)) return;

        const inferredDifficulty = normalizeDifficulty(line);
        const key = normalizeName(candidateName);
        ocrHitCounts.set(key, (ocrHitCounts.get(key) || 0) + 1);

        runHints.push({
          name: candidateName,
          official_difficulty: inferredDifficulty,
          confidence: matchedRun ? 0.55 : 0.35,
          source_asset: assetUrl
        });
      });
    } catch (error) {
      warnings.push(`Could not OCR map asset ${assetUrl}: ${error.message}`);
    }
  }

  const uniqueHints = [];
  const seen = new Set();
  runHints.forEach((hint) => {
    const key = normalizeName(hint.name);
    if (seen.has(key)) return;
    const hits = ocrHitCounts.get(key) || 0;
    const accepted = hits >= 2 || Boolean(hint.official_difficulty) || hint.source_asset === 'map-page-json' || hint.source_asset === 'map-page-text';
    if (!accepted) return;
    seen.add(key);
    uniqueHints.push({ ...hint, confidence: Math.min(0.85, hint.confidence + hits * 0.1) });
  });

  return {
    mapAssetsAnalyzed: assets.length,
    runHints: uniqueHints,
    warnings
  };
}

async function upsertImportedData({ resort, lifts, runs, userEmail }) {
  return prisma.$transaction(async (tx) => {
    const existingResort = await tx.resort.findFirst({
      where: {
        name: resort.name,
        location: resort.location
      }
    });

    const resortRecord = existingResort
      ? await tx.resort.update({
          where: { id: existingResort.id },
          data: {
            ...resort,
            created_by: existingResort.created_by
          }
        })
      : await tx.resort.create({
          data: {
            ...resort,
            created_by: userEmail
          }
        });

    let liftsCreated = 0;
    let liftsUpdated = 0;

    const liftByNormalizedName = new Map();
    const liftRecords = [];

    for (const lift of lifts) {
      if (!lift.name) continue;

      const existingLift = await tx.lift.findUnique({
        where: {
          resort_id_name: {
            resort_id: resortRecord.id,
            name: lift.name
          }
        }
      });

      const createdOrUpdated = await tx.lift.upsert({
        where: {
          resort_id_name: {
            resort_id: resortRecord.id,
            name: lift.name
          }
        },
        create: {
          resort_id: resortRecord.id,
          name: lift.name,
          created_by: userEmail,
          status: 'open',
          lift_type: lift.lift_type,
          type: lift.lift_type,
          seat_count: lift.seat_count,
          vertical_rise_ft: lift.vertical_rise_ft,
          ride_minutes_avg: lift.ride_minutes_avg
        },
        update: {
          lift_type: lift.lift_type,
          type: lift.lift_type,
          seat_count: lift.seat_count,
          vertical_rise_ft: lift.vertical_rise_ft,
          ride_minutes_avg: lift.ride_minutes_avg
        }
      });

      if (existingLift) {
        liftsUpdated += 1;
      } else {
        liftsCreated += 1;
      }

      liftByNormalizedName.set(normalizeName(createdOrUpdated.name), createdOrUpdated);
      liftRecords.push(createdOrUpdated);
    }

    let runsCreated = 0;
    let runsUpdated = 0;

    for (const run of runs) {
      if (!run.name) continue;

      const runLiftHint = run.lift || run.served_lift || run.served_by_lift;
      let liftRecord = runLiftHint ? liftByNormalizedName.get(normalizeName(runLiftHint)) : null;
      if (!liftRecord && runLiftHint) {
        liftRecord = fuzzyMatchLiftByName(runLiftHint, liftRecords);
      }

      if (!liftRecord && Array.isArray(run.served_lifts)) {
        for (const hint of run.served_lifts) {
          liftRecord = liftByNormalizedName.get(normalizeName(hint)) || fuzzyMatchLiftByName(hint, liftRecords);
          if (liftRecord) break;
        }
      }

      const existingRun = await tx.run.findFirst({
        where: {
          resort_id: resortRecord.id,
          name: run.name
        }
      });

      const payload = {
        resort_id: resortRecord.id,
        name: run.name,
        official_difficulty: run.official_difficulty || 'blue',
        lift: liftRecord?.name || runLiftHint || null,
        lift_id: liftRecord?.id || null,
        length_ft: run.length_ft,
        vertical_drop: run.vertical_drop,
        average_pitch: run.average_pitch,
        max_pitch: run.max_pitch,
        groomed: run.groomed ?? false,
        description: run.description
      };

      if (existingRun) {
        await tx.run.update({
          where: { id: existingRun.id },
          data: payload
        });
        runsUpdated += 1;
      } else {
        await tx.run.create({
          data: {
            ...payload,
            created_by: userEmail
          }
        });
        runsCreated += 1;
      }
    }

    return {
      resort: resortRecord,
      stats: {
        resortCreated: Number(!existingResort),
        resortUpdated: Number(Boolean(existingResort)),
        liftsCreated,
        liftsUpdated,
        runsCreated,
        runsUpdated
      }
    };
  });
}

export async function importFromSkiresortInfo({ sourceUrl, userEmail }) {
  const validatedUrl = ensureSkiresortUrl(sourceUrl);
  const crawl = await crawlResortPages(validatedUrl);
  if (crawl.pages.length === 0) {
    throw new Error('Could not load any skiresort.info pages for this URL.');
  }

  const primary = crawl.pages[0];
  const initialResort = extractResortData(primary.$, validatedUrl);
  const resort = mergeResortFacts(initialResort, crawl.pages, validatedUrl);
  const geocodedCoords = (!resort.latitude || !resort.longitude)
    ? await geocodeResortCoordinates({ name: resort.name, location: resort.location, country: resort.country })
    : {};

  const resolvedWebsite = resort.website;
  const officialTrailMapUrl = await discoverOfficialTrailMapUrl(resolvedWebsite, resort.name);

  const resolvedResort = {
    ...resort,
    latitude: resort.latitude || geocodedCoords.latitude,
    longitude: resort.longitude || geocodedCoords.longitude,
    map_image_url: officialTrailMapUrl || (!hasSkiresortHost(resort.map_image_url || '') ? resort.map_image_url : null)
  };
  const { lifts, runs } = extractLiftsAndRunsFromPages(crawl.pages);

  const mapUrls = crawl.pages
    .map((page) => {
      const base = extractResortData(page.$, page.url);
      return base.map_image_url;
    })
    .filter(Boolean);

  const nonSkiresortMapFromCrawl = mapUrls.find((url) => !hasSkiresortHost(url));
  const mapUrl = resolvedResort.map_image_url || nonSkiresortMapFromCrawl || null;
  const mapResult = await analyzeTrailMap(mapUrl, runs);

  const hintsByName = new Map(
    mapResult.runHints.map((hint) => [normalizeName(hint.name), hint])
  );

  let mergedRuns = runs.map((run) => {
    const hint = hintsByName.get(normalizeName(run.name));
    return {
      ...run,
      official_difficulty: run.official_difficulty || hint?.official_difficulty || 'blue'
    };
  });

  if (mergedRuns.length === 0 && mapResult.runHints.length > 0) {
    mergedRuns = mapResult.runHints
      .filter((hint) => isActualRunName(hint.name))
      .map((hint) => ({
        name: normalizeWhitespace(hint.name),
        official_difficulty: hint.official_difficulty || 'blue'
      }));
  }

  if (mergedRuns.length === 0) {
    const osmRuns = await fetchRunsFromOpenStreetMap({
      latitude: resolvedResort.latitude,
      longitude: resolvedResort.longitude
    });
    if (osmRuns.length > 0) {
      mergedRuns = osmRuns;
    }
  }

  mergedRuns = mergedRuns
    .filter((run) => isActualRunName(run.name))
    .map((run) => estimateRunMetrics(run, resolvedResort.vertical_drop));

  const dbResult = await upsertImportedData({
    resort: resolvedResort,
    lifts,
    runs: mergedRuns,
    userEmail
  });

  const warnings = [...crawl.warnings, ...mapResult.warnings];
  if (!resolvedResort.latitude || !resolvedResort.longitude) {
    warnings.push('Latitude/longitude could not be resolved from geocoding search.');
  }
  if (!resolvedResort.map_image_url) {
    warnings.push('Could not find an official non-skiresort trail-map URL on the resort website.');
  }

  return {
    source_url: validatedUrl,
    resort: dbResult.resort,
    scraped: {
      pages_visited: crawl.pages.length,
      lifts: lifts.length,
      runs: mergedRuns.length,
      map_assets_analyzed: mapResult.mapAssetsAnalyzed
    },
    database: dbResult.stats,
    warnings
  };
}
