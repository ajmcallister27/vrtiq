import prisma from '../prismaClient.js';

function normalizeEntityType(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'resort') return 'Resort';
  if (value === 'run') return 'Run';
  return null;
}

export async function createEditRequest(req, res) {
  const { entity_type, entity_id, suggestion, submitter_name, submitter_email } = req.body || {};

  const userConnect = req.user && !req.user.isAnonymous
    ? { user: { connect: { email: req.user.email } } }
    : {};

  const normalizedType = normalizeEntityType(entity_type);
  if (!normalizedType) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: "entity_type must be 'resort' or 'run'" });
  }

  const targetId = String(entity_id || '').trim();
  if (!targetId) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'entity_id is required' });
  }

  const suggestionText = String(suggestion || '').trim();
  if (!suggestionText) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'suggestion is required' });
  }

  // Ensure the referenced entity exists and connect by foreign key
  if (normalizedType === 'Resort') {
    const exists = await prisma.resort.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!exists) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Resort not found for entity_id' });
    }

    const record = await prisma.pendingEditRequest.create({
      data: {
        entity_type: normalizedType,
        resort: { connect: { id: targetId } },
        suggestion: suggestionText,
        submitter_name: submitter_name ? String(submitter_name).trim() : null,
        submitter_email: submitter_email ? String(submitter_email).trim() : null,
        ...userConnect,
      },
      include: { resort: true, run: true },
    });

    return res.json(record);
  }

  if (normalizedType === 'Run') {
    const exists = await prisma.run.findUnique({ where: { id: targetId }, select: { id: true, resort_id: true } });
    if (!exists) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Run not found for entity_id' });
    }

    const record = await prisma.pendingEditRequest.create({
      data: {
        entity_type: normalizedType,
        run: { connect: { id: targetId } },
        suggestion: suggestionText,
        submitter_name: submitter_name ? String(submitter_name).trim() : null,
        submitter_email: submitter_email ? String(submitter_email).trim() : null,
        ...userConnect,
      },
      include: { resort: true, run: true },
    });

    return res.json(record);
  }

  return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Unsupported entity_type' });
}

export async function listPendingEditRequests(req, res) {
  const records = await prisma.pendingEditRequest.findMany({
    where: { status: 'pending' },
    orderBy: { created_date: 'desc' },
    include: {
      resort: true,
      run: { include: { resort: true } },
      user: true,
    },
  });

  res.json(records);
}

export async function deleteEditRequest(req, res) {
  const id = String(req.params.id || '').trim();
  if (!id) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'id is required' });
  }

  const existing = await prisma.pendingEditRequest.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return res.status(404).json({ statusCode: 404, error: 'Not Found', message: 'Edit request not found' });
  }

  await prisma.pendingEditRequest.delete({ where: { id } });
  res.json({ message: 'Edit request deleted' });
}
