import { z } from 'zod/v4';
import { command, getRequestEvent } from '$app/server';
import { authCommand, type UserAuthCommand } from './utils';
import { StoreService, storeServiceProvider } from '$lib/server/services/store';
import { projectServiceProvider } from '$lib/server/services/project';
import { UserService, userServiceProvider } from '$lib/server/services/user';
import { Effect } from 'effect';
import { dbService } from '$lib/server/db';

// ============ ADD STORE ITEM ============

const addStoreItemSchema = z.object({
	storeId: z.number().positive(),
	name: z.string().min(1),
	price: z.number().positive()
});

function getAddStoreItemProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof addStoreItemSchema>;
}) {
	return Effect.gen(function* () {
		const storeService = yield* StoreService;
		const userService = yield* UserService;
		const u = yield* userService.getByUserId(user.id);
		if (!u) {
			return Effect.fail(new Error('User not found'));
		}
		return yield* storeService.addItem({
			storeId: body.storeId,
			name: body.name,
			price: body.price,
			uid: u.publicId
		});
	});
}

export const addStoreItem = command(addStoreItemSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getAddStoreItemProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			storeServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});

// ============ BUY STORE ITEM ============

const buyStoreItemSchema = z.object({
	itemId: z.number().positive()
});

function getBuyStoreItemProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof buyStoreItemSchema>;
}) {
	return Effect.gen(function* () {
		const storeService = yield* StoreService;
		return yield* storeService.buyItem(body.itemId, user.id);
	});
}

export const buyStoreItem = command(buyStoreItemSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getBuyStoreItemProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			storeServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});
