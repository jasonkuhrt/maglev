# Template Launch Implementation Plan - Fat Routes Architecture

## Architecture Principles

- **Fat Routes** - Routes act as controllers with orchestration logic
- **Thin Bridges** - Mechanical Effect wrappers preserving full client interfaces
- **No Premature Abstraction** - Extract to operations only when needed
- **Direct Bridge Usage** - Routes use bridges directly for queries
- **Railway as Source of Truth** - No data mirroring or caching
- **Type-Safe Actions** - All actions use Schema validation for forms/JSON
- **Refactor First** - Infrastructure improvements before features

## Implementation Order

1. **Bridge Refactor** - Effect bridges + implementations + route updates (one atomic change)
2. **Action Validation** - Route.ActionOf(Schema) infrastructure
3. **Database Schema** - Add Project status and Railway IDs
4. **Template Launch** - New launch route with validation
5. **Dashboard Update** - Show deployed projects

---

## Commit 0: Complete Bridge Refactor (Utility + Implementations + Routes)

### What

Create Effect bridge utility AND implement Railway/DB bridges AND update all existing routes to use them in one atomic commit.

### Why

We need to ensure the bridge utility actually works with real clients and routes. Implementing separately risks broken intermediate states. This is a large but conceptually clean refactor.

### How

#### Part 1: Effect Bridge Utility

```typescript
// app/lib/effect-bridge/effectify.ts
import { Ef } from '#deps/effect'

/**
 * Recursively transform a client interface to return Effects.
 * Preserves all input parameters and method signatures.
 */
export type Effectify<T, E = Error> = T extends (...args: infer A) => infer R
  ? R extends Promise<infer U> ? (...args: A) => Ef.Effect<U, E, never>
  : (...args: A) => Ef.Effect<Awaited<R>, E, never>
  : T extends object ? { [K in keyof T]: Effectify<T[K], E> }
  : T

/**
 * Runtime effectification of a client.
 * Walks the object tree and wraps all functions.
 */
export const effectify = <T, E = Error>(
  client: T,
  errorTransform?: (error: unknown) => E,
): Effectify<T, E> => {
  const transform = (obj: any, path: string[] = []): any => {
    if (typeof obj === 'function') {
      return (...args: any[]) =>
        Ef.tryPromise({
          try: async () => {
            const result = await obj(...args)
            return result
          },
          catch: errorTransform || ((e) => e as E),
        })
    }

    if (obj && typeof obj === 'object') {
      // Handle arrays, dates, and other non-plain objects
      if (
        Array.isArray(obj) || obj instanceof Date || obj.constructor !== Object
      ) {
        return obj
      }

      const transformed: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          transformed[key] = transform(obj[key], [...path, key])
        }
      }
      return transformed
    }

    return obj
  }

  return transform(client) as Effectify<T, E>
}

/**
 * Create a lazy-evaluated effectified proxy.
 * Useful for clients that need initialization.
 */
export const lazyEffectify = <T, E = Error>(
  getClient: () => T,
  errorTransform?: (error: unknown) => E,
): Effectify<T, E> => {
  let cached: Effectify<T, E> | null = null

  const createProxy = (path: string[] = []): any => {
    return new Proxy(() => {}, {
      get(_, prop: string) {
        if (!cached) {
          cached = effectify(getClient(), errorTransform)
        }

        let current: any = cached
        for (const segment of path) {
          current = current[segment]
        }

        const value = current[prop]

        if (typeof value === 'function') {
          return value
        } else if (typeof value === 'object' && value !== null) {
          return createProxy([...path, prop])
        }

        return value
      },
      apply(_, __, args) {
        if (!cached) {
          cached = effectify(getClient(), errorTransform)
        }

        let current: any = cached
        for (const segment of path) {
          current = current[segment]
        }

        return current(...args)
      },
    })
  }

  return createProxy() as Effectify<T, E>
}
```

#### Part 2: Railway Bridge Implementation

```typescript
// app/core/bridges/railway/index.ts
import { Settings } from '#core/support/settings' // If needed for token
import { effectify, lazyEffectify } from '#lib/effect-bridge'
import { graffle } from '#lib/railway/__generated__'

export class RailwayError extends Error {
  readonly _tag = 'RailwayError' as const
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

// Type for the original Graffle client
type RailwayClient = ReturnType<typeof graffle.create>

// Create the effectified Railway bridge
export const railway = lazyEffectify<RailwayClient, RailwayError>(
  () => {
    // Get token from existing settings or env
    const token = process.env.RAILWAY_API_TOKEN
      || process.env.MAGLEV_RAILWAY_API_TOKEN

    if (!token) throw new RailwayError('Missing Railway API token')

    return graffle.create({
      schema: 'https://railway.app/graphql/v2',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  (error) => new RailwayError('Railway API error', error),
)

export type RailwayBridge = typeof railway
```

