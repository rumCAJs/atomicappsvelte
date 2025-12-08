import { TaskNotFoundError, TaskUpdateError } from '$lib/errors';
import { projectUser, task, taskHistory, taskUser } from '$lib/server/db/schema/app';
import { UserService } from '$lib/server/services/user';
import type { ProjectSelect, TaskSelect, UserProfileSelect } from '$lib/types/db';
import { and, eq, sql } from 'drizzle-orm';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { DBService } from '$lib/server/services/db';
import { getFirstE } from '$lib/server/services/utils';
import { ProjectService } from '$lib/server/services/project';

function addTask(
	name: string,
	projectId: ProjectSelect['publicId'],
	userId: UserProfileSelect['id'],
	reward = 1
) {
	return Effect.gen(function* () {
		const { queryPromise } = yield* DBService;
		const { getById } = yield* ProjectService;
		const project = yield* getById(projectId);
		const newTask = yield* queryPromise((db) =>
			db
				.insert(task)
				.values({
					projectId: project.id,
					name,
					reward,
					createdBy: userId
				})
				.returning()
				.execute()
		);

		return newTask[0];
	});
}

function getTaskById(id: TaskSelect['id'], userProfileId: UserProfileSelect['publicId']) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		const { isUserInProject } = yield* ProjectService;
		const taskData = yield* _(
			query((db) => db.select().from(task).where(eq(task.id, id)).all()),
			Effect.flatMap((t) => {
				if (!t || t.length === 0) {
					return Effect.fail(new TaskNotFoundError());
				}
				return Effect.succeed(t[0]);
			})
		);

		yield* isUserInProject({ userProfileId, projectId: taskData.projectId });

		return taskData;
	});
}

function getTaskUserHistory(id: TaskSelect['id'], userProfileId: UserProfileSelect['id']) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		return yield* _(
			query((db) =>
				db
					.select()
					.from(taskUser)
					.where(and(eq(taskUser.taskId, id), eq(taskUser.userId, userProfileId)))
					.all()
			)
		);
	});
}

function completeTask(
	userProfileId: UserProfileSelect['id'],
	taskId: TaskSelect['id'],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	date: Date = new Date()
) {
	return Effect.gen(function* (_) {
		const { query, queryPromise } = yield* _(DBService);

		// join does not work, dont know why, balance is undefined
		// const data = yield* _(
		//   query((db) =>
		//     db
		//       .select()
		//       .from(task)
		//       .innerJoin(
		//         projectUser,
		//         and(
		//           eq(projectUser.userId, uid),
		//           eq(projectUser.projectId, task.projectId),
		//         ),
		//       )
		//       .where(eq(task.id, taskId))
		//       .all(),
		//   ),
		//   Effect.flatMap((p) => {
		//     console.log(p);
		//     if (!p || p.length === 0) {
		//       return Effect.fail(new ProjectUserError("User is not in project"));
		//     }
		//     return Effect.succeed(p[0]);
		//   }),
		// );
		//

		const dataTask = yield* _(
			query((db) => db.select().from(task).where(eq(task.id, taskId)).all()),
			Effect.flatMap(getFirstE)
		);

		const dataProjectUser = yield* _(
			query((db) =>
				db
					.select()
					.from(projectUser)
					.where(
						and(
							eq(projectUser.projectId, dataTask.projectId),
							eq(projectUser.userId, userProfileId)
						)
					)
					.all()
			),
			Effect.flatMap(getFirstE)
		);

		yield* _(
			queryPromise((db) =>
				db
					.insert(taskUser)
					.values({
						userId: userProfileId,
						taskId,
						taskVersion: dataTask.version,
						reward: dataTask.reward
					})
					.returning()
					.execute()
			)
		);

		const newDataQuery = yield* _(
			query((db) =>
				db
					.update(projectUser)
					.set({
						balance: (dataProjectUser.balance || 0) + (dataTask.reward || 0)
					})
					.where(
						and(
							eq(projectUser.userId, userProfileId),
							eq(projectUser.projectId, dataProjectUser.projectId)
						)
					)
					.returning()
					.execute()
			)
		);
		const newData = yield* _(Effect.promise(() => newDataQuery));
		return newData;
	});
}

function updateTask({
	id,
	name,
	description,
	reward,
	isActive,
	version,
	uid
}: Pick<TaskSelect, 'id' | 'isActive' | 'reward' | 'name' | 'description' | 'version'> & {
	uid: UserProfileSelect['publicId'];
}) {
	return Effect.gen(function* (_) {
		const { queryPromise } = yield* _(DBService);
		const userService = yield* _(UserService);
		const u = yield* _(userService.getByPublicId(uid));
		const t = yield* _(getTaskById(id, uid));
		if (t.version !== version) {
			return yield* _(
				Effect.fail(new TaskUpdateError('version missmatch, reload page and try it again'))
			);
		}
		yield* _(
			queryPromise((db) =>
				db
					.insert(taskHistory)
					.values({
						taskId: t.id,
						name: t.name,
						reward: t.reward,
						version: t.version,
						description: t.description,
						createdBy: u.id
					})
					.execute()
			)
		);

		yield* _(
			queryPromise((db) =>
				db
					.update(task)
					.set({
						name: name,
						reward: reward,
						version: t.version + 1,
						description: description,
						changedAt: sql`CURRENT_TIMESTAMP`,
						isActive: isActive
					})
					.where(eq(task.id, id))
					.execute()
			)
		);

		return yield* _(getTaskById(id, uid));
	});
}

function hasTaskHistory({ taskId }: { taskId: TaskSelect['id'] }) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		const hasHistory = yield* query((db) =>
			db.select().from(taskUser).where(eq(taskUser.taskId, taskId)).limit(1).all()
		);
		return hasHistory.length > 0;
	});
}

export class TaskService extends Context.Tag('TaskService')<
	TaskService,
	{
		readonly addTask: typeof addTask;
		readonly completeTask: typeof completeTask;
		readonly getTaskUserHistory: typeof getTaskUserHistory;
		readonly getTaskById: typeof getTaskById;
		readonly updateTask: typeof updateTask;
		readonly hasTaskHistory: typeof hasTaskHistory;
	}
>() {}

export const taskService = TaskService.of({
	addTask,
	completeTask,
	getTaskUserHistory,
	getTaskById,
	updateTask,
	hasTaskHistory
});

export const taskServiceProvider = Effect.provideService(TaskService, taskService);
