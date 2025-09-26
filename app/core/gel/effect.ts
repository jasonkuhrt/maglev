import { Ctx, Lr } from '#deps/effect'
import * as GelLib from 'gel'

/**
 * Context tag for Gel client service
 * This provides dependency injection for the database client
 */
export class Client extends Ctx.Tag('GelClient')<
  Client,
  { readonly client: GelLib.Client }
>() {}

/**
 * Live implementation of GelClient
 * This layer is provided to server components via ServerRuntime
 * Uses createHttpClient for browser/edge compatibility
 */
export const ClientLive = Lr.succeed(
  Client,
  {
    client: typeof window !== 'undefined'
      ? GelLib.createHttpClient() // Browser/edge runtime
      : GelLib.createClient(), // Node.js server runtime
  },
)