#### Part 3: Database Bridge Implementation

```typescript
// app/core/bridges/db/index.ts
import * as e from '#core/bridges/db/edgeql-js' // Generated EdgeQL
import { Ef } from '#deps/effect'
import { effectify } from '#lib/effect-bridge'
import { createClient } from 'edgedb'

export class DbError extends Error {
  readonly _tag = 'DbError' as const
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

// Create the EdgeDB client
const client = createClient()

// Create effectified query executor
const runQuery = <T>(query: { run: (client: any) => Promise<T> }) =>
  Ef.tryPromise({
    try: () => query.run(client),
    catch: (error) => new DbError('Database query failed', error),
  })

// Export the bridge with full EdgeQL interface
export const db = {
  // The 'e' namespace with all EdgeQL builders
  e,

  // Effectified query execution
  query: runQuery,

  // Convenience methods that combine building and running
  select: <T>(builder: typeof e.select) => runQuery(builder),

  insert: <T>(builder: typeof e.insert) => runQuery(builder),

  update: <T>(builder: typeof e.update) => runQuery(builder),

  delete: <T>(builder: typeof e.delete) => runQuery(builder),

  // Transaction support
  transaction: <T>(
    fn: (tx: typeof client) => Promise<T>,
  ) =>
    Ef.tryPromise({
      try: () => client.transaction(fn),
      catch: (error) => new DbError('Transaction failed', error),
    }),
}

export type DbBridge = typeof db
```

#### Part 4: Update Existing Market Route

```typescript
// app/routes/market.tsx
import { TemplateCard } from '#components/template-card'
import { Route } from '#composers/route'
import { railway, RailwayError } from '#core/bridges/railway'
import { Ef, Ei } from '#deps/effect'

export const ServerComponent = Route.Server(function*() {
  // BEFORE: Used some Railway context service
  // AFTER: Direct bridge usage with full GraphQL interface

  const result = yield* railway.query.templates({
    $: { first: 50 },
    edges: {
      node: {
        id: true,
        code: true,
        name: true,
        description: true,
        serializedConfig: true,
      },
    },
  }).pipe(Ef.either)

  if (Ei.isLeft(result)) {
    const error = result.left

    if (error._tag === 'RailwayError' && error.message.includes('token')) {
      // Handle missing token case
      return (
        <div>
          <h1>Railway Token Required</h1>
          <p>Please set your Railway API token</p>
        </div>
      )
    }

    throw error
  }

  const templates = result.right.edges
    .filter(edge => edge.node !== null)
    .map(edge => edge.node)

  return (
    <div>
      <h1>Railway Templates</h1>
      <div className='grid grid-cols-3 gap-4'>
        {templates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
})
```

#### Part 5: Update Any Other Existing Routes Using Railway/DB

```typescript
// Check and update any other routes that currently use Railway or database
// For example, if there's a dashboard or project route, update those too
```

### Testing the Refactor

After this commit, all existing functionality should work exactly as before, but now:

- Railway client is effectified with full GraphQL interface preserved
- Database client is effectified with full EdgeQL interface preserved
- Routes use bridges directly with full query power
- Everything returns consistent Effects with proper error types

---

## Commit 1: Type-Safe Route Actions with Schema Validation

### What

Create `Route.ActionOf(Schema)` helper that validates and parses request data (JSON or FormData) using Effect Schema.

### Why

We need a consistent, type-safe way to handle all actions across the codebase. This gives us:

- Automatic validation and parsing
- Standardized error responses
- Type inference from schema
- Works with both JSON and FormData

### How

