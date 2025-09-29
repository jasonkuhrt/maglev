import { Config } from '#core/config'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Settings } from '#core/settings'
import { Ef, ParseResult, Sc } from '#deps/effect'
import { Efy } from '#lib/efy'
import { Railway } from '#lib/railway'
import { FileSystem } from '@effect/platform'
import { Err } from '@wollybeard/kit'
import { redirect } from 'react-router'
import { Context, FormData, Params, Request } from './context.js'
import { provideRouteServices } from './shared-runtime.js'

// Re-export for backward compatibility
export { Context, FormData, Params, Request }

/**
 * Parse and validate request arguments using an Effect Schema
 *
 * Automatically handles:
 * - Form data parsing (multipart and URL-encoded)
 * - JSON body parsing
 * - Schema validation with detailed error messages
 * - Multiple values for the same field (arrays)
 *
 * @template I The input type (raw form data)
 * @template A The validated output type
 * @param schema Effect Schema for validation
 * @returns Effect that yields the validated data
 *
 * @example Basic form validation
 * ```typescript
 * const CreateProjectSchema = Sc.Struct({
 *   projectName: Sc.String.pipe(
 *     Sc.minLength(3),
 *     Sc.maxLength(50),
 *     Sc.pattern(/^[a-zA-Z0-9-_]+$/)
 *   ),
 *   templateId: Sc.String
 * })
 *
 * export const action = Route.action(function*() {
 *   const { projectName, templateId } = yield* Route.Args(CreateProjectSchema)
 *   // Data is now validated and typed
 * })
 * ```
 *
 * @remarks
 * - Returns 422 status with validation errors if validation fails
 * - Handles both FormData and JSON request bodies automatically
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
 * Provides action-specific services and common route services
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
    // Provide action-specific services
    Ef.provideService(Request, args.request),
    Ef.provideService(Params, args.params),
    Ef.provideService(Context, {
      request: args.request,
      params: args.params,
    }),
    Ef.provideService(Session.RequestInfo, requestInfo),
  )

  // FormData is action-specific (for Args helper)
  if (formDataService) {
    pipeline = pipeline.pipe(Ef.provideServiceEffect(FormData, formDataService))
  }

  // Provide all common route services
  return pipeline.pipe(
    provideRouteServices(requestInfo),
  )
}

// ================
// ACTION
// ================

/**
 * Creates a React Router action with full Effect runtime support
 *
 * Actions handle form submissions and mutations:
 * - Process form data and JSON requests
 * - Perform database updates
 * - Call external APIs
 * - Handle authentication and authorization
 * - Return redirects or JSON responses
 *
 * @template A The type of data returned by the action
 * @param fn Effect generator or Effect that processes the action
 * @returns React Router action function
 *
 * @example Simple redirect with vanilla function
 * ```typescript
 * export const action = Route.action(() => redirect('/success'))
 * ```
 *
 * @example Return JSON with vanilla async function
 * ```typescript
 * export const action = Route.action(async () => {
 *   const result = await processData()
 *   return Response.json({ success: true, data: result })
 * })
 * ```
 *
 * @example Form submission with validation
 * ```typescript
 * const LaunchTemplateSchema = Sc.Struct({
 *   templateId: Sc.String,
 *   projectName: Sc.String.pipe(
 *     Sc.minLength(3),
 *     Sc.pattern(/^[a-zA-Z0-9-_]+$/)
 *   )
 * })
 *
 * export const action = Route.action(function*() {
 *   const { templateId, projectName } = yield* Route.Args(LaunchTemplateSchema)
 *   const session = yield* Session.Context
 *   const user = yield* session.getUser()
 *
 *   const gel = yield* Gel.Client
 *   const project = yield* Ef.tryPromise({
 *     try: () => Gel.$.insert(Gel.$.Project, {
 *       name: projectName,
 *       templateId,
 *       owner: user.id,
 *       createdAt: new Date()
 *     }).run(gel.client),
 *     catch: (cause) => new Error('Failed to create project', { cause })
 *   })
 *
 *   // Redirect to the new project
 *   return redirect(`/projects/${project.id}`)
 * })
 * ```
 *
 * @example API endpoint with vanilla function
 * ```typescript
 * export const action = Route.action(() => {
 *   // Simple processing without Effect services
 *   const timestamp = Date.now()
 *   return Response.json({ processed: true, timestamp })
 * })
 * ```
 *
 * @example API endpoint with generator and services
 * ```typescript
 * export const action = Route.action(function*() {
 *   const railway = yield* Railway.Context
 *   const templates = yield* Ef.tryPromise({
 *     try: () => railway.query.templates({ first: 10 }),
 *     catch: (cause) => new Error('Failed to load templates', { cause })
 *   })
 *
 *   // Return JSON response
 *   return Response.json({ templates })
 * })
 * ```
 *
 * @example Delete operation with confirmation
 * ```typescript
 * export const action = Route.action(function*() {
 *   const params = yield* Route.Params
 *   const session = yield* Session.Context
 *   yield* session.getUser() // Ensure authenticated
 *
 *   const gel = yield* Gel.Client
 *   yield* Ef.tryPromise({
 *     try: () => Gel.$.delete(Gel.$.Project, p => ({
 *       filter_single: Gel.$.op(p.id, '=', Gel.$.uuid(params.id))
 *     })).run(gel.client),
 *     catch: (cause) => new Error('Failed to delete project', { cause })
 *   })
 *
 *   // Redirect after deletion
 *   return redirect('/projects')
 * })
 * ```
 *
 * @remarks
 * - Automatically handles form data and JSON parsing
 * - Errors are serialized and returned as JSON responses
 * - Returns Response objects (redirects) or JSON-serializable data
 * - Railway API tokens are loaded automatically if configured
 * - Default behavior redirects to the same page after success
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
