import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';

export async function getSessionFromHeader(headers: Headers) {
	const session = await auth.api.getSession({
		headers
	});

	if (session) {
		return {
			user: session.user,
			session: session.session
		};
	}
	return {
		user: null,
		session: null
	};
}

const unauthenticatedRoutes = ['/login', '/register', '/', '/api'];

export type SessionFromHeader = Awaited<ReturnType<typeof getSessionFromHeader>>;
export const handle: Handle = async ({ event, resolve }) => {
	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});
	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}
	console.log('event.url.pathname', event.url.pathname);

	if (
		!unauthenticatedRoutes.some((route) => event.url.pathname.startsWith(route)) &&
		!session?.user
	) {
		return redirect(302, '/login');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
