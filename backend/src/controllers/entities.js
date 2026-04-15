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
    requiredFields: ['run_id', 'note'],
    enums: {}
  },
  CrossResortComparison: {
    model: prisma.crossResortComparison,
    requiredFields: ['run1_id', 'run2_id', 'comparison_type'],
    enums: {
      comparison_type: ['easier', 'similar', 'harder']
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

  // Convert date strings for date_observed
  if (data.date_observed && typeof data.date_observed === 'string') {
    data.date_observed = new Date(data.date_observed);
  }

  const created = await config.model.create({ data });
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
