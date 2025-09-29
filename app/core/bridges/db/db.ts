import * as Gel from 'gel'

/**
 * Create database client based on environment.
 * Routes will handle Effect conversion via Ef.tryPromise when needed.
 */
export const createDbClient = (): Gel.Client => {
  return typeof window !== 'undefined'
    ? Gel.createHttpClient()
    : Gel.createClient()
}

/**
 * Default database client instance.
 * Routes can use this directly with Ef.tryPromise for Effect integration.
 */
export const db = createDbClient()
