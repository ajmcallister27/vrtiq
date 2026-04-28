import prisma from '../prismaClient.js';

const ENTITY_MAP = {
  Resort: {
    model: prisma.resort,
    requiredFields: ['name', 'location'],
    enums: {}
  },
  Run: {
    model: prisma.run,
    requiredFields: ['name', 'resort_id', 'official_difficulty'],
    enums: {
      official_difficulty: ['green', 'blue', 'black', 'double_black', 'terrain_park']
    }
  },
  Lift: {
    model: prisma.lift,
    requiredFields: ['resort_id', 'name'],
    enums: {
      status: ['open', 'closed', 'hold'],
      lift_type: ['chairlift', 'gondola', 'tram', 'magic_carpet', 't_bar', 'rope_tow', 'funicular', 'other']
    }
  },
  DifficultyRating: {
    model: prisma.difficultyRating,
    requiredFields: ['run_id', 'rating'],
    enums: {
      mode: ['ski', 'snowboard'],
      skill_level: ['beginner', 'intermediate', 'advanced', 'expert'],
      conditions: ['powder', 'groomed', 'packed', 'icy', 'spring', 'variable']
    }
  },
  ConditionNote: {
    model: prisma.conditionNote,
    requiredFields: ['note'],
    enums: {}
  },
  CrossResortComparison: {
    model: prisma.crossResortComparison,
    requiredFields: ['run1_id', 'run2_id', 'comparison_type'],
    enums: {
      comparison_type: ['easier', 'similar', 'harder']
    }
  },
  LiftWaitReport: {
    model: prisma.liftWaitReport,
    requiredFields: ['resort_id', 'lift_name', 'wait_minutes'],
    enums: {
      report_status: ['open', 'closed', 'hold'],
      powder_type: ['fresh_powder', 'packed_powder', 'wet_powder', 'wind_affected', 'crud', 'unknown']
    }
  },
  LiftStatusUpdate: {
    model: prisma.liftStatusUpdate,
    requiredFields: ['resort_id', 'lift_name', 'status'],
    enums: {
      status: ['open', 'closed', 'hold']
    }
  },
  User: {
    model: prisma.user,
    requiredFields: ['email', 'password', 'full_name'],
    enums: {
      role: ['user', 'admin']
    }
  }
};

function getEntityConfig(entityName) {
  // Accept case-insensitive entity names
  const key = Object.keys(ENTITY_MAP).find(k => k.toLowerCase() === entityName.toLowerCase());
  return key ? { name: key, ...ENTITY_MAP[key] } : null;
}

function parseJsonQuery(raw) {
  if (!raw) return undefined;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return undefined;
  }
}

function buildPrismaWhere(query) {
  if (!query || typeof query !== 'object') return {};

  const where = {};

  for (const key of Object.keys(query)) {
    const value = query[key];

    if (key === '$or' && Array.isArray(value)) {
      where.OR = value.map((sub) => buildPrismaWhere(sub));
      continue;
    }

    // Special handling for tags (stored as JSON string)
    if (key === 'tags') {
      const values = Array.isArray(value) ? value : [value];
      // Match tags by searching for the quoted term in the JSON string.
      where.OR = values.map((tag) => ({ tags: { contains: `"${tag}"` } }));
      continue;
    }

    // If value is an object with operator
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const operators = Object.keys(value);
      const prismaCondition = {};
      operators.forEach((op) => {
        const val = value[op];
        switch (op) {
          case '$in':
            prismaCondition.in = Array.isArray(val) ? val : [val];
            break;
          case '$gt':
            prismaCondition.gt = val;
            break;
          case '$gte':
            prismaCondition.gte = val;
            break;
          case '$lt':
            prismaCondition.lt = val;
            break;
          case '$lte':
            prismaCondition.lte = val;
            break;
          case '$contains':
            prismaCondition.contains = val;
            break;
          default:
            prismaCondition[op] = val;
        }
      });
      where[key] = prismaCondition;
      continue;
    }

    where[key] = value;
  }

  return where;
}