```typescript
// app/composers/route/action.ts
import { Ef, Sc } from '#deps/effect'
import type { ActionFunctionArgs } from 'react-router'

export class ActionValidationError extends Error {
  readonly _tag = 'ActionValidationError' as const
  constructor(
    readonly errors: Sc.ParseError,
    readonly cause?: unknown,
  ) {
    super('Action validation failed')
  }
}

/**
 * Create a type-safe action with automatic validation.
 * Supports both JSON and FormData requests.
 */
export const ActionOf = <I, A>(schema: Sc.Schema<A, I>) =>
(
  handler: (
    args: ActionFunctionArgs & { data: A },
  ) => Ef.Effect<Response, any, any>,
) =>
async (args: ActionFunctionArgs) => {
  const program = Ef.gen(function*() {
    const request = args.request.clone()
    const contentType = request.headers.get('content-type') || ''

    // Parse request body based on content type
    let rawData: unknown
    if (contentType.includes('application/json')) {
      rawData = yield* Ef.tryPromise({
        try: () => request.json(),
        catch: (e) =>
          new ActionValidationError(
            new Sc.ParseError('Failed to parse JSON'),
            e,
          ),
      })
    } else if (
      contentType.includes('multipart/form-data')
      || contentType.includes('application/x-www-form-urlencoded')
    ) {
      const formData = yield* Ef.tryPromise({
        try: () => request.formData(),
        catch: (e) =>
          new ActionValidationError(
            new Sc.ParseError('Failed to parse form data'),
            e,
          ),
      })

      // Convert FormData to object
      rawData = {}
      for (const [key, value] of formData.entries()) {
        // Handle multiple values for same key
        if (key in rawData) {
          const existing = rawData[key]
          rawData[key] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value]
        } else {
          rawData[key] = value
        }
      }
    } else {
      return new Response(
        JSON.stringify({
          error: 'Unsupported content type',
          contentType,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Validate and parse with schema
    const parseResult = yield* Sc.decode(schema)(rawData).pipe(
      Ef.mapError(errors => new ActionValidationError(errors)),
    )

    // Call handler with validated data
    return yield* handler({ ...args, data: parseResult })
  })

  // Run the program with proper error handling
  const result = await Ef.runPromise(program.pipe(
    Ef.catchTag('ActionValidationError', (error) =>
      Ef.succeed(
        new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: Sc.TreeFormatter.formatErrorSync(error.errors),
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )),
    Ef.catchAll((error) =>
      Ef.succeed(
        new Response(
          JSON.stringify({
            error: error.message || 'Internal server error',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
    ),
  ))

  return result
}

// Add to Route namespace exports
// app/composers/route/index.ts
export { ActionOf } from './action'
```

### Update Existing Actions (if any)

```typescript
// Before
export const action = async ({ request }) => {
  const formData = await request.formData()
  const name = formData.get('name')
  // Manual validation...
}

// After
const UpdateSchema = Sc.Struct({
  name: Sc.String.pipe(Sc.minLength(1)),
})

export const action = Route.ActionOf(UpdateSchema)(function*({ data }) {
  // data is validated and typed
  const { name } = data
  // ...
})
```

---

## Commit 2: Database Schema

### What

Add minimal Gel schema changes to Project type for tracking Railway deployments.

### Why

We only need to track which projects exist and their Railway IDs. We don't store templateId - we'll query Railway's `templateSourceForProject` when needed to maintain data integrity.

### How

```edgeql
# dbschema/default.gel

# Add simple status enum
scalar type ProjectStatus extending enum<
  'deploying',    # Currently being deployed
  'active',       # Successfully deployed
  'failed'        # Deployment failed
>;

# Update Project type (or create if doesn't exist)
type Project {
  required name: str;
  required railwayProjectId: str;
  # No railwayTemplateId - query Railway when needed for data integrity
  required status: ProjectStatus {
    default := ProjectStatus.deploying;
  };
  required createdAt: datetime {
    default := datetime_current();
  };
  required updatedAt: datetime {
    default := datetime_current();
  };
}

# Create indexes for performance
index on (Project.status);
index on (Project.railwayProjectId);
```

Run migration:

```bash
edgedb migration create
edgedb migrate
```

---

## Commit 3: Template Launch Route (Fat Controller)

### What

Implement template launch directly in the route, using bridges for Railway and DB access with schema validation.

### Why

Following fat routes pattern - the route owns its orchestration logic. We use the new ActionOf for validation.

### How

```typescript
// app/routes/api/template-launch.ts
import { Route } from '#composers/route'
import { db } from '#core/bridges/db'
import { railway } from '#core/bridges/railway'
import { Ef, Sc } from '#deps/effect'

// Define validation schema
const LaunchTemplateSchema = Sc.Struct({
  templateId: Sc.String,
  projectName: Sc.String.pipe(
    Sc.minLength(3),
    Sc.maxLength(50),
    Sc.pattern(/^[a-zA-Z0-9-_]+$/, {
      message:
        'Project name can only contain letters, numbers, hyphens, and underscores',
    }),
  ),
})

export const action = Route.ActionOf(LaunchTemplateSchema)(function*({ data }) {
  const { templateId, projectName } = data

  // Step 1: Deploy template via Railway (direct bridge usage)
  const deployment = yield* railway.mutation.templateDeployV2({
    $: {
      input: {
        templateId,
        environmentName: 'production',
        projectName,
        serializedConfig: {},
      },
    },
    projectId: true,
    workflowId: true,
  })

  // Step 2: Store project in database (direct EdgeQL)
  const project = yield* db.query(
    db.e.insert(db.e.Project, {
      name: projectName,
      railwayProjectId: deployment.projectId,
      // No templateId stored - query Railway when needed
      status: 'deploying',
    }),
  )

  // Step 3: Fork polling for deployment status
  yield* Ef.fork(
    pollDeploymentStatus(deployment.workflowId, project.id),
  )

  return Response.json({
    success: true,
    projectId: project.id,
  })
})

// Helper function colocated with route
// Move to operations/ only if another route needs it
function* pollDeploymentStatus(workflowId: string, projectId: string) {
  const maxAttempts = 60 // 5 minutes
  let attempts = 0

  while (attempts < maxAttempts) {
    yield* Ef.sleep('5 seconds')

    // Direct Railway query
    const workflow = yield* railway.query.workflowStatus({
      $: { id: workflowId },
      status: true,
      error: true,
      completedAt: true,
    })

    if (workflow.status === 'COMPLETED') {
      // Direct EdgeQL update
      yield* db.query(
        db.e.update(db.e.Project, p => ({
          filter_single: db.e.op(p.id, '=', db.e.uuid(projectId)),
          set: {
            status: 'active',
            updatedAt: db.e.datetime_current(),
          },
        })),
      )
      return
    }

    if (workflow.status === 'FAILED' || workflow.status === 'CANCELLED') {
      yield* db.query(
        db.e.update(db.e.Project, p => ({
          filter_single: db.e.op(p.id, '=', db.e.uuid(projectId)),
          set: {
            status: 'failed',
            updatedAt: db.e.datetime_current(),
          },
        })),
      )
      return
    }

    attempts++
  }

  // Timeout - mark as failed
  yield* db.query(
    db.e.update(db.e.Project, p => ({
      filter_single: db.e.op(p.id, '=', db.e.uuid(projectId)),
      set: {
        status: 'failed',
        updatedAt: db.e.datetime_current(),
      },
    })),
  )
}
```

