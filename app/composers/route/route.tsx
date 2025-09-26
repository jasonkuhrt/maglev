import { Config } from '#core/config'
import { Gel } from '#core/gel'
import { Settings } from '#core/settings'
import { Ctx, Ef, type Ei, Lr } from '#deps/effect'
import { Efy } from '#lib/efy'
import { FileSystem } from '@effect/platform'
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem'
import * as React from 'react'

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
 * Runtime for client-side code (loaders, actions, client components)
 * Includes all necessary service layers
 */
const ClientRuntime = Lr.mergeAll(
  NodeFileSystem.layer,
  Config.ConfigServiceLive,
  Gel.ClientLive,
  Settings.ServiceLive,
)

/**
 * Runtime for server components
 * Includes all layers including Node.js-specific ones
 * Note: Railway.ContextLive excluded as it fails eagerly without API token
 */
const ServerRuntime = Lr.mergeAll(
  NodeFileSystem.layer,
  Config.ConfigServiceLive,
  Gel.ClientLive,
  Settings.ServiceLive,
)

// ================
// TYPES
// ================

export type ErrorBoundaryProps = {
  error: Error | unknown
}

type ActionArgs = {
  request: globalThis.Request
  params: Record<string, string | undefined>
}

type LoaderArgs = ActionArgs

type ActionFunction<A> = (args: ActionArgs) => Ef.Effect<A, any, any>
type LoaderFunction<A> = (args: LoaderArgs) => Ef.Effect<A, any, any>

// ================
// SHARED HELPERS
// ================

/**
 * Provides common route context services
 */
const provideRouteContext = <R, E, A>(
  effect: Ef.Effect<A, E, R>,
  args: { request: globalThis.Request; params: Record<string, string | undefined> },
  formDataService?: Ef.Effect<globalThis.FormData, any, any>,
) => {
  let pipeline = effect.pipe(
    Ef.provideService(Request, args.request),
    Ef.provideService(Params, args.params),
    Ef.provideService(Context, {
      request: args.request,
      params: args.params,
    }),
  )

  if (formDataService) {
    pipeline = pipeline.pipe(Ef.provideServiceEffect(FormData, formDataService))
  }

  return pipeline.pipe(Ef.provide(ClientRuntime))
}

// ================
// ACTION & LOADER
// ================

/**
 * Creates a React Router action with Effect runtime
 */
export const action = <A,>(
  fn: Efy.EffectOrGen<
    A,
    any,
    Request | FormData | Params | Context | Config.ConfigService | FileSystem.FileSystem | Settings.Service
  >,
): (args: ActionArgs) => Promise<A> => {
  return async (args: ActionArgs) => {
    // Create FormData service that lazily loads form data
    const formDataService = Ef.suspend(() =>
      Ef.tryPromise({
        try: () => args.request.formData(),
        catch: (error) => new Error(`Failed to parse form data: ${error}`),
      })
    )

    const effect = provideRouteContext(
      Efy.normalizeGenOrEffect(fn),
      args,
      formDataService,
    )

    return Ef.runPromise(effect as Ef.Effect<A, never, never>).catch(e => e)
  }
}

/**
 * Creates a React Router loader with Effect runtime
 */
export const loader = <A,>(
  fn: Efy.EffectOrGen<
    A,
    any,
    Request | Params | Context | Config.ConfigService | FileSystem.FileSystem | Settings.Service
  >,
): (args: LoaderArgs) => Promise<A> => {
  return async (args: LoaderArgs) => {
    const effect = provideRouteContext(
      Efy.normalizeGenOrEffect(fn),
      args,
    ).pipe(
      // Convert to Either to handle both success and failure
      Ef.either,
    )

    // Run the effect and get the Either result
    const either = await Ef.runPromise(effect).catch(e => e)

    // Handle the Either result
    if (either._tag === 'Left') {
      // For errors, return a serializable error object
      const error = either.left
      return {
        _error: true,
        message: error instanceof Error ? error.message : String(error),
      } as A
    }

    // For success, return the value directly
    return either.right
  }
}

// ================
// SERVER COMPONENT
// ================

/**
 * Creates a React Router server component with Effect runtime
 * Supports returning ReactNode (string, number, ReactElement, null, etc.)
 * undefined is converted to null for React compatibility
 */
export const Server = (
  fn: Efy.EffectOrGen<
    React.ReactNode | undefined,
    any,
    Config.ConfigService | FileSystem.FileSystem | Settings.Service
  >,
): React.FC => {
  return async () => {
    // Convert generator function to Effect if needed
    const effect = Efy.normalizeGenOrEffect(fn).pipe(
      // Provide server runtime layers (includes Config and Railway)
      Ef.provide(ServerRuntime),
      // Convert to Either to handle both success and failure
      Ef.either,
    )

    // Run the effect and get the Either result
    const either = await Ef.runPromise(effect).catch(e => e)

    // Handle the Either result
    if (either && typeof either === 'object' && '_tag' in either) {
      if (either._tag === 'Left') {
        // For errors, return an error component
        const error = either.left
        const message = error instanceof Error ? error.message : String(error)
        return (
          <div style={{ padding: '2rem', border: '1px solid red', backgroundColor: '#fee' }}>
            <h2>Server Component Error</h2>
            <p>{message}</p>
          </div>
        )
      }
      // For success, return the component (convert undefined to null for React)
      const result = either.right
      return result === undefined ? null : result
    }

    // Handle unexpected errors (including caught promise rejections)
    const message = either instanceof Error ? either.message : 'An unexpected error occurred'
    return (
      <div style={{ padding: '2rem', border: '1px solid red', backgroundColor: '#fee' }}>
        <h2>Server Component Error</h2>
        <p>{message}</p>
      </div>
    )
  }
}
