import { UUID } from '$lib/types';
import { Effect } from 'effect';

export function makeUUID() {
	return crypto.randomUUID() as UUID;
}

class ItemDontExistsError {
	readonly _tag = 'ItemDontExistsError';
}

export function getFirstE<T>(data: Array<T>) {
	if (!data || data.length === 0) {
		return Effect.fail(new ItemDontExistsError());
	}
	return Effect.succeed(data[0]!);
}
