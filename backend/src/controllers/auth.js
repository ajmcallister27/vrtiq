import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';
import { signToken } from '../utils/jwt.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const token = signToken({ email: user.email, role: user.role });
  res.json({ token, user: {
    id: user.id,
    created_date: user.created_date,
    updated_date: user.updated_date,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  }});
}

export async function signup(req, res) {
  const { email, password, full_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Email and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      full_name: full_name || email,
      role: 'user',
      password: hashedPassword
    }
  });

  const token = signToken({ email: user.email, role: user.role });
  res.json({ token, user: {
    id: user.id,
    created_date: user.created_date,
    updated_date: user.updated_date,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  }});
}

export async function me(req, res) {
  if (!req.user || req.user.isAnonymous) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Authentication required' });
  }
  const user = await prisma.user.findUnique({ where: { email: req.user.email } });
  if (!user) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'User not found' });
  }
  res.json({
    id: user.id,
    created_date: user.created_date,
    updated_date: user.updated_date,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  });
}

export async function updateMe(req, res) {
  if (!req.user || req.user.isAnonymous) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Authentication required' });
  }

  const updates = {};
  const { role, full_name, password } = req.body;

  if (full_name) {
    updates.full_name = full_name;
  }

  if (password) {
    updates.password = await bcrypt.hash(password, 10);
  }

  // Role can only be updated by admins
  if (role) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ statusCode: 403, error: 'Forbidden', message: 'Only admins can update roles' });
    }
    updates.role = role;
  }

  const updatedUser = await prisma.user.update({
    where: { email: req.user.email },
    data: updates
  });

  res.json({
    id: updatedUser.id,
    created_date: updatedUser.created_date,
    updated_date: updatedUser.updated_date,
    full_name: updatedUser.full_name,
    email: updatedUser.email,
    role: updatedUser.role
  });
}

export async function inviteUser(req, res) {
  if (!req.user || req.user.isAnonymous) {
    return res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ statusCode: 403, error: 'Forbidden', message: 'Only admins can invite users' });
  }

  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Email is required' });
  }
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Invalid role' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'User already exists' });
  }

  const randomPassword = Math.random().toString(36).slice(2, 10);
  const hashed = await bcrypt.hash(randomPassword, 10);

  await prisma.user.create({
    data: {
      email,
      full_name: email,
      role: role || 'user',
      password: hashed
    }
  });

  // TODO: send invitation email using integrations
  res.json({ message: 'Invitation sent successfully' });
}

export async function logout(req, res) {
  // For JWT, logout is client-side. We'll just return success.
  res.json({ message: 'Logged out successfully' });
}
