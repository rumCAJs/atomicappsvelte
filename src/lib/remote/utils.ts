import type { BaseError } from '$lib/errors';
import { auth } from '$lib/server/auth';
import { Cause } from 'effect';
import type { Cause as EffectCause } from 'effect/Cause';

export async function authCommand(headers: Headers) {
	const session = await auth.api.getSession({
		headers
	});

	if (session) {
		return session.user;
	}

	return null;
}

export type UserAuthCommand = NonNullable<Awaited<ReturnType<typeof authCommand>>>;

// ============ Error Handling ============

type AppErrorTag =
	| 'DbError'
	| 'UserNotFoundError'
	| 'FriendError'
	| 'LoginError'
	| 'SessionError'
	| 'StoreNotFoundError'
	| 'StoreError'
	| 'ProjectServiceError'
	| 'ProjectNotFoundError'
	| 'ProjectUserError'
	| 'ProjectUpdateError'
	| 'TaskNotFoundError'
	| 'TaskUpdateError'
	| 'JWTError';

const userFriendlyMessages: Record<AppErrorTag, string> = {
	DbError: 'A database error occurred. Please try again later.',
	UserNotFoundError: 'User not found.',
	FriendError: 'An error occurred with friend operation.',
	LoginError: 'Login failed. Please check your credentials.',
	SessionError: 'Session expired or invalid. Please log in again.',
	StoreNotFoundError: 'Store not found.',
	StoreError: 'An error occurred with the store operation.',
	ProjectServiceError: 'An error occurred with the project service.',
	ProjectNotFoundError: 'Project not found.',
	ProjectUserError: 'An error occurred with project user operation.',
	ProjectUpdateError: 'Failed to update the project.',
	TaskNotFoundError: 'Task not found.',
	TaskUpdateError: 'Failed to update the task.',
	JWTError: 'Authentication token is invalid. Please log in again.'
};

export interface SanitizedError {
	_tag: AppErrorTag | 'UnknownError';
	message: string;
}

const httpStatusCodes: Record<AppErrorTag | 'UnknownError', number> = {
	DbError: 500,
	UserNotFoundError: 404,
	FriendError: 400,
	LoginError: 401,
	SessionError: 401,
	StoreNotFoundError: 404,
	StoreError: 400,
	ProjectServiceError: 500,
	ProjectNotFoundError: 404,
	ProjectUserError: 403,
	ProjectUpdateError: 422,
	TaskNotFoundError: 404,
	TaskUpdateError: 422,
	JWTError: 401,
	UnknownError: 500
};

export interface ParsedExitError {
	message: string;
	status: number;
}

/**
 * Parses an Effect cause and returns a sanitized error with user-friendly message.
 * Logs the original error for debugging while stripping sensitive data from the returned error.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEffectError<TError extends BaseError<any>>(error: TError): SanitizedError {
	const errorTag = error._tag as AppErrorTag | undefined;

	// Log the full error for debugging
	console.error(`[parseEffectError] Application error [${errorTag}]:`, error);

	if (errorTag && errorTag in userFriendlyMessages) {
		return {
			_tag: errorTag,
			message: userFriendlyMessages[errorTag]
		};
	}

	// Log unknown error structure
	console.error('[parseEffectError] Unrecognized error structure:', error);

	return {
		_tag: 'UnknownError',
		message: 'An unexpected error occurred. Please try again.'
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseExitError<E extends BaseError<any>>(cause: EffectCause<E>): ParsedExitError {
	return Cause.match(cause, {
		onEmpty: { message: 'Empty Case Error', status: 500 },
		onFail: (error) => {
			const userFacingError = parseEffectError(error);
			return {
				message: `(${userFacingError._tag}: ${userFacingError.message})`,
				status: httpStatusCodes[userFacingError._tag]
			};
		},
		onDie: (defect) => ({ message: `(defect: ${defect})`, status: 500 }),
		onInterrupt: (fiberId) => ({ message: `(fiberId: ${fiberId})`, status: 500 }),
		onSequential: (left, right) => ({
			message: `(onSequential (left: ${left.message}) (right: ${right.message}))`,
			status: Math.max(left.status, right.status)
		}),
		onParallel: (left, right) => ({
			message: `(onParallel (left: ${left.message}) (right: ${right.message}))`,
			status: Math.max(left.status, right.status)
		})
	});
}

/**
 * Creates a throwable Error from SanitizedError for use with SvelteKit commands
 */
export class AppError extends Error {
	readonly _tag: SanitizedError['_tag'];

	constructor(sanitizedError: SanitizedError) {
		super(sanitizedError.message);
		this._tag = sanitizedError._tag;
		this.name = 'AppError';
	}
}
