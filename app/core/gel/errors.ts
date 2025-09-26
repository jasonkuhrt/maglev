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
