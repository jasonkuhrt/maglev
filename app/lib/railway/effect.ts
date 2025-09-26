import { Ctx, Ef, Lr } from '#deps/effect'
import * as Railway from './railway'

/**
 * Context tag for Railway GraphQL client
 */
export class Context extends Ctx.Tag('RailwayClient')<
  Context,
  Railway.Client
>() {}

/**
 * Live implementation of Railway client
 */
export const ContextLive = Lr.effect(Context,
  Ef.sync(() => Railway.create())
)

/**
 * Wrapper for Graffle operations that handles common error patterns
 */
export const toEffect = <T>(operation: Promise<T>) =>
  Ef.tryPromise({
    try: () => operation,
    catch: (error) => {
      // Check if it's an environment variable error
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as any).message
        if (message?.includes('RAILWAY_API_TOKEN') || message?.includes('MAGLEV_RAILWAY_API_TOKEN')) {
          return new Error(
            'Railway API token not configured. Please set RAILWAY_API_TOKEN or MAGLEV_RAILWAY_API_TOKEN environment variable.',
          )
        }
      }
      return error as Error
    },
  })