function parseSort(sortParam) {
  if (!sortParam) return undefined;

  const sortFields = (typeof sortParam === 'string' ? sortParam : '').split(',').map(s => s.trim()).filter(Boolean);
  if (sortFields.length === 0) return undefined;

  // Prisma expects an object or array of objects
  return sortFields.map((field) => {
    const direction = field.startsWith('-') ? 'desc' : 'asc';
    const key = field.replace(/^-/, '');
    return { [key]: direction };
  });
}

const LIFT_REPORT_DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const LIFT_STATUS_VERIFY_WINDOW_MS = 20 * 60 * 1000;
const ALLOWED_LIFT_CONDITIONS = ['powder', 'groomed', 'icy', 'thin cover', 'spring'];

function normalizeConditionList(value) {
  if (value === undefined || value === null) return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return raw
    .map((item) => String(item).trim().toLowerCase())
    .filter(Boolean);
}

function normalizeNullableStringField(data, field) {
  if (!(field in data)) {
    return;
  }

  const raw = data[field];
  if (raw === undefined || raw === null) {
    delete data[field];
    return;
  }

  const normalized = String(raw).trim();
  if (!normalized) {
    delete data[field];
    return;
  }

  data[field] = normalized;
}

export async function listEntities(req, res, next) {
  const config = getEntityConfig(req.params.entity);
  if (!config) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Unknown entity '${req.params.entity}'` });
  }

  const queryObj = parseJsonQuery(req.query._query);
  const where = buildPrismaWhere(queryObj);

  const orderBy = parseSort(req.query._sort);

  const take = req.query._limit ? parseInt(req.query._limit, 10) : undefined;
  const skip = req.query._skip ? parseInt(req.query._skip, 10) : undefined;

  const results = await config.model.findMany({
    where,
    orderBy,
    take: Number.isFinite(take) ? take : undefined,
    skip: Number.isFinite(skip) ? skip : undefined,
  });

  const normalized = results.map((item) => {
    const record = { ...item };
    if (typeof record.tags === 'string') {
      try {
        record.tags = JSON.parse(record.tags);
      } catch {
        record.tags = [];
      }
    }
    return record;
  });

  res.json(normalized);
}

export async function getEntityById(req, res, next) {
  const config = getEntityConfig(req.params.entity);
  if (!config) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Unknown entity '${req.params.entity}'` });
  }

  const id = req.params.id;
  const record = await config.model.findUnique({ where: { id } });
  if (!record) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Entity ${config.name} with ID '${id}' not found.` });
  }

  const normalized = { ...record };
  if (typeof normalized.tags === 'string') {
    try {
      normalized.tags = JSON.parse(normalized.tags);
    } catch {
      normalized.tags = [];
    }
  }

  res.json(normalized);
}

function validateEntityPayload(config, data, isUpdate = false) {
  if (!config) return;
  const errors = [];

  if (!isUpdate) {
    for (const field of config.requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`'${field}' is required`);
      }
    }
  }

  // Validate enums
  for (const [field, options] of Object.entries(config.enums || {})) {
    if (data[field] !== undefined && data[field] !== null) {
      if (!options.includes(data[field])) {
        errors.push(`'${field}' must be one of: ${options.join(', ')}`);
      }
    }
  }

  // Rating-specific constraints
  if (config.name === 'DifficultyRating' && data.rating !== undefined) {
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      errors.push("'rating' must be an integer between 1 and 10");
    }
  }

  if (config.name === 'LiftWaitReport' && data.wait_minutes !== undefined) {
    const waitMinutes = Number(data.wait_minutes);
    if (!Number.isInteger(waitMinutes) || waitMinutes < 0 || waitMinutes > 240) {
      errors.push("'wait_minutes' must be an integer between 0 and 240");
    }
  }

  if (config.name === 'LiftWaitReport') {
    if (data.day_of_week !== undefined) {
      const dayOfWeek = Number(data.day_of_week);
      if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        errors.push("'day_of_week' must be an integer between 0 and 6");
      }
    }
    if (data.hour_of_day !== undefined) {
      const hourOfDay = Number(data.hour_of_day);
      if (!Number.isInteger(hourOfDay) || hourOfDay < 0 || hourOfDay > 23) {
        errors.push("'hour_of_day' must be an integer between 0 and 23");
      }
    }

    if (data.conditions !== undefined && data.conditions !== null && data.conditions !== '') {
      const normalizedConditions = normalizeConditionList(data.conditions);
      const invalid = normalizedConditions.filter((condition) => !ALLOWED_LIFT_CONDITIONS.includes(condition));
      if (invalid.length > 0) {
        errors.push(`'conditions' contains unsupported values: ${invalid.join(', ')}`);
      }
    }
  }

  if ((config.name === 'ConditionNote' || config.name === 'LiftWaitReport' || config.name === 'LiftStatusUpdate') && !data.run_id && !data.lift_id && !data.lift_name) {
    errors.push("Either 'run_id' or 'lift_id' is required");
  }

  if ((config.name === 'LiftWaitReport' || config.name === 'LiftStatusUpdate') && !data.lift_id && !data.lift_name) {
    errors.push("Either 'lift_id' or 'lift_name' is required");
  }

  if (config.name === 'Lift') {
    if (data.seat_count !== undefined && data.seat_count !== null && data.seat_count !== '') {
      const seatCount = Number(data.seat_count);
      if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 12) {
        errors.push("'seat_count' must be an integer between 1 and 12");
      }
    }

    if (data.vertical_rise_ft !== undefined && data.vertical_rise_ft !== null && data.vertical_rise_ft !== '') {
      const verticalRise = Number(data.vertical_rise_ft);
      if (!Number.isInteger(verticalRise) || verticalRise < 0) {
        errors.push("'vertical_rise_ft' must be a positive integer");
      }
    }

    if (data.ride_minutes_avg !== undefined && data.ride_minutes_avg !== null && data.ride_minutes_avg !== '') {
      const rideMinutes = Number(data.ride_minutes_avg);
      if (!Number.isFinite(rideMinutes) || rideMinutes <= 0 || rideMinutes > 120) {
        errors.push("'ride_minutes_avg' must be a number between 0 and 120");
      }
    }
  }

  return errors;
}

export async function createEntity(req, res, next) {
  const config = getEntityConfig(req.params.entity);
  if (!config) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Unknown entity '${req.params.entity}'` });
  }

  const data = { ...req.body }; // shallow copy
  // Prevent clients from setting system fields
  delete data.id;
  delete data.created_date;
  delete data.updated_date;
  delete data.created_by;

  // Serialize tags array to JSON string (SQLite does not support primitive arrays)
  if (data.tags && Array.isArray(data.tags)) {
    data.tags = JSON.stringify(data.tags);
  }

  if (config.name === 'Run') {
    normalizeNullableStringField(data, 'name');
    normalizeNullableStringField(data, 'resort_id');
    normalizeNullableStringField(data, 'lift_id');
    normalizeNullableStringField(data, 'lift');
  }

  if (config.name === 'LiftWaitReport' || config.name === 'LiftStatusUpdate') {
    if (data.run_id && (!data.resort_id || !data.lift_name)) {
      const run = await prisma.run.findUnique({ where: { id: data.run_id } });
      if (run) {
        if (!data.resort_id) {
          data.resort_id = run.resort_id;
        }
        if (!data.lift_id && run.lift_id) {
          data.lift_id = run.lift_id;
        }
        if (!data.lift_name && run.lift) {
          data.lift_name = run.lift;
        }
      }
    }
  }

  if (config.name === 'ConditionNote') {
    if (data.date_observed !== undefined && data.date_observed !== null && data.date_observed !== '') {
      // keep date parsing below
    }
  }

  if (config.name === 'ConditionNote' && data.run_id && !data.lift_id) {
    const run = await prisma.run.findUnique({ where: { id: data.run_id } });
    if (run?.lift_id) {
      data.lift_id = run.lift_id;
    }
  }

  if (config.name === 'ConditionNote' && !data.run_id && data.lift_id) {
    // Compatibility path for deployments where Prisma client still expects a required run relation.
    const linkedRun = await prisma.run.findFirst({
      where: { lift_id: data.lift_id },
      orderBy: { updated_date: 'desc' }
    });
    if (linkedRun?.id) {
      data.run_id = linkedRun.id;
    }
  }

  if ((config.name === 'Run' || config.name === 'LiftWaitReport' || config.name === 'LiftStatusUpdate') && data.lift_id && !data.lift_name) {
    const lift = await prisma.lift.findUnique({ where: { id: data.lift_id } });
    if (lift) {
      data.lift_name = lift.name;
      if (!data.resort_id) {
        data.resort_id = lift.resort_id;
      }
    }
  }

  if (config.name === 'Run' && data.lift_id) {
    const lift = await prisma.lift.findUnique({ where: { id: data.lift_id } });
    if (!lift) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Selected lift does not exist.' });
    }
    if (data.resort_id && lift.resort_id !== data.resort_id) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Selected lift is not part of the selected resort.' });
    }
    data.lift = lift.name;
    data.resort_id = lift.resort_id;
  }

  if (config.name === 'Run' && data.resort_id) {
    const resort = await prisma.resort.findUnique({ where: { id: data.resort_id } });
    if (!resort) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Selected resort does not exist.' });
    }
  }

  if (config.name === 'Lift') {
    data.status = data.status || 'open';
    if (data.seat_count !== undefined && data.seat_count !== null && data.seat_count !== '') {
      data.seat_count = Number(data.seat_count);
    }
    if (data.vertical_rise_ft !== undefined && data.vertical_rise_ft !== null && data.vertical_rise_ft !== '') {
      data.vertical_rise_ft = Number(data.vertical_rise_ft);
    }
    if (data.ride_minutes_avg !== undefined && data.ride_minutes_avg !== null && data.ride_minutes_avg !== '') {
      data.ride_minutes_avg = Number(data.ride_minutes_avg);
    }
    if (data.lift_type && !data.type) {
      data.type = data.lift_type;
    }
  }

  if (config.name === 'LiftWaitReport') {
    data.wait_minutes = Number(data.wait_minutes);
    data.report_status = data.report_status || 'open';
    if (data.conditions !== undefined && data.conditions !== null && data.conditions !== '') {
      const normalizedConditions = normalizeConditionList(data.conditions)
        .filter((condition) => ALLOWED_LIFT_CONDITIONS.includes(condition));
      data.conditions = normalizedConditions.join(', ');
    }
    const now = new Date();
    if (data.day_of_week === undefined) {
      data.day_of_week = now.getUTCDay();
    }
    if (data.hour_of_day === undefined) {
      data.hour_of_day = now.getUTCHours();
    }
  }

  const errors = validateEntityPayload(config, data, false);
  if (errors.length) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: errors.join('; ') });
  }

  // Enforce one rating per user per run per day
  if (config.name === 'DifficultyRating') {
    data.mode = data.mode === 'snowboard' ? 'snowboard' : 'ski';

    const userEmail = req.user?.email;
    const runId = data.run_id;
    const ratingMode = data.mode;
    if (userEmail && runId) {
      const today = new Date();
      const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

      const existing = await prisma.difficultyRating.findFirst({
        where: {
          run_id: runId,
          mode: ratingMode,
          created_by: userEmail,
          created_date: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });
      if (existing) {
        return res.status(403).json({ statusCode: 403, error: 'Forbidden', message: 'You have already rated this run today.' });
      }
    }
  }

  // Attach created_by (override any provided value)
  data.created_by = req.user?.email || 'anonymous@local';

  if (config.name === 'LiftWaitReport') {
    if (data.idempotency_key) {
      const existingByKey = await prisma.liftWaitReport.findFirst({
        where: {
          created_by: data.created_by,
          idempotency_key: data.idempotency_key
        }
      });
      if (existingByKey) {
        return res.status(200).json(existingByKey);
      }
    }

    const dedupeWindowStart = new Date(Date.now() - LIFT_REPORT_DEDUPE_WINDOW_MS);
    const recentReport = await prisma.liftWaitReport.findFirst({
      where: {
        created_by: data.created_by,
        resort_id: data.resort_id,
        ...(data.lift_id ? { lift_id: data.lift_id } : { lift_name: data.lift_name }),
        created_date: { gte: dedupeWindowStart }
      },
      orderBy: { created_date: 'desc' }
    });

    if (recentReport) {
      return res.status(429).json({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'You can report this lift again in about 5 minutes.'
      });
    }
  }

  // Convert date strings for date_observed
  if (data.date_observed && typeof data.date_observed === 'string') {
    data.date_observed = new Date(data.date_observed);
  }

  if (data.expected_reopen_at && typeof data.expected_reopen_at === 'string') {
    data.expected_reopen_at = new Date(data.expected_reopen_at);
  }

  let created;

  try {
    if (config.name === 'ConditionNote') {
      if (!data.run_id && data.lift_id) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: 'This lift is not linked to a run yet. Link at least one run to this lift, then report conditions again.'
        });
      }

      const conditionData = { ...data };
      if (data.run_id) {
        conditionData.run = { connect: { id: data.run_id } };
      }
      if (data.lift_id) {
        conditionData.lift = { connect: { id: data.lift_id } };
      }
      if (data.created_by) {
        conditionData.user = { connect: { email: data.created_by } };
      }
      delete conditionData.run_id;
      delete conditionData.lift_id;
      delete conditionData.created_by;

      created = await prisma.conditionNote.create({ data: conditionData });
    } else {
      created = await config.model.create({ data });
    }
  } catch (error) {
    if (error?.code === 'P2003') {
      return res.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: 'One or more referenced records do not exist. Refresh and try again.'
      });
    }
    throw error;
  }

  if (config.name === 'LiftWaitReport') {
    const statusValue = created.report_status;
    if (['open', 'closed', 'hold'].includes(statusValue)) {
      const verifyWindowStart = new Date(Date.now() - LIFT_STATUS_VERIFY_WINDOW_MS);
      const matchingRecent = await prisma.liftStatusUpdate.findFirst({
        where: {
          resort_id: created.resort_id,
          ...(created.lift_id ? { lift_id: created.lift_id } : { lift_name: created.lift_name }),
          lift_name: created.lift_name,
          status: statusValue,
          created_date: { gte: verifyWindowStart },
          created_by: { not: created.created_by }
        },
        orderBy: { created_date: 'desc' }
      });

      if (matchingRecent) {
        await prisma.liftStatusUpdate.update({
          where: { id: matchingRecent.id },
          data: {
            confirmation_count: matchingRecent.confirmation_count + 1,
            verified: true,
            verified_at: new Date()
          }
        });
      } else {
        await prisma.liftStatusUpdate.create({
          data: {
            created_by: created.created_by,
            resort_id: created.resort_id,
            run_id: created.run_id || null,
            lift_id: created.lift_id || null,
            lift_name: created.lift_name,
            status: statusValue,
            confirmation_count: 1,
            verified: false
          }
        });
      }
    }
  }

  res.status(201).json(created);
}

