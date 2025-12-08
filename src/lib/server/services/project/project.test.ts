import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Effect } from 'effect';
import { ProjectService, projectServiceProvider } from '.';
import { DBService, createDBService } from '../db';
import { eq } from 'drizzle-orm';
import { StoreService, storeServiceProvider } from '../store';
import { projectUser } from '$lib/server/db/schema/app';
import { unlinkSync } from 'node:fs';
import { UserService, userServiceProvider } from '../user';
import { TaskService, taskServiceProvider } from '../task';

const dbName = 'projecttest.db';
try {
	unlinkSync(dbName);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
	//console.error(e);
}

const { dbService } = createDBService(dbName, true, './drizzle');
const dbServiceProvider = Effect.provideService(DBService, dbService);

describe('Project service', () => {
	beforeAll(async () => {
		await Effect.runPromise(
			Effect.gen(function* () {
				const { create } = yield* UserService;
				yield* create('a', 'a', 'a');
			}).pipe(userServiceProvider, dbServiceProvider)
		);
	});
	afterAll(async () => {
		unlinkSync(dbName);
	});

	it('should create project', async () => {
		const a = await Effect.runPromise(
			Effect.gen(function* (_) {
				const { create } = yield* _(ProjectService);
				const p = yield* _(create('lalalal', 1));
				return p;
			}).pipe(projectServiceProvider, dbServiceProvider)
		);
		expect(a).toBeTruthy();

		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { getProjectsForUser } = yield* _(ProjectService);
				const storeService = yield* _(StoreService);
				const p = yield* _(getProjectsForUser(1));
				expect(p).toBeTruthy();
				expect(p.length).toBeGreaterThan(0);
				const s = yield* _(storeService.getForProject(p[0].project.id));
				expect(s.store.projectId).toEqual(p[0].project.id);
			}).pipe(dbServiceProvider, projectServiceProvider, storeServiceProvider)
		);
	});

	it('should be able to add task to project', async () => {
		const a = await Effect.runPromise(
			Effect.gen(function* (_) {
				const { create, getTasks } = yield* _(ProjectService);
				const { addTask } = yield* TaskService;
				const p = yield* _(create('testproject2', 1));
				expect(p).toHaveProperty('id');

				const tasksPre = yield* _(getTasks(p.publicId));
				expect(tasksPre).toBeTruthy();
				expect(tasksPre.length).toEqual(0);

				const newTask = yield* _(addTask('testtask1', p.publicId, 1, 10));
				expect(newTask).toBeTruthy();
				expect(newTask).toHaveProperty('id');

				const tasksPost = yield* _(getTasks(p.publicId));
				expect(tasksPost).toBeTruthy();
				expect(tasksPost.length).toBeGreaterThan(0);
				return p;
			}).pipe(
				projectServiceProvider,
				taskServiceProvider,
				Effect.provideService(DBService, dbService)
			)
		);
		expect(a).toBeTruthy();
	});

	it('should be able to complete task for user', async () => {
		await Effect.runPromise(
			Effect.gen(function* (_) {
				const { create } = yield* _(ProjectService);
				const { addTask, completeTask } = yield* TaskService;
				const { query } = yield* _(DBService);
				const p = yield* _(create('testproject3', 1));
				const newTask = yield* _(addTask('testtask2', p.publicId, 1, 1));
				const userProjectPre = yield* _(
					query((db) => db.select().from(projectUser).where(eq(projectUser.projectId, p.id)).all())
				);
				expect(userProjectPre[0].balance).toEqual(0);
				yield* _(completeTask(1, newTask.id));
				const userProjectPost = yield* _(
					query((db) => db.select().from(projectUser).where(eq(projectUser.projectId, p.id)).all())
				);
				expect(userProjectPost[0].balance).toEqual(1);
				yield* _(completeTask(1, newTask.id));
				const userProjectPost2 = yield* _(
					query((db) => db.select().from(projectUser).where(eq(projectUser.projectId, p.id)).all())
				);
				expect(userProjectPost2[0].balance).toEqual(2);
			}).pipe(
				projectServiceProvider,
				taskServiceProvider,
				Effect.provideService(DBService, dbService)
			)
		);
	});
});
