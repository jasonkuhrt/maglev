import { Config } from '#core/config'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Settings } from '#core/settings'
import { Ef, type Ei } from '#deps/effect'
import { Efy } from '#lib/efy'
import { Railway } from '#lib/railway'
import { FileSystem } from '@effect/platform'
import { Err } from '@wollybeard/kit'
import { Context, Params, Request } from './context.js'
import { provideRouteServices } from './shared-runtime.js'

// ================
// TYPES
// ================

type LoaderArgs = {
  request: globalThis.Request
  params: Record<string, string | undefined>
}

// ================
// HELPERS
// ================

/**
 * Provides loader-specific services and common route services
 */
const provideLoaderContext = <R, E, A>(
  effect: Ef.Effect<A, E, R>,
  args: { request: globalThis.Request; params: Record<string, string | undefined> },
) => {
  // Create request info for session
  const requestInfo: Session.RequestInfoData = {
    url: args.request.url,
    headers: Object.fromEntries(args.request.headers.entries()),
  }

  return effect.pipe(
    // Provide loader-specific services
    Ef.provideService(Request, args.request),
    Ef.provideService(Params, args.params),
    Ef.provideService(Context, {
      request: args.request,
      params: args.params,
    }),
    Ef.provideService(Session.RequestInfo, requestInfo),
    // Provide all common route services
    provideRouteServices(requestInfo),
  )
}

// ================
// DEFAULT LOADER
// ================

/**
 * Default loader that passes serializable request data for ServerComponent access
 */
export const defaultLoader = async (args: LoaderArgs) => ({
  request: {
    url: args.request.url,
    headers: Object.fromEntries(args.request.headers.entries()),
  } satisfies Session.RequestInfoData,
  params: args.params,
})

// ================
// LOADER
// ================

/**
 * Creates a React Router loader with full Effect runtime support
 *
 * Loaders run on the server before rendering and are responsible for:
 * - Fetching data needed by the route
 * - Checking authentication/authorization
 * - Redirecting when necessary
 * - Setting up API tokens and services
 *
 * @template A The type of data returned by the loader
 * @param fn Optional Effect generator or Effect that produces loader data
 * @returns React Router loader function
 *
 * @example Basic loader with authentication check
 * ```typescript
 * export const loader = Route.loader(function*() {
 *   const session = yield* Session.Context
 *   const user = yield* session.getUser() // Throws if not authenticated
 *
 *   return { user }
 * })
 * ```
 *
 * @example Fetching data from database
 * ```typescript
 * export const loader = Route.loader(function*() {
 *   const gel = yield* Gel.Client
 *   const params = yield* Route.Params
 *
 *   const project = yield* Ef.tryPromise({
 *     try: () => Gel.$.select(Gel.$.Project, p => ({
 *       filter_single: Gel.$.op(p.id, '=', Gel.$.uuid(params.id)),
 *       id: true,
 *       name: true,
 *       createdAt: true
 *     })).run(gel.client),
 *     catch: (cause) => new Error('Failed to load project', { cause })
 *   })
 *
 *   if (!project) {
 *     return redirect('/projects')
 *   }
 *
 *   return { project }
 * })
 * ```
 *
 * @example Default loader (no custom logic)
 * ```typescript
 * // Just passes request info to ServerComponent
 * export const loader = Route.loader()
 * ```
 *
 * @example Handling optional authentication
 * ```typescript
 * export const loader = Route.loader(function*() {
 *   const session = yield* Session.Context
 *   const user = yield* session.getUserMaybe() // Returns null if not authenticated
 *
 *   return { user }
 * })
 * ```
 *
 * @remarks
 * - Always provides request info for ServerComponents automatically
 * - Railway API token is loaded automatically if user has configured it in settings
 * - Railway.Context service is available for making Railway API calls
 * - Errors are serialized and passed to the route for error handling
 * - Returns can be Response objects (for redirects) or serializable data
 */
export const loader = <A = any>(
  fn?: Efy.EffectOrGen<
    A,
    any,
    | Request
    | Params
    | Context
    | Config.ConfigService
    | FileSystem.FileSystem
    | Settings.Service
    | Session.Context
    | Gel.Client
    | Railway.Context
  >,
): (args: LoaderArgs) => Promise<A> => {
  return async (args: LoaderArgs) => {
    // Always create the default loader data
    const defaultData = {
      request: {
        url: args.request.url,
        headers: Object.fromEntries(args.request.headers.entries()),
      } satisfies Session.RequestInfoData,
      params: args.params,
    }

    // Set up Railway token if user is authenticated
    // This runs as a side effect to ensure Railway API is ready
    const requestInfo: Session.RequestInfoData = {
      url: args.request.url,
      headers: Object.fromEntries(args.request.headers.entries()),
    }

    // Try to load and set Railway token
    await Ef.runPromise(
      Ef.gen(function*() {
        const session = yield* Session.Context
        const user = yield* session.getUserMaybe()

        if (user) {
          const settings = yield* Settings.Service
          const userSettings = yield* settings.read(user.githubId).pipe(
            Ef.catchAll(() => Ef.succeed({ railwayApiToken: null, theme: Settings.Theme.system })),
          )

          if (userSettings.railwayApiToken) {
            Railway.setToken(userSettings.railwayApiToken)
          }
        }
      }).pipe(
        provideRouteServices(requestInfo),
        Ef.catchAll(() => Ef.succeed(null)), // Silently handle errors - token loading is optional
      ),
    )

    // If no function provided, return just the default data
    if (!fn) {
      return defaultData as A
    }

    // Run the custom loader function
    const normalizedEffect = Efy.normalizeGenOrEffect(fn)

    const effect = provideLoaderContext(
      normalizedEffect,
      args,
    ).pipe(
      // Convert to Either to handle both success and failure
      Ef.either,
    ) as Ef.Effect<Ei.Either<A, any>, never, never>

    // Run the effect and get the Either result
    const either = await Ef.runPromise(effect).catch(e => e)

    // Handle the Either result
    if (either._tag === 'Left') {
      // For errors, return a serializable error object with default data
      const error = either.left

      if (import.meta.env.DEV) {
        Err.log(error)
      }

      return {
        ...defaultData,
        _error: true,
        message: error instanceof Error ? error.message : String(error),
      } as A
    }

    // For success, return the custom result
    const customResult = either.right

    // If it's a Response (like redirect), return it as-is
    if (customResult instanceof Response) {
      return customResult as A
    }

    // If custom result is an object (but not Response), merge with default data
    if (customResult && typeof customResult === 'object' && !Array.isArray(customResult)) {
      return {
        ...defaultData,
        ...customResult,
      } as A
    }

    // Otherwise, return custom result with default data attached
    return {
      ...defaultData,
      data: customResult,
    } as A
  }
}
