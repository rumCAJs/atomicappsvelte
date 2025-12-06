import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as appSchema from './schema/app';
import * as authSchema from './schema/auth-schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(env.DATABASE_URL);

export const db = drizzle(client, { schema: { ...appSchema, ...authSchema } });

export interface DbDep {
	readonly db: typeof db;
}

export function createDbDep(databaseUrl: string): DbDep {
	const client = new Database(databaseUrl);
	const db = drizzle(client, { schema: { ...appSchema, ...authSchema } });
	return {
		db
	};
}
