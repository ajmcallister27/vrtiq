import path from 'path';
import dotenv from 'dotenv';
import { bool, cleanEnv, num, port, str } from 'envalid';

dotenv.config();

function normalizeSqliteDatabaseUrl(rawDatabaseUrl) {
  const input = String(rawDatabaseUrl || '').trim();
  if (!input) {
    return 'file:./dev.db';
  }

  if (input.startsWith('file:')) {
    const remainder = input.slice(5);
    if (remainder.startsWith('/')) {
      return `file:${remainder}`;
    }
    if (remainder.startsWith('./') || remainder.startsWith('../')) {
      return input;
    }
    return `file:./${remainder}`;
  }

  if (path.isAbsolute(input)) {
    return `file:${input.replace(/\\/g, '/')}`;
  }

  return `file:./${input}`;
}

function parseOriginAllowList(rawOrigins) {
  return rawOrigins
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

const validatedEnv = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3000 }),
  DATABASE_URL: str({ default: 'file:./dev.db' }),
  JWT_SECRET: str({ default: '' }),
  JWT_EXPIRES_IN: str({ default: '7d' }),
  CORS_ALLOWED_ORIGINS: str({ default: '' }),
  BODY_JSON_LIMIT: str({ default: '1mb' }),
  BODY_URLENCODED_LIMIT: str({ default: '100kb' }),
  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }),
  RATE_LIMIT_AUTH_MAX: num({ default: 20 }),
  RATE_LIMIT_MUTATION_MAX: num({ default: 120 }),
  REQUIRE_AUTH: bool({ default: false }),
  APP_ID: str({ default: 'vrtIQ' }),
  APP_NAME: str({ default: 'vrtIQ' }),
  LOG_LEVEL: str({ choices: ['debug', 'info', 'warn', 'error'], default: 'info' }),
  STORAGE_LIMIT_GB: num({ default: 200 }),
  BACKUP_RETENTION_DAYS: num({ default: 14 }),
  LOG_RETENTION_DAYS: num({ default: 14 }),
});

const isProduction = validatedEnv.NODE_ENV === 'production';
const parsedCorsOrigins = parseOriginAllowList(validatedEnv.CORS_ALLOWED_ORIGINS);
const corsAllowedOrigins = parsedCorsOrigins.length > 0
  ? parsedCorsOrigins
  : (isProduction ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']);

const jwtSecret = validatedEnv.JWT_SECRET || (isProduction ? '' : 'dev-insecure-jwt-secret-change-me');
const normalizedDatabaseUrl = normalizeSqliteDatabaseUrl(validatedEnv.DATABASE_URL);

if (isProduction && !validatedEnv.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}

if (!isProduction && !validatedEnv.JWT_SECRET) {
  console.warn('JWT_SECRET is not set; using development-only fallback secret.');
}

if (isProduction && corsAllowedOrigins.length === 0) {
  throw new Error('CORS_ALLOWED_ORIGINS must be set when NODE_ENV=production');
}

if (corsAllowedOrigins.includes('*')) {
  throw new Error('CORS_ALLOWED_ORIGINS cannot contain wildcard "*". Use explicit origins.');
}

process.env.DATABASE_URL = normalizedDatabaseUrl;

export const appConfig = {
  nodeEnv: validatedEnv.NODE_ENV,
  isProduction,
  port: validatedEnv.PORT,
  databaseUrl: normalizedDatabaseUrl,
  jwtSecret,
  jwtExpiresIn: validatedEnv.JWT_EXPIRES_IN,
  corsAllowedOrigins,
  bodyJsonLimit: validatedEnv.BODY_JSON_LIMIT,
  bodyUrlEncodedLimit: validatedEnv.BODY_URLENCODED_LIMIT,
  rateLimitWindowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
  rateLimitAuthMax: validatedEnv.RATE_LIMIT_AUTH_MAX,
  rateLimitMutationMax: validatedEnv.RATE_LIMIT_MUTATION_MAX,
  requireAuth: validatedEnv.REQUIRE_AUTH,
  appId: validatedEnv.APP_ID,
  appName: validatedEnv.APP_NAME,
  logLevel: validatedEnv.LOG_LEVEL,
  storageLimitGb: validatedEnv.STORAGE_LIMIT_GB,
  backupRetentionDays: validatedEnv.BACKUP_RETENTION_DAYS,
  logRetentionDays: validatedEnv.LOG_RETENTION_DAYS,
};
