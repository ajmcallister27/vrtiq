import prisma from '../prismaClient.js';
import { verifyToken } from '../utils/jwt.js';

const DEFAULT_USER = {
  id: null,
  email: 'anonymous@local',
  full_name: 'Anonymous',
  role: 'user',
  isAnonymous: true
};

export async function attachUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = DEFAULT_USER;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    if (!payload?.email) {
      req.user = DEFAULT_USER;
      return next();
    }

    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      req.user = DEFAULT_USER;
      return next();
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      isAnonymous: false
    };
    next();
  } catch (err) {
    // If token is invalid, treat as anonymous
    req.user = DEFAULT_USER;
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user || req.user.isAnonymous) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.isAnonymous) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ statusCode: 403, error: 'Forbidden', message: 'Admin access required' });
  }
  next();
}
