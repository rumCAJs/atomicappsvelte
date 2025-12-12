import { z } from 'zod/v4';
import { command, getRequestEvent, query } from '$app/server';
import { authCommand, type UserAuthCommand } from '../utils';
import { ProjectService, projectServiceProvider } from '$lib/server/services/project';
import { UserService, userServiceProvider } from '$lib/server/services/user';
import { StoreService, storeServiceProvider } from '$lib/server/services/store';
import { Effect } from 'effect';
import { dbService } from '$lib/server/db';
import { ProjectUserError } from '$lib/errors';
import type { UUID } from '$lib/types';

// ============ CREATE PROJECT ============

const createProjectSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().min(1).max(100)
});

function getCreateProjectProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof createProjectSchema>;
}) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const userService = yield* UserService;

		// TODO: remove this after testing
		yield* userService.createUserProfile({
			name: 'test name',
			nick: 'test nick',
			userId: user.id
		});
		const u = yield* userService.getByUserId(user.id);
		const p = yield* pService.create(body.name, u.id);
		return p;
	});
}

export const createProject = command(createProjectSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}
	try {
		const ret = await Effect.runPromise(
			getCreateProjectProgram({ user, body: data }).pipe(
				userServiceProvider,
				projectServiceProvider,
				dbService.dbServiceProvider
			)
		);

		return ret;
	} catch (error) {
		console.error(error);
		throw error;
	}
});

// ============ UPDATE PROJECT ============

const updateProjectSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().min(1),
	isActive: z.boolean(),
	version: z.number().positive()
});

function getUpdateProjectProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof updateProjectSchema>;
}) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const p = yield* pService.getById(body.id as UUID);

		const pu = yield* pService.isUserInProject({
			projectId: p.publicId,
			userProfileId: user.id
		});

		if (pu.role !== 'admin') {
			return yield* Effect.fail(
				new ProjectUserError('You dont have permissions to update project data')
			);
		}

		return yield* pService.updateProject({
			...body,
			publicId: p.publicId,
			uid: user.id
		});
	});
}

export const updateProject = command(updateProjectSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getUpdateProjectProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});

// ============ GET PROJECT ============

const getProjectSchema = z.object({
	id: z.string().min(1).max(100),
	showOnlyActive: z.boolean().default(true)
});

function getGetProjectProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof getProjectSchema>;
}) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const userService = yield* UserService;
		const storeService = yield* StoreService;

		const u = yield* userService.getByUserId(user.id);
		const p = yield* pService.getById(body.id as UUID);
		const pu = yield* pService.getProjectUser(p.id, u.id);

		yield* pService.isUserInProject({
			projectId: body.id as UUID,
			userProfileId: u.publicId
		});

		const tasks = yield* pService.getTasks(
			p.publicId,
			pu.role === 'admin' ? body.showOnlyActive : true
		);

		const store = yield* storeService.getForProject(p.id);

		return {
			project: p,
			balance: pu.balance,
			role: pu.role,
			tasks,
			store: {
				info: store.store,
				items: store.items
			}
		};
	});
}

export type GetProjectResult = Effect.Effect.Success<ReturnType<typeof getGetProjectProgram>>;

export const getProject = query(getProjectSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getGetProjectProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			storeServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});

// ============ GET USER PROJECTS ============

function getGetUserProjectsProgram({ user }: { user: UserAuthCommand }) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const userService = yield* UserService;
		const u = yield* userService.getByUserId(user.id);
		const p = yield* pService.getProjectsForUser(u.id);
		return p.map((p) => ({
			balance: p.project_user.balance,
			role: p.project_user.role,
			project: p.project
		}));
	});
}

export type GetUserProjectsResult = Effect.Effect.Success<
	ReturnType<typeof getGetUserProjectsProgram>
>;

export const getUserProjects = query(async () => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getGetUserProjectsProgram({ user }).pipe(
			userServiceProvider,
			projectServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});
