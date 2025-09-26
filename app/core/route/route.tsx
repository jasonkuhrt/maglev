import { Config } from '#core/config'
import { Gel } from '#core/gel'
import { Ctx, Ef, type Ei, Lr } from '#deps/effect'
import { Railway } from '#lib/railway'
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
 * Pre-configured runtime with common layers
 */
const AppRuntime = Lr.mergeAll(
  NodeFileSystem.layer,
  Config.ConfigServiceLive,
  Railway.ContextLive,
  Gel.GelClientLive,
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
 */
export const action = <A,>(
  fn:
    | (() => Ef.Effect<A, any, Request | FormData | Params | Context | Config.ConfigService | FileSystem.FileSystem>)
    | (() => Generator<any, A, any>),
): (args: ActionArgs) => Promise<A> => {
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

    return Ef.runPromise(effect as Ef.Effect<A, never, never>).catch(e => e)
  }
}

/**
 * Creates a React Router loader with Effect runtime
 */
export const loader = <A,>(
  fn:
    | (() => Ef.Effect<A, any, Request | Params | Context | Config.ConfigService | FileSystem.FileSystem>)
    | (() => Generator<any, A, any>),
): (args: LoaderArgs) => Promise<A> => {
  return async (args: LoaderArgs) => {
    // Convert generator to Effect if needed
    const generatorOrEffect = fn()
    const effect = (
      // Check if it's a generator
      generatorOrEffect && typeof generatorOrEffect === 'object' && Symbol.iterator in generatorOrEffect
        ? Ef.gen(() => generatorOrEffect as Generator<any, A, any>)
        : generatorOrEffect as Ef.Effect<A, any, any>
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
      // Convert to Either to handle both success and failure
      Ef.either,
    )

    // Run the effect and get the Either result
    const either = await Ef.runPromise(effect as Ef.Effect<Ei.Either<any, A>, never, never>).catch(e => e)

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
 */
export const Server = <Props = {}>(
  fn:
    | ((props: Props) => Ef.Effect<React.ReactElement, any, Config.ConfigService | FileSystem.FileSystem>)
    | ((props: Props) => Generator<any, React.ReactElement, any>),
): React.FC<Props> => {
  return async (props: Props) => {
    // Convert generator to Effect if needed
    const generatorOrEffect = fn(props)
    const effect = (
      // Check if it's a generator
      generatorOrEffect && typeof generatorOrEffect === 'object' && Symbol.iterator in generatorOrEffect
        ? Ef.gen(() => generatorOrEffect as Generator<any, React.ReactElement, any>)
        : generatorOrEffect as Ef.Effect<React.ReactElement, any, any>
    ).pipe(
      // Provide app runtime layers
      Ef.provide(AppRuntime),
      // Convert to Either to handle both success and failure
      Ef.either,
    )

    // Run the effect and get the Either result
    const either = await Ef.runPromise(effect as Ef.Effect<Ei.Either<any, React.ReactElement>, never, never>).catch(e =>
      e
    )

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
      // For success, return the component
      return either.right
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
  Server,
} as const
