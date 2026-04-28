import jwt from 'jsonwebtoken';
import { appConfig } from '../config/env.js';

export function signToken(payload) {
  if (!appConfig.jwtSecret) {
    throw new Error('JWT_SECRET must be configured before issuing tokens');
  }

  return jwt.sign(payload, appConfig.jwtSecret);
}

export function verifyToken(token) {
  if (!token) throw new Error('No token provided');
  if (!appConfig.jwtSecret) {
    throw new Error('JWT_SECRET must be configured before verifying tokens');
  }

  return jwt.verify(token, appConfig.jwtSecret);
}
