import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Effect, Option } from 'effect';
import { DBService, createDBService } from '../db';
import { ProjectService, projectServiceProvider } from '../project';
import { StoreService, storeServiceProvider } from '.';
import { UserService, userServiceProvider } from '../user';
import { eq } from 'drizzle-orm';
import { getFirstE } from '../utils';
import { unlinkSync } from 'node:fs';
import { projectUser } from '$lib/server/db/schema/app';
import { createTestAuth, createTestUser } from '../testutils';

const dbName = 'storetest.db';
try {
	unlinkSync(dbName);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
	//console.error(e);
}

const { dbService, db } = createDBService(dbName, true, './drizzle');
const dbServiceProvider = Effect.provideService(DBService, dbService);

let user: { id: string; email: string; name: string };
describe('Store service', () => {
	beforeAll(async () => {
		user = await createTestUser(db);
		// Effect.gen(function* (_) {
		// 	const { create } = yield* _(UserService);
		// 	yield* create('a', 'a', user.id);
		// }).pipe(userServiceProvider, dbServiceProvider);
	});
	afterAll(async () => {
		//unlinkSync(dbName);
	});

	it('should create a store after project', async () => {
		const a = await Effect.runPromise(
			Effect.gen(function* (_) {
				const userService = yield* _(UserService);
				const dbService = yield* _(DBService);
				const u = yield* _(
					userService.create('storeuser', 'su', user.id),
					Effect.map((u) =>
						Option.match(u, {
							onNone: () => undefined,
							onSome: (u) => u
						})
					)
				);
				expect(u?.publicId).toBeTruthy();
				const { create } = yield* _(ProjectService);
				const { getForProject, addItem, buyItem } = yield* _(StoreService);
				const p = yield* _(create('storeservicetest', 1));
				const s = yield* _(getForProject(p.id));
				expect(s.store).toBeTruthy();
				expect(s.items.length).toEqual(0);
				const ni = yield* _(
					addItem({
						price: 10,
						name: 'store item 1',
						uid: u?.publicId!,
						storeId: s.store.id
					})
				);
				expect(ni.price).toEqual(10);
				expect(ni.isActive).toBeTruthy();
				yield* _(
					buyItem(ni.id, u?.publicId!),
					Effect.match({
						onFailure: (e) => {
							expect(e._tag).toEqual('StoreError');
						},
						onSuccess: (d) => {}
					})
				);

				yield* _(
					dbService.queryPromise((db) =>
						db
							.update(projectUser)
							.set({
								balance: 11
							})
							.where(eq(projectUser.userId, u?.id!))
							.execute()
					)
				);

				yield* _(
					buyItem(ni.id, u?.publicId!),
					Effect.match({
						onFailure: (e) => {
							expect(e._tag).toEqual('StoreError');
						},
						onSuccess: (d) => {}
					})
				);

				const pu = yield* _(
					dbService.query((db) =>
						db.select().from(projectUser).where(eq(projectUser.userId, u?.id!)).all()
					),
					Effect.flatMap(getFirstE)
				);
				expect(pu.balance).toEqual(1);
				return p;
			}).pipe(projectServiceProvider, storeServiceProvider, dbServiceProvider, userServiceProvider)
		);
		expect(a).toBeTruthy();
	});
});
