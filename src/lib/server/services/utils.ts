import { BaseError } from '$lib/errors';
import { UUID } from '$lib/types';
import { Effect } from 'effect';

export function makeUUID() {
	return crypto.randomUUID() as UUID;
}

export class ItemDontExistsError extends BaseError<'ItemDontExistsError'> {
	readonly _tag = 'ItemDontExistsError';

	constructor(public message: string) {
		super('ItemDontExistsError', message);
	}
}

export function getFirstE<T>(data: Array<T>) {
	if (!data || data.length === 0) {
		return Effect.fail(new ItemDontExistsError('Firs item does not exist'));
	}
	return Effect.succeed(data[0]!);
}
