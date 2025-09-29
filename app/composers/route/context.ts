import { Ctx } from '#deps/effect'

// ================
// SHARED CONTEXT TAGS
// ================

/**
 * Context tag for accessing the current request (available in loaders/actions)
 */
export class Request extends Ctx.Tag('Route.Request')<Request, globalThis.Request>() {}

/**
 * Context tag for accessing route params
 */
export class Params extends Ctx.Tag('Route.Params')<Params, Record<string, string | undefined>>() {}

/**
 * Context tag for accessing the full route context
 */
export class Context extends Ctx.Tag('Route.Context')<
  Context,
  {
    request: globalThis.Request
    params: Record<string, string | undefined>
  }
>() {}

/**
 * Context tag for accessing parsed form data (only in actions)
 */
export class FormData extends Ctx.Tag('Route.FormData')<FormData, globalThis.FormData>() {}
