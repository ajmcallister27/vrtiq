import rateLimit from 'express-rate-limit';
import { appConfig } from '../config/env.js';

function jsonRateLimitHandler(message) {
  return (req, res) => {
    res.status(429).json({
      statusCode: 429,
      error: 'Too Many Requests',
      message,
    });
  };
}

const baseRateLimitConfig = {
  windowMs: appConfig.rateLimitWindowMs,
  standardHeaders: true,
  legacyHeaders: false,
};

export const authRateLimiter = rateLimit({
  ...baseRateLimitConfig,
  max: appConfig.rateLimitAuthMax,
  handler: jsonRateLimitHandler('Too many authentication requests. Please try again later.'),
});

export const mutationRateLimiter = rateLimit({
  ...baseRateLimitConfig,
  max: appConfig.rateLimitMutationMax,
  skip: (req) => !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method),
  handler: jsonRateLimitHandler('Too many write requests. Please slow down and retry shortly.'),
});
