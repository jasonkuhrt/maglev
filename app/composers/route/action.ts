import { Config } from '#core/config'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Settings } from '#core/settings'
import { Ef, Lr, ParseResult, Sc } from '#deps/effect'
import { Efy } from '#lib/efy'
import { Railway } from '#lib/railway'
import { FileSystem } from '@effect/platform'
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem'
import { Err } from '@wollybeard/kit'
import { redirect } from 'react-router'
import { Context, FormData, Params, Request } from './context.js'

// Re-export for backward compatibility
export { Context, FormData, Params, Request }

/**
 * Parse and validate request arguments with a schema
 * Automatically handles validation errors
 */
export const Args = <I, A>(schema: Sc.Schema<A, I>) =>
  Ef.gen(function*() {
    const request = yield* Request
    const formData = yield* FormData
    const contentType = request.headers.get('content-type') || ''

    // Parse request body based on content type
    let rawData: unknown
    if (contentType.includes('application/json')) {
      rawData = yield* Ef.tryPromise({
        try: () => request.clone().json(),
        catch: (cause) => new Error('Failed to parse JSON', { cause }),
      })
    } else {
      // Convert FormData to object
      const dataObj: Record<string, any> = {}
      for (const [key, value] of formData.entries()) {
        // Handle multiple values for same key
        if (key in dataObj) {
          const existing = dataObj[key]
          dataObj[key] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value]
        } else {
          dataObj[key] = value
        }
      }
      rawData = dataObj
    }

    // Validate and parse with schema
    const result = yield* Sc.decodeUnknown(schema)(rawData).pipe(
      Ef.mapError(errors => {
        // Throw a Response for validation errors
        throw new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: ParseResult.TreeFormatter.formatErrorSync(errors),
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }),
    )

    return result
  })

// ================
// RUNTIME
// ================

/**
 * Runtime for actions
 * Includes all necessary service layers
 * Note: Railway.ContextLive provided separately after Session is available
 */
const ActionRuntime = Lr.mergeAll(
  NodeFileSystem.layer,
  Config.ConfigServiceLive,
  Gel.ClientLive,
  Settings.ServiceLive,
)

// ================
// TYPES
// ================

type ActionArgs = {
  request: globalThis.Request
  params: Record<string, string | undefined>
}

type ActionFunction<A> = (args: ActionArgs) => Ef.Effect<A, any, any>

// ================
// HELPERS
// ================

/**
 * Provides common route context services for actions
 */
const provideActionContext = <R, E, A>(
  effect: Ef.Effect<A, E, R>,
  args: { request: globalThis.Request; params: Record<string, string | undefined> },
  formDataService?: Ef.Effect<globalThis.FormData, any, any>,
) => {
  // Create request info for session
  const requestInfo: Session.RequestInfoData = {
    url: args.request.url,
    headers: Object.fromEntries(args.request.headers.entries()),
  }

  let pipeline = effect.pipe(
    Ef.provideService(Request, args.request),
    Ef.provideService(Params, args.params),
    Ef.provideService(Context, {
      request: args.request,
      params: args.params,
    }),
    Ef.provideService(Session.RequestInfo, requestInfo),
  )

  if (formDataService) {
    pipeline = pipeline.pipe(Ef.provideServiceEffect(FormData, formDataService))
  }

  // Provide Session service layer
  const sessionLayer = Session.SessionService.layer(requestInfo)

  return pipeline.pipe(
    Ef.provide(Lr.mergeAll(ActionRuntime, sessionLayer)),
    // Provide Railway.ContextLive after Session is available
    Ef.provide(Railway.ContextLive),
  )
}

// ================
// ACTION
// ================

/**
 * Creates a React Router action with Effect runtime
 */
export const action = <A>(
  fn: Efy.EffectOrGen<
    A,
    any,
    | Request
    | FormData
    | Params
    | Context
    | Config.ConfigService
    | FileSystem.FileSystem
    | Settings.Service
    | Session.Context
    | Gel.Client
    | Railway.Context
  >,
): (args: ActionArgs) => Promise<A | Response> => {
  return async (args: ActionArgs): Promise<A | Response> => {
    // Create FormData service that lazily loads form data
    const formDataService = Ef.suspend(() =>
      Ef.tryPromise({
        try: () => args.request.formData(),
        catch: (cause) => new Error('Failed to parse form data', { cause }),
      })
    )

    const effect = provideActionContext(
      Efy.normalizeGenOrEffect(fn),
      args,
      formDataService,
    )

    return Ef.runPromise(effect as Ef.Effect<A, never, never>).then(result => {
      // If the action returns a Response (like redirect), return it as-is
      if (result instanceof Response) {
        return result
      }

      // If no Response returned, automatically redirect to the same route
      // This ensures the loader runs fresh in React Router RSC mode
      // The action completed successfully, so refresh the page data
      if (result === undefined || result === null) {
        // Extract the pathname from the request URL
        const url = new URL(args.request.url)
        return redirect(url.pathname + url.search)
      }

      // If returning data (for API routes), convert to JSON response
      return Response.json(result)
    }).catch(e => {
      // Check if the error is a FiberFailure containing a Response (redirect)
      if (e && typeof e === 'object' && 'cause' in e) {
        // Try to extract the cause from FiberFailure
        let cause = e.cause

        // Navigate through Effect's cause structure
        while (cause && typeof cause === 'object') {
          if ('error' in cause) {
            // Found the actual error
            const actualError = cause.error
            if (actualError instanceof Response) {
              throw actualError
            }
            break
          }
          if ('left' in cause) {
            cause = cause.left
          } else if ('right' in cause) {
            cause = cause.right
          } else {
            break
          }
        }
      }

      // If it's a Response (redirect), throw it as-is for React Router
      if (e instanceof Response) {
        throw e
      }

      // Log error with Err.inspect for better debugging
      if (import.meta.env.DEV) {
        console.error('Route action error:')
        console.error(Err.inspect(e))
      }
      // Serialize error for wire transport
      const errorData = {
        message: e instanceof Error ? e.message : String(e),
        stack: import.meta.env.DEV && e instanceof Error ? e.stack : undefined,
        type: 'ActionError',
      }
      throw new Response(JSON.stringify(errorData), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    })
  }
}
