import { Config } from '#core/config'
import { Ctx, Ef, Lr } from '#deps/effect'
import { FileSystem } from '@effect/platform'
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem'

// ================
// CONTEXT TAGS
// ================

/**
 * Context tag for accessing the current request
 */
export class Request extends Ctx.Tag('Route.Request')<Request, globalThis.Request>() {}

/**
 * Context tag for accessing parsed form data
 */
export class FormData extends Ctx.Tag('Route.FormData')<FormData, globalThis.FormData>() {}

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

// ================
// RUNTIME
// ================

/**
 * Pre-configured runtime with common layers
 */
const AppRuntime = Lr.mergeAll(
  NodeFileSystem.layer,
  Config.ConfigServiceLive,
)

// ================
// TYPES
// ================

type ActionArgs = {
  request: globalThis.Request
  params: Record<string, string | undefined>
}

type LoaderArgs = ActionArgs

type ActionFunction<A> = (args: ActionArgs) => Ef.Effect<A, any, any>
type LoaderFunction<A> = (args: LoaderArgs) => Ef.Effect<A, any, any>

// ================
// ACTION & LOADER
// ================

/**
 * Creates a React Router action with Effect runtime
 *
 * @example
 * ```typescript
 * // Using generator function directly
 * export const action = Route.action(function* () {
 *   const formData = yield* Route.FormData
 *   const value = formData.get('field')
 *   // ...
 *   return { success: true }
 * })
 *
 * // Or using Effect
 * export const action = Route.action(() =>
 *   Ef.succeed({ success: true })
 * )
 * ```
 */
export const action = <A>(
  fn: (() => Ef.Effect<A, any, Request | FormData | Params | Context | Config.ConfigService | FileSystem.FileSystem>) |
      (() => Generator<any, A, any>),
): ((args: ActionArgs) => Promise<A>) => {
  return async (args: ActionArgs) => {
    // Create FormData service that lazily loads form data
    const formDataService = Ef.suspend(() =>
      Ef.tryPromise({
        try: () => args.request.formData(),
        catch: (error) => new Error(`Failed to parse form data: ${error}`),
      })
    )

    // Convert generator to Effect if needed
    const result = fn()
    const effect = (
      // Check if it's a generator
      result && typeof result === 'object' && Symbol.iterator in result
        ? Ef.gen(() => result as Generator<any, A, any>)
        : result as Ef.Effect<A, any, any>
    ).pipe(
      // Provide route context services
      Ef.provideService(Request, args.request),
      Ef.provideServiceEffect(FormData, formDataService),
      Ef.provideService(Params, args.params),
      Ef.provideService(Context, {
        request: args.request,
        params: args.params,
      }),
      // Provide app runtime layers
      Ef.provide(AppRuntime),
    )

    return Ef.runPromise(effect as Ef.Effect<A, never, never>)
  }
}

/**
 * Creates a React Router loader with Effect runtime
 *
 * @example
 * ```typescript
 * // Using generator function directly
 * export const loader = Route.loader(function* () {
 *   const service = yield* Config.ConfigService
 *   const data = yield* service.read
 *   return { data }
 * })
 *
 * // Or using Effect
 * export const loader = Route.loader(() =>
 *   Ef.succeed({ data: "static" })
 * )
 * ```
 */
export const loader = <A>(
  fn: (() => Ef.Effect<A, any, Request | Params | Context | Config.ConfigService | FileSystem.FileSystem>) |
      (() => Generator<any, A, any>),
): ((args: LoaderArgs) => Promise<A>) => {
  return async (args: LoaderArgs) => {
    // Convert generator to Effect if needed
    const result = fn()
    const effect = (
      // Check if it's a generator
      result && typeof result === 'object' && Symbol.iterator in result
        ? Ef.gen(() => result as Generator<any, A, any>)
        : result as Ef.Effect<A, any, any>
    ).pipe(
      // Provide route context services (no FormData for loaders)
      Ef.provideService(Request, args.request),
      Ef.provideService(Params, args.params),
      Ef.provideService(Context, {
        request: args.request,
        params: args.params,
      }),
      // Provide app runtime layers
      Ef.provide(AppRuntime),
    )

    return Ef.runPromise(effect as Ef.Effect<A, never, never>)
  }
}

// ================
// NAMESPACE EXPORT
// ================

export const Route = {
  // Context tags
  Request,
  FormData,
  Params,
  Context,
  // Functions
  action,
  loader,
} as const