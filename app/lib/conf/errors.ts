import { Da } from '#deps/effect'
import { FsLoc } from '@wollybeard/kit'

/**
 * Base config error
 */
export class ConfigError extends Da.TaggedError('ConfigError')<{
  readonly message: string
  readonly path?: FsLoc.Inputs.Input.File | string
  readonly cause?: unknown
}> {}

/**
 * Config validation error
 */
export class ConfigValidationError extends Da.TaggedError('ConfigValidationError')<{
  readonly message: string
  readonly errors: unknown
  readonly path?: FsLoc.Inputs.Input.File | string
}> {}

/**
 * Config not found error
 */
export class ConfigNotFoundError extends Da.TaggedError('ConfigNotFoundError')<{
  readonly message: string
  readonly searchPlaces: string[]
}> {}

/**
 * Config parse error
 */
export class ConfigParseError extends Da.TaggedError('ConfigParseError')<{
  readonly message: string
  readonly path: FsLoc.Inputs.Input.File | string
  readonly format: string
  readonly cause?: unknown
}> {}
