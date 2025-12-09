import { z } from 'zod/v4';
import { command, getRequestEvent } from '$app/server';
import { authCommand, type UserAuthCommand } from './utils';
import { UserService, userServiceProvider } from '$lib/server/services/user';
import { Effect } from 'effect';
import { dbService } from '$lib/server/db';

const schema = z.object({
	nick: z.string().min(5).max(50)
});

function getProgram({ user, body }: { user: UserAuthCommand; body: z.infer<typeof schema> }) {
	return Effect.gen(function* () {
		const userS = yield* UserService;
		const profile = yield* userS.getByUserId(user.id);
		yield* userS.changeInfo(profile.publicId, { nick: body.nick });
		const u = yield* userS.getByPublicId(profile.publicId);
		return {
			success: true,
			nick: u.nick,
			pin: u.pin
		};
	});
}

export const addLike = command(schema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getProgram({ user, body: data }).pipe(userServiceProvider, dbService.dbServiceProvider)
	);

	return ret;
});
