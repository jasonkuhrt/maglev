import { Config } from '#core/config'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Settings } from '#core/settings'
import { Ctx, Ef, type Ei } from '#deps/effect'
import { Efy } from '#lib/efy'
import { Railway } from '#lib/railway'
import { FileSystem } from '@effect/platform'
import * as React from 'react'
import { provideRouteServices } from './shared-runtime.js'

// ================
// TYPES
// ================

export type ErrorBoundaryProps = {
  error: Error | unknown
}

// ================
// EXPORTS FROM OTHER MODULES
// ================

// Action and its helper are from ./action.ts
export { action, Args } from './action.js'

// Context tags are from ./context.ts
export { Context, FormData, Params, Request } from './context.js'

// Import Params for internal use
import { Params } from './context.js'

// Loader is from ./loader.ts
export { loader } from './loader.js'

// ================
// SERVER COMPONENT
// ================

export type ComponentProps<TLoaderData = unknown> = {
  params?: Record<string, string | undefined>
  loaderData?: TLoaderData
  request?: Request
}

type ServerComponentProps<TLoaderData = unknown> = ComponentProps<TLoaderData>

/**
 * Internal context tag for loader data
 */
export class LoaderDataTag extends Ctx.Tag('Route.LoaderData')<LoaderDataTag, unknown>() {}

/**
 * Access typed loader data within a Server component
 *
 * @template T The type of your loader data
 * @returns Effect context tag for accessing loader data
 *
 * @example
 * ```typescript
 * // In your loader
 * export const loader = Route.loader(function*() {
 *   return { user: { name: 'John' }, posts: [...] }
 * })
 *
 * // In your Server component
 * export const ServerComponent = Route.Server(function*() {
 *   const data = yield* Route.LoaderData<{ user: User, posts: Post[] }>()
 *   return <div>Welcome {data.user.name}!</div>
 * })
 * ```
 */
export const LoaderData = <T = unknown>() => LoaderDataTag as unknown as Ctx.Tag<'Route.LoaderData', T>

/**
 * Creates a server-side React component with full Effect runtime support
 *
 * Server components run on the server and have access to:
 * - Session and authentication state
 * - Database connections (EdgeDB via Gel.Client)
 * - File system operations
 * - External APIs (Railway)
 * - Configuration and settings
 * - Route parameters and loader data
 *
 * @template TLoaderData Type of data returned by the route's loader
 * @param fn Effect generator function or Effect that produces the component
 * @returns React functional component
 *
 * @example Basic usage
 * ```typescript
 * export const ServerComponent = Route.Server(function*() {
 *   const session = yield* Session.Context
 *   const user = yield* session.getUser()
 *
 *   return (
 *     <PageLayout>
 *       <h1>Welcome {user.username}!</h1>
 *     </PageLayout>
 *   )
 * })
 * ```
 *
 * @example With database access
 * ```typescript
 * export const ServerComponent = Route.Server(function*() {
 *   const gel = yield* Gel.Client
 *   const params = yield* Route.Params
 *
 *   const project = yield* Ef.tryPromise({
 *     try: () => Gel.$.select(Gel.$.Project, p => ({
 *       filter_single: Gel.$.op(p.id, '=', Gel.$.uuid(params.id)),
 *       name: true,
 *       createdAt: true
 *     })).run(gel.client),
 *     catch: (cause) => new Error('Failed to load project', { cause })
 *   })
 *
 *   return <ProjectDetails project={project} />
 * })
 * ```
 *
 * @example With external API access
 * ```typescript
 * export const ServerComponent = Route.Server(function*() {
 *   const railway = yield* Railway.Context
 *
 *   const templates = yield* Ef.tryPromise({
 *     try: () => railway.query.templates({
 *       $: { first: 50 },
 *       edges: { node: { id: true, name: true } }
 *     }),
 *     catch: (cause) => new Error('Failed to load templates', { cause })
 *   })
 *
 *   return <TemplateList templates={templates} />
 * })
 * ```
 *
 * @remarks
 * - Always use yield* to access services from the Effect context
 * - Errors are automatically handled by React Router's ErrorBoundary
 * - undefined return values are converted to null for React compatibility
 * - Session is automatically provided based on request cookies
 */
export const Server = <TLoaderData = unknown>(
  fn: Efy.EffectOrGen<
    React.ReactNode | undefined,
    any,
    | Params
    | Config.ConfigService
    | FileSystem.FileSystem
    | Settings.Service
    | LoaderDataTag
    | Session.RequestInfo
    | Session.Context
    | Gel.Client
    | Railway.Context
  >,
): React.FC<ServerComponentProps<TLoaderData>> => {
  return async (props) => {
    // Convert generator function to Effect if needed
    const normalizedEffect = Efy.normalizeGenOrEffect(fn)

    // Create the effect pipeline
    let effect = normalizedEffect

    // Provide params if available (before other layers)
    if (props.params) {
      effect = effect.pipe(
        Ef.provideService(Params, props.params),
      )
    }

    // Provide loader data if available
    if (props.loaderData !== undefined && props.loaderData !== null) {
      effect = effect.pipe(
        Ef.provideService(LoaderDataTag, props.loaderData),
      )
    }

    // Get request info from loader data - it MUST be there or we have a bug
    const loaderData = props.loaderData as any

    if (!loaderData?.request || typeof loaderData.request.url !== 'string') {
      throw new Error(
        `ServerComponent error: Missing request data in loader. `
          + `LoaderData: ${JSON.stringify(loaderData)}. `
          + `This is a bug in the Route abstraction - all loaders should provide request data.`,
      )
    }

    const requestInfo: Session.RequestInfoData = loaderData.request

    // Provide Session.RequestInfo (Server component specific)
    effect = effect.pipe(
      Ef.provideService(Session.RequestInfo, requestInfo),
    )

    // Provide all common route services and convert to Either
    const finalEffect = effect.pipe(
      provideRouteServices(requestInfo),
      // Convert to Either to handle both success and failure
      Ef.either,
    ) as Ef.Effect<Ei.Either<React.ReactNode | undefined, any>, never, never>

    // Run the effect and get the Either result
    const either = await Ef.runPromise(finalEffect).catch(e => e)

    // Handle the Either result
    if (either && typeof either === 'object' && '_tag' in either) {
      if (either._tag === 'Left') {
        const error = either.left
        // Re-throw the error to let ErrorBoundary handle it
        // This avoids duplicate error logging
        throw error
      }
      // For success, return the component (convert undefined to null for React)
      const result = either.right
      return result === undefined ? null : result
    }

    // Handle unexpected errors - re-throw to ErrorBoundary
    throw either instanceof Error ? either : new Error('An unexpected error occurred')
  }
}
