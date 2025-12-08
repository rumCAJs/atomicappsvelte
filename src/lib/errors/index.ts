// ============================
// Base Error Class
// ============================

export class BaseError<T extends string> extends Error {
  readonly _tag: T
  constructor(_tag: T, message?: string) {
    super(message)
    this._tag = _tag
  }

  toJSON() {
    const { _tag, message } = this
    return {
      _tag,
      ...(message && { message }),
    }
  }
}

// ============================
// Database Related Errors
// ============================

/**
 * Generic Database Error
 */
export class DbError<TError> extends BaseError<'DbError'> {
  constructor(
    public message: string,
    public error: TError,
    public internalMsg?: string
  ) {
    super('DbError', message)
  }

  toJSON() {
    const baseJson = super.toJSON()
    return {
      ...baseJson,
      error: this.error,
      ...(this.internalMsg && { internalMsg: this.internalMsg }),
    }
  }
}

// ============================
// User Related Errors
// ============================

/**
 * Error indicating User Not Found
 */
export class UserNotFoundError extends BaseError<'UserNotFoundError'> {
  constructor() {
    super('UserNotFoundError')
  }
}

export class FriendError extends BaseError<'FriendError'> {
  constructor(message?: string) {
    super('FriendError', message)
  }
}

/**
 * Error related to User Login
 */
export class LoginError extends BaseError<'LoginError'> {
  constructor() {
    super('LoginError')
  }
}

export class SessionError extends BaseError<'SessionError'> {
  constructor(public message: string) {
    super('SessionError', message)
  }
}

// ============================
// Store Related Errors
// ============================

/**
 * Error indicating Store Not Found
 */
export class StoreNotFoundError extends BaseError<'StoreNotFoundError'> {
  constructor() {
    super('StoreNotFoundError')
  }
}

/**
 * Generic Store Error
 */
export class StoreError extends BaseError<'StoreError'> {
  constructor(public msg: string) {
    super('StoreError', msg)
  }
}

// ============================
// Project Related Errors
// ============================

/**
 * Generic Project Service Error
 */
export class ProjectServiceError extends BaseError<'ProjectServiceError'> {
  constructor() {
    super('ProjectServiceError')
  }
}

/**
 * Error indicating Project Not Found
 */
export class ProjectNotFoundError extends BaseError<'ProjectNotFoundError'> {
  constructor() {
    super('ProjectNotFoundError')
  }
}

/**
 * Error related to Project User
 */
export class ProjectUserError extends BaseError<'ProjectUserError'> {
  constructor(public msg: string) {
    super('ProjectUserError', msg)
  }
}

export class ProjectUpdateError extends BaseError<'ProjectUpdateError'> {
  constructor(public msg: string) {
    super('ProjectUpdateError', msg)
  }
}

// ============================
// Task Related Errors
// ============================

/**
 * Error indicating Task Not Found
 */
export class TaskNotFoundError extends BaseError<'TaskNotFoundError'> {
  constructor() {
    super('TaskNotFoundError')
  }
}

export class TaskUpdateError extends BaseError<'TaskUpdateError'> {
  constructor(public msg: string) {
    super('TaskUpdateError', msg)
  }
}

// ============================
// JWT and Authentication Errors
// ============================

/**
 * Error related to JWT tokens
 */
export class JWTError extends BaseError<'JWTError'> {
  constructor() {
    super('JWTError')
  }
}
