import { appConfig } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ statusCode: 404, error: 'Not Found', message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  console.error('Unhandled request error', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    statusCode: err.statusCode || 500,
    error: err,
  });

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = appConfig.isProduction && statusCode >= 500
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');
  const error = err.error || (statusCode === 500 ? 'Internal Server Error' : 'Error');

  res.status(statusCode).json({ statusCode, error, message });
}
