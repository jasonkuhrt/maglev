import { Ctx, Ef, Lr } from '#deps/effect'
import * as Railway from './create.js'

/**
 * Context tag for Railway GraphQL client - now holds the plain client
 * Routes will handle async-to-Effect conversion via Ef.tryPromise
 */
export class Context extends Ctx.Tag('RailwayClient')<
  Context,
  Railway.Client
>() {}

/**
 * Live implementation of Railway client
 * Simply provides the Graffle client - token is set by loaders when needed
 */
export const ContextLive = Lr.effect(
  Context,
  Ef.gen(function*() {
    // Just return the client - token will be set by context
    return Railway.create()
  }),
)
