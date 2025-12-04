import type { UUID } from '$lib/types';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth-schema';

export const profile = sqliteTable(
	'profile',
	{
		id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		publicId: text('public_id').notNull().unique().$type<UUID>(),
		name: text('name').notNull().unique(),
		nick: text('nick').notNull(),
		pin: integer('pin').notNull(),
		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		active: integer('active', { mode: 'boolean' }).notNull().default(false),
		password: text('password').notNull()
	},
	(t) => [uniqueIndex('uniq_nick_pin').on(t.nick, t.pin)]
);

export const userFriend = sqliteTable(
	'profile_friend',
	{
		profileFrom: integer('profile_from_id', { mode: 'number' }).references(() => profile.id),
		profileTo: integer('profile_to_id', { mode: 'number' }).references(() => profile.id),
		acceptedAt: text('accepted_at'),
		rejectedAt: text('rejected_at'),
		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => [uniqueIndex('uniq_profile_friend').on(t.profileFrom, t.profileTo)]
);

export const project = sqliteTable('project', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	publicId: text('public_id').notNull().unique().$type<UUID>(),
	name: text('name').notNull(),
	description: text('description').default(sql`NULL`),
	isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	changedAt: text('changed_at').default(sql`CURRENT_TIMESTAMP`),
	changedBy: integer('changed_by')
		.notNull()
		.references(() => profile.id),
	version: integer('version').notNull().default(1)
});

export const projectHistory = sqliteTable(
	'project_history',
	{
		projectId: integer('project_id')
			.notNull()
			.references(() => project.id),
		name: text('name').notNull(),
		description: text('description').default(sql`NULL`),
		isActive: integer('is_active', { mode: 'boolean' }).default(true),
		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		createdBy: integer('created_by')
			.notNull()
			.references(() => profile.id),
		version: integer('version').notNull().default(1)
	},
	(t) => [
		uniqueIndex('uniq_project_history_id_version').on(t.projectId, t.version),
		index('created_project_history_idx').on(t.createdAt)
	]
);

export const projectUser = sqliteTable(
	'project_user',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => profile.id),
		projectId: integer('project_id')
			.notNull()
			.references(() => project.id),
		role: text('role').notNull(),
		balance: integer('balance', { mode: 'number' }).notNull().default(0)
	},
	(t) => [uniqueIndex('uniq_project_user').on(t.projectId, t.userId)]
);

export const store = sqliteTable('store', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id),
	name: text('name').notNull()
});

export const storeItem = sqliteTable('store_item', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	storeId: integer('store_id')
		.notNull()
		.references(() => project.id),
	name: text('name').notNull(),
	price: integer('price', { mode: 'number' }).notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

export const storePurchase = sqliteTable('store_purchase', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	itemId: integer('item_id')
		.references(() => storeItem.id)
		.notNull(),
	userId: integer('user_id')
		.references(() => profile.id)
		.notNull(),
	price: integer('price').notNull(),
	date: text('date')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const task = sqliteTable('task', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description').default(sql`NULL`),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id),
	isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
	reward: integer('reward').notNull().default(1),
	createdAt: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdBy: integer('created_by')
		.notNull()
		.references(() => profile.id),
	changedAt: text('changed_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	version: integer('version').notNull().default(1)
});

export const taskHistory = sqliteTable(
	'task_history',
	{
		taskId: integer('task_id')
			.notNull()
			.references(() => task.id),
		name: text('name').notNull(),
		description: text('description').default(sql`NULL`),
		reward: integer('reward').notNull().default(1),
		isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		createdBy: integer('created_by')
			.notNull()
			.references(() => profile.id),
		version: integer('version').notNull().default(1)
	},
	(t) => [
		uniqueIndex('uniq_task_history_id_version').on(t.taskId, t.version),
		index('created_task_history_idx').on(t.createdAt)
	]
);

export const taskUser = sqliteTable('task_user', {
	taskId: integer('task_id', { mode: 'number' })
		.notNull()
		.references(() => task.id),
	taskVersion: integer('task_version').notNull().default(1),
	userId: integer('user_id')
		.notNull()
		.references(() => profile.id),
	date: text('date')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	reward: integer('reward', { mode: 'number' }).notNull().default(1)
});
