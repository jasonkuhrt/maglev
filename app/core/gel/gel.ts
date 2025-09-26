import { Config } from '#core/config'
import { Ctx, Ef, Lr } from '#deps/effect'
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem'
import { type Client, createClient } from 'edgedb'
import { GelError } from './errors.js'

/**
 * Context tag for EdgeDB client service
 * This provides dependency injection for the database client
 */
export class GelClient extends Ctx.Tag('GelClient')<
  GelClient,
  { readonly client: Client }
>() {}

/**
 * Live implementation of GelClient that reads DSN from config
 * This layer is automatically provided to all routes via AppRuntime
 */
export const GelClientLive = Lr.effect(
  GelClient,
  Ef.gen(function*() {
    // For local development, EdgeDB can auto-detect the project instance
    // In production, we'll use the DSN from config
    const configService = yield* Config.ConfigService
    const config = yield* configService.read

    const client = config.gelDsn
      ? createClient({ dsn: config.gelDsn })
      : createClient() // Auto-detect local instance

    // Test the connection
    yield* Ef.tryPromise({
      try: async () => {
        await client.ensureConnected()
      },
      catch: (error) =>
        new GelError({
          message: 'Failed to connect to EdgeDB',
          cause: error,
        }),
    })

    return { client }
  }),
).pipe(
  Lr.provideMerge(Config.ConfigServiceLive),
  Lr.provideMerge(NodeFileSystem.layer),
)
