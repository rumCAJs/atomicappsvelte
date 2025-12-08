import { Effect } from 'effect';
import { DBService } from '$lib/server/services/db';
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { UserService } from '../user';
import { UUID } from '$lib/types';
import { FriendError } from '$lib/errors';
import { userFriend, userProfile } from '$lib/server/db/schema/app';

export function getFriends(userId: UUID, state: 'accepted' | 'requested' | 'all' = 'accepted') {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		const { getByPublicId } = yield* UserService;

		const userData = yield* getByPublicId(userId);

		const userFriends = yield* _(
			query((db) =>
				db
					.select({
						nick: userProfile.nick,
						pin: userProfile.pin,
						publicId: userProfile.publicId,
						acceptedAt: userFriend.acceptedAt
					})
					.from(userFriend)
					.innerJoin(userProfile, eq(userFriend.userTo, userProfile.id))
					.where(
						and(
							eq(userFriend.userFrom, userData.id),
							state === 'all'
								? undefined
								: state === 'accepted'
									? isNotNull(userFriend.acceptedAt)
									: isNull(userFriend.acceptedAt)
						)
					)
					.all()
			)
		);

		return userFriends;
	});
}

export function requestFriend(userId: UUID, friendId: UUID) {
	return Effect.gen(function* (_) {
		const { query, queryPromise } = yield* _(DBService);
		const { getByPublicId } = yield* UserService;

		const userData = yield* getByPublicId(userId);
		const friendData = yield* getByPublicId(friendId);

		const currentFriends = yield* getFriends(userId, 'all');
		const existingRequest = currentFriends.find((r) => r.publicId === friendId);
		if (existingRequest) {
			return {
				state: 'ok',
				message: 'already ' + (existingRequest.acceptedAt ? 'friends' : 'requested')
			};
		}

		const counterRequest = yield* Effect.match(
			query((db) =>
				db
					.select()
					.from(userFriend)
					.where(and(eq(userFriend.userFrom, friendData.id), eq(userFriend.userTo, userData.id)))
					.all()
			),
			{
				onSuccess: (d) => d[0],
				onFailure: () => undefined
			}
		);

		if (counterRequest) {
			yield* queryPromise((db) =>
				db
					.update(userFriend)
					.set({
						acceptedAt: sql`CURRENT_TIMESTAMP`,
						rejectedAt: sql`NULL`
					})
					.where(and(eq(userFriend.userFrom, friendData.id), eq(userFriend.userTo, userData.id)))
					.execute()
			);
		} else {
			yield* queryPromise((db) =>
				db
					.insert(userFriend)
					.values({
						userFrom: friendData.id,
						userTo: userData.id,
						acceptedAt: sql`CURRENT_TIMESTAMP`,
						rejectedAt: sql`NULL`
					})
					.execute()
			);
		}

		yield* _(
			queryPromise((db) =>
				db
					.insert(userFriend)
					.values({
						userFrom: userData.id,
						userTo: friendData.id
					})
					.returning()
					.execute()
			)
		);

		return {
			state: 'ok',
			message: 'friend request send'
		};
	});
}

export function proccessRequest(userId: UUID, friendId: UUID, action: 'accept' | 'reject') {
	return Effect.gen(function* (_) {
		const { queryPromise } = yield* _(DBService);
		const { getByPublicId } = yield* UserService;

		const userData = yield* getByPublicId(userId);
		const friendData = yield* getByPublicId(friendId);

		const requests = yield* getFriends(userId, 'requested');
		const request = requests.find((r) => r.publicId === friendId);
		if (!request) {
			yield* Effect.fail(new FriendError('friend request not found'));
		}

		const ret = yield* queryPromise((db) =>
			db
				.update(userFriend)
				.set({
					acceptedAt: action === 'accept' ? sql`CURRENT_TIMESTAMP` : sql`NULL`,
					rejectedAt: action === 'reject' ? sql`CURRENT_TIMESTAMP` : sql`NULL`
				})
				.where(and(eq(userFriend.userFrom, userData.id), eq(userFriend.userTo, friendData.id)))
				.returning()
				.execute()
		);

		return {
			status: 'ok',
			rejected: ret[0].rejectedAt !== null,
			accepted: ret[0].acceptedAt !== null
		};
	});
}
