import { Effect, Context } from 'effect';
// import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
// import { Database } from "bun:sqlite";
// import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import Database, { type Database as BSDatabase } from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DbError } from '$lib/errors';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export class DBService extends Context.Tag('DBService')<
	DBService,
	{
		readonly connection: BSDatabase;
		readonly db: BetterSQLite3Database;
		readonly query: <T>(
			cb: (db: BetterSQLite3Database) => T
		) => Effect.Effect<T, DbError<unknown>, never>;
		readonly queryPromise: <T>(
			cb: (db: BetterSQLite3Database) => Promise<T>
		) => Effect.Effect<T, DbError<unknown>, never>;
	}
>() {}

export type DBServiceType = Context.Tag.Service<DBService>;

export function createDBService(
	databaseUrl: string,
	migrateOnStart = false,
	migrationFolder?: string
) {
	const connection = new Database(databaseUrl);
	const db = drizzle(connection);

	if (migrateOnStart) {
		migrate(db, {
			migrationsFolder: migrationFolder ?? process.env.MIGRATION_FOLDER_PATH
		});
	}

	const dbService = DBService.of({
		connection,
		db,
		query: (cb) => {
			return Effect.try({
				try: () => cb(db),
				catch: (e) => new DbError('something went wront in DB land', e)
			});
		},
		queryPromise: (cb) => {
			return Effect.tryPromise({
				try: () => cb(db),
				catch: (e) => {
					console.error(e);
					return new DbError('something went wront in DB land', e);
				}
			});
		}
	});

	return {
		db,
		connection,
		dbService,
		dbServiceProvider: Effect.provideService(DBService, dbService)
	};
}
