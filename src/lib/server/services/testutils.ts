import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { user } from '../db/schema/auth-schema';
import { makeUUID } from './utils';

export function createTestAuth(db: BetterSQLite3Database) {
	return betterAuth({
		emailAndPassword: {
			enabled: true
		},
		// socialProviders: {
		// 	github: {
		// 		clientId: process.env.GITHUB_CLIENT_ID as string,
		// 		clientSecret: process.env.GITHUB_CLIENT_SECRET as string
		// 	}
		// },
		plugins: [sveltekitCookies(getRequestEvent)],
		database: drizzleAdapter(db, {
			provider: 'sqlite' // or "mysql", "sqlite"
		})
	});
}

export async function createTestUser(db: BetterSQLite3Database, email?: string, name?: string) {
	const id = makeUUID();
	await db
		.insert(user)
		.values({
			id,
			email: email || 'test@test.com',
			name: name || 'Test User'
		})
		.execute();

	return {
		id,
		email: 'test@test.com',
		name: 'Test User'
	};
}
