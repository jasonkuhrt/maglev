import { Da } from '#deps/effect.js'

export class DatabaseError extends Da.TaggedError('DatabaseError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

export class DatabaseConnectionError extends Da.TaggedError('DatabaseConnectionError')<{
  readonly message: string
}> {}

export class RecordNotFoundError extends Da.TaggedError('RecordNotFoundError')<{
  readonly resource: string
  readonly id?: string
}> {}
