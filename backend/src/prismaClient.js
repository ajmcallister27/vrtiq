import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { appConfig } from './config/env.js';

const prismaClientOptions = {
	log: appConfig.isProduction ? ['error', 'warn'] : ['error', 'warn', 'query'],
};

if (appConfig.tursoDatabaseUrl && appConfig.tursoAuthToken) {
	prismaClientOptions.adapter = new PrismaLibSQL({
		url: appConfig.tursoDatabaseUrl,
		authToken: appConfig.tursoAuthToken,
	});
}

const prisma = new PrismaClient(prismaClientOptions);

export default prisma;
