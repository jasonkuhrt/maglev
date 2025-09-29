import { Da } from '#deps/effect'

/**
 * Tagged error for missing Railway API token.
 * This error is returned by the anyware middleware when no token is configured.
 */
export class MissingApiTokenError extends Da.TaggedError('MissingApiTokenError')<{
  readonly message: string
}> {
  constructor() {
    super({
      message: 'Railway API token not configured. Please set it in Settings.',
    })
  }
}

export class RailwayError extends Da.TaggedError('RailwayError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

export class RailwayApiTokenError extends Da.TaggedError('RailwayApiTokenError')<{
  readonly message: string
}> {
  constructor() {
    super({
      message: 'Railway API token not configured. Set RAILWAY_API_TOKEN or configure in settings.',
    })
  }
}

/**
 * Error when no workspace is found for the Railway account
 */
export class WorkspaceNotFoundError extends Da.TaggedError('WorkspaceNotFoundError')<{
  readonly accountId?: string
  readonly message?: string
}> {}

/**
 * Error when template deployment fails
 */
export class TemplateDeploymentError extends Da.TaggedError('TemplateDeploymentError')<{
  readonly templateCode: string
  readonly workspaceId: string
  readonly message?: string
  readonly cause?: unknown
}> {}

/**
 * Error when template query fails
 */
export class TemplateNotFoundError extends Da.TaggedError('TemplateNotFoundError')<{
  readonly templateCode: string
  readonly cause?: unknown
}> {}
