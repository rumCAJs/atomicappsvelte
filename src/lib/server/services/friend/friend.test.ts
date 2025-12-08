import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Effect, Option } from 'effect';
import { FriendService, friendServiceProvider } from '.';
import { DBService, createDBService } from '../db';
import { unlinkSync } from 'node:fs';
import { UserService, userServiceProvider } from '../user';
import { beforeEach } from 'node:test';
import { userFriend } from '$lib/server/db/schema/app';

const dbName = 'friendtest.db';
try {
	unlinkSync(dbName);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
	//console.error(e);
}

const { dbService } = createDBService(dbName, true, './drizzle');
const dbServiceProvider = Effect.provideService(DBService, dbService);

let user1Id: string = '';
let user2Id: string = '';

describe('Friends service', () => {
	beforeAll(async () => {
		await Effect.runPromise(
			Effect.gen(function* () {
				const { create } = yield* UserService;
				const u1 = yield* create('a', 'a', 'a');
				user1Id = Option.match(u1, {
					onNone: () => '',
					onSome: (u) => u.publicId
				});

				const u2 = yield* create('b', 'b', 'b');
				user2Id = Option.match(u2, {
					onNone: () => '',
					onSome: (u) => u.publicId
				});
			}).pipe(userServiceProvider, dbServiceProvider)
		);
	});
	afterAll(async () => {
		unlinkSync(dbName);
	});

	beforeEach(async () => {
		await Effect.runPromise(
			Effect.gen(function* () {
				const { queryPromise } = yield* DBService;
				yield* queryPromise((db) => db.delete(userFriend).execute());
			}).pipe(userServiceProvider, dbServiceProvider)
		);
	});

	it('should have 0 friends at begining', async () => {
		const a = await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getFriends } = yield* _(FriendService);
				const p = yield* _(getFriends(user1Id));
				return p;
			}).pipe(friendServiceProvider, dbServiceProvider, userServiceProvider)
		);
		expect(a).toBeTruthy();
		expect(a.length).toEqual(0);
	});

	it('should be able to send friend request', async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getFriends, requestFriend } = yield* _(FriendService);

				let p = yield* _(getFriends(user1Id));
				expect(p.length).toEqual(0);

				const req = yield* requestFriend(user1Id, user2Id);
				expect(req).toBeTruthy();
				expect(req.state).toEqual('ok');

				p = yield* _(getFriends(user1Id));
				expect(p.length).toEqual(0);

				p = yield* _(getFriends(user1Id, 'requested'));
				expect(p.length).toEqual(1);
				return p;
			}).pipe(friendServiceProvider, dbServiceProvider, userServiceProvider)
		);
	});

	it('should create only one request', async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getFriends, requestFriend } = yield* _(FriendService);

				let p = yield* _(getFriends(user1Id));
				expect(p.length).toEqual(0);

				let req = yield* requestFriend(user1Id, user2Id);
				expect(req).toBeTruthy();
				expect(req.state).toEqual('ok');

				p = yield* _(getFriends(user1Id));
				expect(p.length).toEqual(0);

				p = yield* _(getFriends(user1Id, 'requested'));
				expect(p.length).toEqual(1);

				req = yield* requestFriend(user1Id, user2Id);

				p = yield* _(getFriends(user1Id, 'requested'));
				expect(p.length).toEqual(1);
				return p;
			}).pipe(friendServiceProvider, dbServiceProvider, userServiceProvider)
		);
	});

	it('should be able to accept request', async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getFriends, requestFriend, proccessRequest } = yield* _(FriendService);
				const { queryPromise } = yield* DBService;
				yield* queryPromise((db) => db.delete(userFriend).execute());

				let p = yield* _(getFriends(user1Id));
				expect(p.length).toEqual(0);

				p = yield* _(getFriends(user2Id));
				expect(p.length).toEqual(0);

				const req = yield* requestFriend(user1Id, user2Id);
				expect(req).toBeTruthy();
				expect(req.state).toEqual('ok');

				const accept = yield* proccessRequest(user1Id, user2Id, 'accept');
				expect(accept.status).toEqual('ok');
				expect(accept.rejected).toBeFalsy();
				expect(accept.accepted).toBeTruthy();

				p = yield* _(getFriends(user1Id, 'accepted'));
				expect(p.length).toEqual(1);

				p = yield* _(getFriends(user2Id, 'accepted'));
				expect(p.length).toEqual(1);
			}).pipe(friendServiceProvider, dbServiceProvider, userServiceProvider)
		);
	});

	it('should be able to reject request', async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getFriends, requestFriend, proccessRequest } = yield* _(FriendService);
				const { queryPromise } = yield* DBService;
				yield* queryPromise((db) => db.delete(userFriend).execute());

				let p = yield* _(getFriends(user1Id));
				expect(p.length).toEqual(0);

				const req = yield* requestFriend(user1Id, user2Id);
				expect(req).toBeTruthy();
				expect(req.state).toEqual('ok');

				const reject = yield* proccessRequest(user1Id, user2Id, 'reject');
				expect(reject.status).toEqual('ok');
				expect(reject.accepted).toBeFalsy();
				expect(reject.rejected).toBeTruthy();

				p = yield* _(getFriends(user1Id, 'accepted'));
				expect(p.length).toEqual(0);

				p = yield* _(getFriends(user1Id, 'all'));
				expect(p.length).toEqual(1);
			}).pipe(friendServiceProvider, dbServiceProvider, userServiceProvider)
		);
	});

	it('should be able to accept two request for same users', async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getFriends, requestFriend } = yield* _(FriendService);
				const { queryPromise } = yield* DBService;
				yield* Effect.promise(() => new Promise((res) => setTimeout(() => res(42), 2000)));
				yield* queryPromise((db) => db.delete(userFriend).execute());

				let p = yield* _(getFriends(user1Id));
				expect(p.length).toEqual(0);

				p = yield* _(getFriends(user2Id));
				expect(p.length).toEqual(0);

				let req = yield* requestFriend(user1Id, user2Id);
				expect(req).toBeTruthy();
				expect(req.state).toEqual('ok');

				req = yield* requestFriend(user2Id, user1Id);
				expect(req).toBeTruthy();
				expect(req.state).toEqual('ok');

				p = yield* _(getFriends(user1Id, 'accepted'));
				expect(p.length).toEqual(1);

				p = yield* _(getFriends(user2Id, 'accepted'));
				expect(p.length).toEqual(1);
			}).pipe(friendServiceProvider, dbServiceProvider, userServiceProvider)
		);
	});
});
