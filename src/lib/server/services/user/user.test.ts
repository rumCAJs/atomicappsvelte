import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Effect, Option } from 'effect';
import { unlinkSync } from 'node:fs';
import { DBService, createDBService } from '../db';
import { UserService, userServiceProvider } from '.';
import { createTestUser } from '../testutils';
import type { UUID } from '$lib/types';

const dbName = 'usertest.db';
try {
	unlinkSync(dbName);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
	//console.error(e);
}

const { dbService, db } = createDBService(dbName, true, './drizzle');
const dbServiceProvider = Effect.provideService(DBService, dbService);

let user: { id: string; email: string; name: string };

describe('User service', () => {
	beforeAll(async () => {
		user = await createTestUser(db);
	});

	afterAll(async () => {
		unlinkSync(dbName);
	});

	it('should return if user profile exists', async () => {
		// non-existing profile
		const doesNotExist = await Effect.runPromise(
			Effect.gen(function* (_) {
				const { exists } = yield* _(UserService);
				const ex = yield* _(exists('non-existing' as UUID));
				return ex;
			}).pipe(userServiceProvider, dbServiceProvider)
		);
		expect(doesNotExist).toBeFalsy();

		// create profile for existing auth user
		const profile = await Effect.runPromise(
			Effect.gen(function* (_) {
				const userService = yield* _(UserService);
				const p = yield* _(
					userService.create('Test Profile', 'tp', user.id),
					Effect.flatMap((u) =>
						Option.match(u, {
							onNone: () => Effect.fail(new Error('profile must exist')),
							onSome: (value) => Effect.succeed(value)
						})
					)
				);
				return p;
			}).pipe(userServiceProvider, dbServiceProvider)
		);

		expect(profile).toBeTruthy();
		expect(profile.userId).toEqual(user.id);
		expect(profile.publicId).toBeTruthy();

		// existing profile
		const doesExist = await Effect.runPromise(
			Effect.gen(function* (_) {
				const { exists } = yield* _(UserService);
				const ex = yield* _(exists(profile.publicId));
				return ex;
			}).pipe(userServiceProvider, dbServiceProvider)
		);

		expect(doesExist).toBeTruthy();
	});

	it('should get profile by public id', async () => {
		const result = await Effect.runPromise(
			Effect.gen(function* (_) {
				const userService = yield* _(UserService);
				const created = yield* _(
					userService.create('Public Id User', 'pid', user.id),
					Effect.flatMap((u) =>
						Option.match(u, {
							onNone: () => Effect.fail(new Error('profile must exist')),
							onSome: (value) => Effect.succeed(value)
						})
					)
				);

				const byPublicId = yield* _(userService.getByPublicId(created.publicId));

				return { created, byPublicId };
			}).pipe(userServiceProvider, dbServiceProvider)
		);

		expect(result.byPublicId.id).toEqual(result.created.id);
		expect(result.byPublicId.publicId).toEqual(result.created.publicId);
		expect(result.byPublicId.nick).toEqual(result.created.nick);
	});

	it('should change profile info and regenerate pin', async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { create, changeInfo, getByPublicId } = yield* _(UserService);
				const created = yield* _(
					create('Change Info User', 'nick-old', user.id),
					Effect.flatMap((u) =>
						Option.match(u, {
							onNone: () => Effect.fail(new Error('profile must exist')),
							onSome: (value) => Effect.succeed(value)
						})
					)
				);

				const originalPin = created.pin;

				const updated = yield* _(changeInfo(created.publicId, { nick: 'nick-new' }));

				expect(updated.nick).toEqual('nick-new');
				expect(updated.publicId).toEqual(created.publicId);
				expect(updated.pin).not.toEqual(originalPin);

				const fetched = yield* _(getByPublicId(created.publicId));
				expect(fetched.nick).toEqual('nick-new');

				return updated;
			}).pipe(userServiceProvider, dbServiceProvider)
		);
	});

	it('should get auth user by name', async () => {
		const result = await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getByName } = yield* _(UserService);
				const u = yield* _(getByName(user.name));
				return u;
			}).pipe(userServiceProvider, dbServiceProvider)
		);

		expect(result.id).toEqual(user.id);
		expect(result.email).toEqual(user.email);
		expect(result.name).toEqual(user.name);
	});
});
