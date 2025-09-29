/**
 * Route Composers - Building blocks for React Router routes with Effect
 *
 * The Route namespace provides a complete toolkit for building
 * server-side React Router routes with full Effect runtime support.
 *
 * ## Core Components
 *
 * ### Route.loader
 * Fetches data before rendering. Runs on the server.
 * ```typescript
 * export const loader = Route.loader(function*() {
 *   const session = yield* Session.Context
 *   const user = yield* session.getUser()
 *   return { user }
 * })
 * ```
 *
 * ### Route.Server
 * Server-side React component with Effect runtime.
 * ```typescript
 * export const ServerComponent = Route.Server(function*() {
 *   const gel = yield* Gel.Client
 *   const projects = yield* loadProjects(gel)
 *   return <ProjectList projects={projects} />
 * })
 * ```
 *
 * ### Route.action
 * Handles form submissions and mutations.
 * ```typescript
 * export const action = Route.action(function*() {
 *   const { name } = yield* Route.Args(CreateSchema)
 *   const project = yield* createProject(name)
 *   return redirect(`/projects/${project.id}`)
 * })
 * ```
 *
 * ## Available Services
 *
 * All Route composers have access to these services:
 *
 * - **Session.Context** - Authentication and user management
 * - **Gel.Client** - EdgeDB database access
 * - **Railway.Context** - Railway API client
 * - **Settings.Service** - User settings storage
 * - **FileSystem.FileSystem** - File system operations
 * - **Config.ConfigService** - Application configuration
 * - **Route.Params** - URL parameters
 * - **Route.Request** - HTTP request object
 * - **Route.FormData** - Form data (actions only)
 *
 * ## Authentication Patterns
 *
 * ### Required authentication
 * ```typescript
 * const user = yield* session.getUser() // Throws if not authenticated
 * ```
 *
 * ### Optional authentication
 * ```typescript
 * const user = yield* session.getUserMaybe() // Returns null if not authenticated
 * ```
 *
 * ## Error Handling
 *
 * Errors in Route composers are automatically handled:
 * - Loaders: Errors are serialized and passed to ErrorBoundary
 * - Actions: Return 500 status with error details
 * - Server: Errors bubble up to React Router ErrorBoundary
 *
 * @see {@link loader} for data fetching
 * @see {@link Server} for server components
 * @see {@link action} for mutations
 * @see {@link Args} for request validation
 *
 * @module
 */
export * as Route from './$$.js'
