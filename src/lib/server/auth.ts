import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/server/db';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';

export const auth = betterAuth({
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
