import { PrismaClient } from '@prisma/client';
import { appConfig } from './config/env.js';

const prisma = new PrismaClient({
	log: appConfig.isProduction ? ['error', 'warn'] : ['error', 'warn', 'query'],
});

export default prisma;
