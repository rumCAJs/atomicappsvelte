import { Effect, Option, pipe } from 'effect';
import { DBService } from '$lib/server/services/db';
import { eq } from 'drizzle-orm';
import { type UserProfileSelect, type UserSelect } from '$lib/types/db';
import { UserNotFoundError } from '$lib/errors';
import { user } from '$lib/server/db/schema/auth-schema';
import { UUID } from '$lib/types';
import { userProfile } from '$lib/server/db/schema/app';
import { makeUUID } from '../utils';

function getUniquePinForNick(nick: string) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);

		const pinsData = yield* _(
			query((db) =>
				db
					.select({
						pin: userProfile.pin
					})
					.from(userProfile)
					.where(eq(userProfile.nick, nick))
					.all()
			)
		);

		const pins = pinsData.map((p) => p.pin);

		let pin = createPin();
		while (pins.includes(pin)) {
			pin = createPin();
		}
		return pin;
	});
}

export function exists(id: UUID) {
	return Effect.gen(function* (_) {
		const { db } = yield* _(DBService);
		const u = db.select().from(userProfile).where(eq(userProfile.publicId, id)).all();
		return u.length === 1;
	});
}

export function getByName(name: string) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		const userData = yield* _(
			query((db) => db.select().from(user).where(eq(user.name, name)).all()),
			Effect.flatMap((users) => {
				if (users.length === 0) {
					return Effect.fail(new UserNotFoundError());
				}
				return Effect.succeed(users);
			})
		);
		return userData[0]!;
	});
}

export function changeInfo(uid: UUID, { nick }: { nick: string }) {
	return Effect.gen(function* (_) {
		const { queryPromise } = yield* _(DBService);
		const userData = yield* _(getByPublicId(uid));
		const pin = yield* _(getUniquePinForNick(nick));
		yield* _(
			queryPromise((db) =>
				db
					.update(userProfile)
					.set({
						nick,
						pin
					})
					.where(eq(userProfile.id, userData.id))
					.execute()
			)
		);
		return yield* _(getByPublicId(uid));
	});
}

export function getByPublicId(uid: UserProfileSelect['publicId']) {
	return Effect.gen(function* () {
		const { query } = yield* DBService;
		const userData = yield* pipe(
			query((db) => db.select().from(userProfile).where(eq(userProfile.publicId, uid)).all()),
			Effect.flatMap((users) => {
				if (users.length === 0) {
					return Effect.fail(new UserNotFoundError());
				}
				return Effect.succeed(users);
			})
		);
		return userData[0]!;
	});
}

function createPin() {
	return Number(
		Math.round(Math.random() * 10000)
			.toString()
			.slice(0, 4)
	);
}

export function create(name: string, nick: string, userId: UserSelect['id']) {
	return Effect.gen(function* (_) {
		const { query, queryPromise } = yield* _(DBService);

		const pin = yield* _(getUniquePinForNick(nick));

		yield* _(
			queryPromise((db) =>
				db
					.insert(userProfile)
					.values({
						userId,
						name,
						publicId: makeUUID(),
						nick,
						pin
					})
					.execute()
			)
		);

		const profileData = yield* _(
			query((db) => db.select().from(userProfile).where(eq(userProfile.userId, userId)).all()!)
		);

		if (profileData && !!profileData[0]) {
			return Option.some(profileData[0]);
		}

		return Option.none();
	});
}