export async function updateEntity(req, res, next) {
  const config = getEntityConfig(req.params.entity);
  if (!config) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Unknown entity '${req.params.entity}'` });
  }

  const id = req.params.id;
  const record = await config.model.findUnique({ where: { id } });
  if (!record) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Entity ${config.name} with ID '${id}' not found.` });
  }

  const data = { ...req.body };
  // Prevent clients from overwriting system fields
  delete data.id;
  delete data.created_date;
  delete data.updated_date;
  delete data.created_by;

  // Serialize tags array to JSON string (SQLite does not support primitive arrays)
  if (data.tags && Array.isArray(data.tags)) {
    data.tags = JSON.stringify(data.tags);
  }

  const errors = validateEntityPayload(config, data, true);
  if (errors.length) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: errors.join('; ') });
  }

  const updated = await config.model.update({ where: { id }, data });

  const normalized = { ...updated };
  if (typeof normalized.tags === 'string') {
    try {
      normalized.tags = JSON.parse(normalized.tags);
    } catch {
      normalized.tags = [];
    }
  }

  res.json(normalized);
}

export async function deleteEntity(req, res, next) {
  const config = getEntityConfig(req.params.entity);
  if (!config) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Unknown entity '${req.params.entity}'` });
  }

  const id = req.params.id;
  const record = await config.model.findUnique({ where: { id } });
  if (!record) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Entity ${config.name} with ID '${id}' not found.` });
  }

  await config.model.delete({ where: { id } });
  res.json({ message: 'Entity deleted successfully' });
}
