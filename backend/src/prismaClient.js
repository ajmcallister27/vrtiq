import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { appConfig } from './config/env.js';

const prismaClientOptions = {
	log: appConfig.isProduction ? ['error', 'warn'] : ['error', 'warn', 'query'],
};

if (appConfig.tursoDatabaseUrl && appConfig.tursoAuthToken) {
	const libsqlClient = createClient({
		url: appConfig.tursoDatabaseUrl,
		authToken: appConfig.tursoAuthToken,
	});

	prismaClientOptions.adapter = new PrismaLibSQL(libsqlClient);
}

const prisma = new PrismaClient(prismaClientOptions);

export default prisma;