---

## Commit 4: Dashboard Route with Enrichment

### What

Create or update dashboard to show deployed projects with Railway enrichment using bridges.

### Why

Dashboard needs to combine database projects with live Railway data to show URLs and deployment status.

### How

```typescript
// app/routes/dashboard.tsx
import { Route } from '#composers/route'
import { db } from '#core/bridges/db'
import { railway } from '#core/bridges/railway'
import { Ef } from '#deps/effect'

export const ServerComponent = Route.Server(function*() {
  // Get projects from database with full EdgeQL
  const projects = yield* db.query(
    db.e.select(db.e.Project, project => ({
      id: true,
      name: true,
      railwayProjectId: true,
      status: true,
      createdAt: true,
      order_by: {
        expression: project.createdAt,
        direction: db.e.DESC,
      },
    })),
  )

  // Enrich active projects with Railway data
  const enrichedProjects = yield* Ef.all(
    projects.map(project =>
      project.status === 'active'
        ? Ef.gen(function*() {
          // Get project details and template info from Railway
          const [railwayProject, templateInfo] = yield* Ef.all([
            railway.query.project({
              $: { id: project.railwayProjectId },
              id: true,
              name: true,
              deployments: {
                edges: {
                  node: {
                    id: true,
                    staticUrl: true,
                    createdAt: true,
                  },
                },
                first: 1,
              },
            }).pipe(
              Ef.orElse(() => Ef.succeed(null)),
            ),
            railway.query.templateSourceForProject({
              $: { projectId: project.railwayProjectId },
              id: true,
              name: true,
              code: true,
            }).pipe(
              Ef.orElse(() => Ef.succeed(null)),
            ),
          ])

          return {
            ...project,
            url: railwayProject?.deployments?.edges[0]?.node?.staticUrl,
            lastDeployedAt: railwayProject?.deployments?.edges[0]?.node
              ?.createdAt,
            templateName: templateInfo?.name,
            templateCode: templateInfo?.code,
          }
        })
        : Ef.succeed(project)
    ),
  )

  return (
    <div>
      <h1>Your Projects</h1>
      <div className='grid grid-cols-1 gap-4'>
        {enrichedProjects.map(project => (
          <div key={project.id} className='border p-4'>
            <h2>{project.name}</h2>
            <p>Status: {project.status}</p>
            {project.url && (
              <a href={project.url} target='_blank' rel='noopener noreferrer'>
                View Project →
              </a>
            )}
          </div>
        ))}
      </div>
      <a href='/market'>Deploy New Template</a>
    </div>
  )
})
```

---

## Summary

This implementation follows our refined approach:

1. **Commit 0**: Complete bridge refactor in one atomic change
   - Create effectify utility
   - Implement Railway and DB bridges
   - Update all existing routes to use bridges
   - Everything tested together

2. **Commit 1**: Add Route.ActionOf for validation
   - Consistent validation pattern
   - Works with JSON and FormData
   - Type-safe with Schema

3. **Commit 2**: Database schema
   - Minimal Project tracking
   - Keep templateId for efficiency

4. **Commit 3**: Template launch route
   - Uses ActionOf validation
   - Direct bridge usage
   - Fat controller pattern

5. **Commit 4**: Dashboard
   - Shows deployed projects
   - Enriches with Railway data

The key insight is combining the bridge refactor into one commit ensures we don't have untested intermediate states. The utility is proven to work with real clients and routes.
