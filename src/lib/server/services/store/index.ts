import { Context, Effect } from 'effect';
import type { ProjectSelect, StoreItemSelect, StoreSelect, UserProfileSelect } from '$lib/types/db';
import { DBService } from '$lib/server/services/db';
import { projectUser, store, storeItem, storePurchase } from '$lib/server/db/schema/app';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { UserService } from '$lib/server/services/user';
import { ProjectService } from '$lib/server/services/project';
import { getFirstE } from '$lib/server/services/utils';
import { StoreNotFoundError, StoreError } from '$lib/errors';

function create() {}

function getById(storeId: StoreSelect['id']) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		return yield* _(
			query((db) => db.select().from(store).where(eq(store.id, storeId)).all()),
			Effect.flatMap((s) => {
				if (!s || s.length === 0) {
					return Effect.fail(new StoreNotFoundError());
				}
				return Effect.succeed(s[0]);
			})
		);
	});
}

function getForProject(projectId: ProjectSelect['id'], onlyActive = true) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		const storeData = yield* _(
			query((db) => db.select().from(store).where(eq(store.projectId, projectId)).all())
		);

		const items = yield* _(
			query((db) =>
				db
					.select()
					.from(storeItem)
					.where(
						and(
							eq(storeItem.storeId, storeData[0].id),
							onlyActive ? eq(storeItem.isActive, true) : isNotNull(storeItem.isActive)
						)
					)

					.all()
			)
		);

		return {
			store: storeData[0],
			items: items
		};
	});
}

interface AddItem {
	storeId: StoreSelect['id'];
	uid: UserProfileSelect['publicId'];
	name: string;
	price: number;
}
function addItem({ storeId, uid, name, price }: AddItem) {
	return Effect.gen(function* (_) {
		const projectService = yield* _(ProjectService);
		const { queryPromise } = yield* _(DBService);
		const s = yield* _(getById(storeId));
		yield* _(projectService.isUserInProject({ userProfileId: uid, projectId: s.projectId }));
		const newItem = yield* _(
			queryPromise((db) =>
				db
					.insert(storeItem)
					.values({
						storeId: s.id,
						name,
						price
					})
					.returning()
					.execute()
			)
		);

		return newItem[0];
	});
}

function buyItem(itemId: StoreItemSelect['id'], uid: UserProfileSelect['publicId']) {
	return Effect.gen(function* (_) {
		const { query, queryPromise } = yield* _(DBService);
		const { getByPublicId } = yield* _(UserService);
		const projectService = yield* _(ProjectService);
		// does not work, dkw
		// const item = yield* _(
		//   query((db) =>
		//     db
		//       .select()
		//       .from(storeItem)
		//       .innerJoin(store, eq(store.id, storeItem.storeId))
		//       .where(eq(storeItem.id, itemId))
		//       .all(),
		//   ),
		// );

		const item = yield* _(
			query((db) => db.select().from(storeItem).where(eq(storeItem.id, itemId)).all()),
			Effect.flatMap(getFirstE)
		);

		const itemStore = yield* _(
			query((db) => db.select().from(store).where(eq(store.id, item.storeId)).all()),
			Effect.flatMap(getFirstE)
		);

		const u = yield* _(getByPublicId(uid));
		yield* _(
			projectService.isUserInProject({
				userProfileId: uid,
				projectId: itemStore.projectId
			})
		);

		// check user's balance
		yield* _(
			query((db) =>
				db
					.select()
					.from(projectUser)
					.where(and(eq(projectUser.userId, u.id), eq(projectUser.projectId, itemStore.projectId)))
					.all()
			),
			Effect.flatMap(getFirstE),
			Effect.flatMap((pu) => {
				if (!pu || pu.balance < item.price) {
					return Effect.fail(new StoreError('insufficent balance'));
				}
				return Effect.succeed(pu);
			})
		);

		yield* _(
			queryPromise((db) =>
				db.transaction(async (tx) => {
					await tx
						.insert(storePurchase)
						.values({
							price: item.price,
							itemId: item.id,
							userId: u.id
						})
						.execute();
					await tx
						.update(projectUser)
						.set({
							balance: sql`${projectUser.balance} - ${item.price}`
						})
						.where(
							and(eq(projectUser.projectId, itemStore.projectId), eq(projectUser.userId, u.id))
						)
						.execute();
				})
			)
		);
	});
}

export class StoreService extends Context.Tag('StoreService')<
	StoreService,
	{
		readonly create: typeof create;
		readonly getForProject: typeof getForProject;
		readonly addItem: typeof addItem;
		readonly buyItem: typeof buyItem;
	}
>() {}

export const storeService = StoreService.of({
	create,
	getForProject,
	addItem,
	buyItem
});

export const storeServiceProvider = Effect.provideService(StoreService, storeService);
