import { auth } from '$lib/server/auth';

export async function authCommand(headers: Headers) {
	const session = await auth.api.getSession({
		headers
	});

	if (session) {
		return session.user;
	}

	return null;
}

export type UserAuthCommand = NonNullable<Awaited<ReturnType<typeof authCommand>>>;
