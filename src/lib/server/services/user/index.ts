import { Context, Effect } from 'effect';
import { changeInfo, create, exists, getByName, getByPublicId } from './functions';

export class UserService extends Context.Tag('UserService')<
	UserService,
	{
		readonly exists: typeof exists;
		readonly create: typeof create;
		readonly getByName: typeof getByName;
		readonly getByPublicId: typeof getByPublicId;
		readonly changeInfo: typeof changeInfo;
	}
>() {}

export const userService = UserService.of({
	exists,
	create,
	getByName,
	getByPublicId,
	changeInfo
});

export const userServiceProvider = Effect.provideService(UserService, userService);
