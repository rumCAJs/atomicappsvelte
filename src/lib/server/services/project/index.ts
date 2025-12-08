import {
	ProjectNotFoundError,
	ProjectServiceError,
	ProjectUpdateError,
	ProjectUserError,
	TaskNotFoundError
} from '$lib/errors';
import { projectHistory, project, projectUser, store, task } from '$lib/server/db/schema/app';
import { UserService } from '$lib/server/services/user';
import type { ProjectSelect, TaskSelect, UserProfileSelect } from '$lib/types/db';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { DBService } from '../db';
import { getFirstE, makeUUID } from '../utils';

function create(name: string, userProfileId: UserProfileSelect['id']) {
	return Effect.gen(function* (_) {
		const uuid = makeUUID();
		const { query, queryPromise } = yield* DBService;

		const projectData = yield* _(
			queryPromise((db) =>
				db
					.insert(project)
					.values({
						publicId: uuid,
						name,
						changedBy: userProfileId
					})
					.returning()
					.execute()
			),
			Effect.flatMap((e) => {
				if (e.length === 0) {
					return Effect.fail(new ProjectServiceError());
				}
				return Effect.succeed(e[0]);
			})
		);

		const puQuery = yield* _(
			query((db) =>
				db
					.insert(projectUser)
					.values({
						projectId: projectData.id,
						userId: userProfileId,
						role: 'admin'
					})
					.execute()
			)
		);
		yield* _(Effect.promise(() => puQuery));

		yield* _(
			queryPromise((db) =>
				db
					.insert(store)
					.values({
						projectId: projectData.id,
						name: `${projectData.name} store`
					})
					.execute()
			)
		);

		return projectData;
	});
}

function getProjectsForUser(userProfileId: UserProfileSelect['id']) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		return yield* _(
			query((db) =>
				db
					.select()
					.from(projectUser)
					.innerJoin(project, eq(project.id, projectUser.projectId))
					.where(and(eq(project.isActive, true), eq(projectUser.userId, userProfileId)))
					.all()
			)
		);
	});
}

function getProjectUser(projectId: ProjectSelect['id'], userProfileId: UserProfileSelect['id']) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		return yield* _(
			query((db) =>
				db
					.select()
					.from(projectUser)
					.where(and(eq(projectUser.projectId, projectId), eq(projectUser.userId, userProfileId)))
					.all()
			),
			Effect.flatMap(getFirstE)
		);
	});
}

function getById(pid: ProjectSelect['publicId'] | ProjectSelect['id']) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		return yield* _(
			query((db) =>
				db
					.select()
					.from(project)
					.where(typeof pid === 'number' ? eq(project.id, pid) : eq(project.publicId, pid))
					.limit(1)
					.all()
			),
			Effect.flatMap((p) => {
				if (!p || p.length === 0) {
					return Effect.fail(new ProjectNotFoundError());
				}
				return Effect.succeed(p[0]);
			})
		);
	});
}

function getTasks(pid: ProjectSelect['publicId'], onlyActive = true) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		const project = yield* _(getById(pid));
		return yield* _(
			query((db) =>
				db
					.select()
					.from(task)
					.where(
						and(
							eq(task.projectId, project.id),
							onlyActive ? eq(task.isActive, true) : isNotNull(task.isActive)
						)
					)
					.all()
			)
		);
	});
}

function getTaskById(id: TaskSelect['id']) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		return yield* _(
			query((db) => db.select().from(task).where(eq(task.id, id)).all()),
			Effect.flatMap((t) => {
				if (!t || t.length === 0) {
					return Effect.fail(new TaskNotFoundError());
				}
				return Effect.succeed(t[0]);
			})
		);
	});
}

type IsUserInProjectArgs = {
	userProfileId: UserProfileSelect['publicId'];
} & (
	| {
			projectId: ProjectSelect['publicId'];
	  }
	| {
			projectId: ProjectSelect['id'];
	  }
);
function isUserInProject({ userProfileId, projectId }: IsUserInProjectArgs) {
	return Effect.gen(function* (_) {
		const { query } = yield* _(DBService);
		const userService = yield* _(UserService);
		const u = yield* _(userService.getByPublicId(userProfileId));
		const p = yield* _(getById(projectId));
		return yield* _(
			query((db) =>
				db
					.select()
					.from(projectUser)
					.where(and(eq(projectUser.userId, u.id), eq(projectUser.projectId, p.id)))
					.all()
			),
			Effect.flatMap((pu) => {
				if (!pu || pu.length === 0) {
					return Effect.fail(new ProjectUserError('User is not assigned in project'));
				}
				return Effect.succeed(pu[0]);
			})
		);
	});
}

function updateProject({
	publicId,
	name,
	description,
	isActive,
	version,
	uid
}: Pick<ProjectSelect, 'publicId' | 'isActive' | 'name' | 'description' | 'version'> & {
	uid: UserProfileSelect['publicId'];
}) {
	return Effect.gen(function* (_) {
		const { queryPromise } = yield* _(DBService);
		const userService = yield* _(UserService);
		const u = yield* _(userService.getByPublicId(uid));
		const p = yield* _(getById(publicId));
		if (p.version !== version) {
			return yield* _(
				Effect.fail(new ProjectUpdateError('version missmatch, reload page and try it again'))
			);
		}
		yield* _(
			queryPromise((db) =>
				db
					.insert(projectHistory)
					.values({
						name: p.name,
						version: p.version,
						description: p.description,
						projectId: p.id,
						isActive: p.isActive,
						createdBy: u.id
					})
					.execute()
			)
		);

		yield* _(
			queryPromise((db) =>
				db
					.update(project)
					.set({
						name: name,
						version: p.version + 1,
						description: description,
						changedAt: sql`CURRENT_TIMESTAMP`,
						isActive: isActive
					})
					.where(eq(project.id, p.id))
					.execute()
			)
		);

		return yield* _(getById(publicId));
	});
}

export class ProjectService extends Context.Tag('ProjectService')<
	ProjectService,
	{
		readonly create: typeof create;
		readonly getTasks: typeof getTasks;
		readonly getProjectsForUser: typeof getProjectsForUser;
		readonly getById: typeof getById;
		readonly isUserInProject: typeof isUserInProject;
		readonly getTaskById: typeof getTaskById;
		readonly getProjectUser: typeof getProjectUser;
		readonly updateProject: typeof updateProject;
	}
>() {}

export const projectService = ProjectService.of({
	create,
	getTasks,
	getProjectsForUser,
	getById: getById,
	isUserInProject,
	getTaskById,
	getProjectUser,
	updateProject
});

export const projectServiceProvider = Effect.provideService(ProjectService, projectService);
