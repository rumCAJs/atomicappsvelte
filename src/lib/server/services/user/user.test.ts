import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Effect, Option } from "effect";
import { DBService, createDBService } from "../db";
import { UserService, userService, userServiceProvider } from ".";
import { jwtServiceProvider } from "../jwt";
import { unlinkSync } from "node:fs";
import type { UUID } from "@/types";

const dbName = "testuser.db";
try {
  unlinkSync(dbName);
} catch (e) {}

const { dbService } = createDBService(dbName, true, "./drizzle");
const dbServiceProvider = Effect.provideService(DBService, dbService);

describe("User service", () => {
  afterAll(async () => {
    unlinkSync(dbName);
  });

  it("should return if user exists", async () => {
    const exists1 = Effect.gen(function* (_) {
      const { exists } = yield* _(UserService);
      const ex = yield* _(exists("aaa" as UUID));
      expect(ex).toBeFalsy();
      return ex;
    });

    const runnableExists1 = exists1.pipe(
      Effect.provideService(UserService, userService),
      Effect.provideService(DBService, dbService),
    );

    Effect.runSync(runnableExists1);

    const createUserProgram = Effect.gen(function* (_) {
      const { create } = yield* _(UserService);
      const newUser = yield* _(create("jp", "nick", "lol"));
      expect(newUser).toBeTruthy();
      return newUser;
    });

    const runnableCreateUser = createUserProgram.pipe(
      Effect.provideService(UserService, userService),
      Effect.provideService(DBService, dbService),
    );
    const userOption = await Effect.runPromise(runnableCreateUser);
    if (Option.isNone(userOption)) {
    }

    const user = Option.match(userOption, {
      onNone: () => {
        throw new Error("user must exists");
      },
      onSome: (u) => u,
    });

    const exists2 = Effect.gen(function* (_) {
      const { exists } = yield* _(UserService);
      const ex = yield* _(exists(user.publicId));
      expect(ex).toBeTruthy();
      return ex;
    });

    const runnableExists2 = exists2.pipe(
      Effect.provideService(UserService, userService),
      Effect.provideService(DBService, dbService),
    );

    Effect.runSync(runnableExists2);
  });

  it("should create new user", () => {
    const program = Effect.gen(function* (_) {
      const { create } = yield* _(UserService);
      const newUser = yield* _(create("jp1", "nick", "lol"));
      expect(newUser).toBeTruthy();
      return newUser;
    });

    const runnable = program.pipe(
      Effect.provideService(UserService, userService),
      Effect.provideService(DBService, dbService),
    );
    const a = Effect.runPromise(runnable);
  });

  it("should fail to log nonexisting user", async () => {
    await Effect.runPromise(
      Effect.gen(function* (_) {
        const { login } = yield* _(UserService);
        const cb = vi.fn(() => {});
        yield* _(
          login("nonexistinguser", "lol"),
          Effect.match({
            onFailure: cb,
            onSuccess: () => console.log("onsuccess"),
          }),
        );

        expect(cb).toHaveBeenCalled();
      }).pipe(userServiceProvider, jwtServiceProvider, dbServiceProvider),
    );
  });

  it("should fail to log existing user with wrong password", async () => {
    const name = "usertestwrongpwd";
    const pwd = "lol";
    await Effect.runPromise(
      Effect.gen(function* (_) {
        const { create, login } = yield* _(UserService);
        yield* _(create(name, "nick", pwd));
        const cbFail = vi.fn(() => {});
        const cbSucc = vi.fn(() => {});
        yield* _(
          login(name, "lolo"),
          Effect.match({
            onFailure: cbFail,
            onSuccess: cbSucc,
          }),
        );

        expect(cbFail).toHaveBeenCalled();
        expect(cbSucc).not.toHaveBeenCalled();
      }).pipe(userServiceProvider, jwtServiceProvider, dbServiceProvider),
    );
  });

  it("should log in user", async () => {
    const name = "jplogin";
    const pwd = "lol";
    const program = Effect.gen(function* (_) {
      const { create } = yield* _(UserService);
      yield* _(create(name, "nick", pwd));
    });

    const runnable = program.pipe(
      Effect.provideService(UserService, userService),
      Effect.provideService(DBService, dbService),
    );
    await Effect.runPromise(runnable);

    await Effect.runPromise(
      Effect.gen(function* (_) {
        const { login } = yield* _(UserService);
        const token = yield* _(login(name, pwd));
        expect(token).toBeTypeOf("string");
        expect(token.length).toBeGreaterThan(20);
      }).pipe(userServiceProvider, jwtServiceProvider, dbServiceProvider),
    );
  });
});
