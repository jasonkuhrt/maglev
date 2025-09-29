import { Da } from '#deps/effect'

/**
 * Base error for all Gel database operations
 */
export class GelError extends Da.TaggedError('GelError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

/**
 * Error when a resource is not found
 */
export class NotFoundError extends Da.TaggedError('NotFoundError')<{
  readonly resource: string
  readonly id: string
}> {}

/**
 * Error for validation failures
 */
export class ValidationError extends Da.TaggedError('ValidationError')<{
  readonly message: string
  readonly field?: string
  readonly value?: unknown
}> {}

/**
 * Error for unauthorized access to resources
 */
export class UnauthorizedError extends Da.TaggedError('UnauthorizedError')<{
  readonly resource: string
  readonly userId: string
  readonly ownerId?: string
}> {}

/**
 * Error for database operations
 */
export class DatabaseOperationError extends Da.TaggedError('DatabaseOperationError')<{
  readonly operation: 'insert' | 'update' | 'delete' | 'select'
  readonly table: string
  readonly cause?: unknown
}> {}
