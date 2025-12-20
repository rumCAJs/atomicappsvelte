import { z } from 'zod/v4';
import { command, form, getRequestEvent } from '$app/server';
import {
	AppError,
	parseEffectError,
	authCommand,
	type UserAuthCommand,
	parseExitError
} from '../utils';
import { ProjectService, projectServiceProvider } from '$lib/server/services/project';
import { TaskService, taskServiceProvider } from '$lib/server/services/task';
import { UserService, userServiceProvider } from '$lib/server/services/user';
import { Cause, Effect } from 'effect';
import { dbService } from '$lib/server/db';
import { ProjectUserError } from '$lib/errors';
import type { UUID } from '$lib/types';
import { getProject } from './project.remote';
import { error } from '@sveltejs/kit';

// ============ CREATE TASK ============

const createTaskSchema = z.object({
	name: z.string().min(1).max(100),
	reward: z.number().positive(),
	pid: z.string()
});

function getCreateTaskProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof createTaskSchema>;
}) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const tService = yield* TaskService;
		const userService = yield* UserService;
		const u = yield* userService.getByUserId(user.id);

		yield* pService.isUserInProject({
			projectId: body.pid as UUID,
			userProfileId: u.publicId
		});

		const task = yield* tService.addTask(body.name, body.pid as UUID, u.id, body.reward);
		return task;
	});
}

export const createTask = command(createTaskSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getCreateTaskProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			taskServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});

// ============ GET TASK BY ID ============

const getTaskByIdSchema = z.object({
	id: z.number().positive()
});

function getGetTaskByIdProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof getTaskByIdSchema>;
}) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const tService = yield* TaskService;
		const task = yield* tService.getTaskById(body.id, user.id);

		const pu = yield* pService.isUserInProject({
			projectId: task.projectId,
			userProfileId: user.id
		});

		if (!task.isActive && pu.role !== 'admin') {
			return yield* Effect.fail(
				new ProjectUserError('Task is inactive and you dont have rights to see it')
			);
		}

		return task;
	});
}

export const getTaskById = command(getTaskByIdSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getGetTaskByIdProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			taskServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});

// ============ COMPLETE TASK ============

const completeTaskSchema = z.object({
	taskId: z.number().positive(),
	projectId: z.string().min(1)
});

function getCompleteTaskProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof completeTaskSchema>;
}) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const userService = yield* UserService;
		const tService = yield* TaskService;

		const u = yield* userService.getByUserId(user.id);

		yield* pService.isUserInProject({
			projectId: body.projectId as UUID,
			userProfileId: u.publicId
		});

		return yield* tService.completeTask(u.id, body.taskId);
	});
}

export const completeTask = command(completeTaskSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromiseExit(
		getCompleteTaskProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			taskServiceProvider,
			dbService.dbServiceProvider
		)
	);

	if (ret._tag === 'Success') {
		await getProject({ id: data.projectId, showOnlyActive: true }).refresh();
		return ret.value;
	} else {
		const { message, status } = parseExitError(ret.cause);
		return error(status, message);
	}
});

// ============ UPDATE TASK ============

const updateTaskSchema = z.object({
	id: z.number().positive(),
	name: z.string().min(1),
	description: z.string().min(1),
	isActive: z.boolean(),
	reward: z.number().positive(),
	version: z.number().positive()
});

function getUpdateTaskProgram({
	user,
	body
}: {
	user: UserAuthCommand;
	body: z.infer<typeof updateTaskSchema>;
}) {
	return Effect.gen(function* () {
		const pService = yield* ProjectService;
		const tService = yield* TaskService;
		const task = yield* pService.getTaskById(body.id);

		const pu = yield* pService.isUserInProject({
			projectId: task.projectId,
			userProfileId: user.id
		});

		if (pu.role !== 'admin') {
			return yield* Effect.fail(
				new ProjectUserError('You dont have permissions to update task data')
			);
		}

		return yield* tService.updateTask({ ...body, uid: user.id });
	});
}

export const updateTask = command(updateTaskSchema, async (data) => {
	const { request } = getRequestEvent();
	const user = await authCommand(request.headers);
	if (!user) {
		throw new Error('Unauthorized');
	}

	const ret = await Effect.runPromise(
		getUpdateTaskProgram({ user, body: data }).pipe(
			userServiceProvider,
			projectServiceProvider,
			taskServiceProvider,
			dbService.dbServiceProvider
		)
	);

	return ret;
});
