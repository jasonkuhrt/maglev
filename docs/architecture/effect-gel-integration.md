# Effect + Gel Architecture

## Overview

This project uses **Effect-TS** for type-safe functional programming and **Gel** (EdgeDB) for the database layer. This document explains the architectural decisions, type flows, and integration patterns.

## Stack Decision

### Database Layer: Gel Native Query Builder

**Chosen:** Gel's native TypeScript query builder
**Rejected:** Drizzle ORM, other ORMs

**Rationale:**

- **Performance**: 6x faster than Drizzle + Neon (99% of queries in 2.9ms)
- **Type Safety**: Automatic result type inference, cardinality detection, compile-time query validation
- **Composability**: Fully composable query expressions (major differentiator from ORMs)
- **Official Effect Integration**: Gel published official Effect integration guides
- **No Abstraction Penalty**: Direct query builder without ORM overhead

**Type Safety Features:**

- Query results automatically inferred via `$infer<typeof query>`
- Invalid queries caught at compile time
- Composable "shapes" for reusable query fragments

### RPC Layer: None (Direct RSC)

**Chosen:** React Server Components with direct Effect integration
**Rejected:** Effect RPC, tRPC

**Rationale:**

**Effect RPC:**

- ⚠️ Alpha status ("APIs are not stable", v0.69.2)
- Breaking changes expected
- Not production-ready for interview timeline

**tRPC:**

- Poor Effect Schema integration (requires manual encode/decode)
- Schema transformation issues (input ≠ output problem)
- Extra complexity layer not needed with RSC

**Direct RSC Approach:**

- RSC natively supports async/await
- Effect.runPromise works seamlessly
- Simpler architecture, fewer moving parts
- Type safety maintained through Effect.Effect<A, E>

### Effect Integration

**Core Principle:** Effect is for type-safe side effect management, not React's useEffect

**RSC + Effect:**

- RSC are async functions that run once on the server
- RSC replace `useEffect` for data fetching, don't use it
- Effect library integrates via `Effect.runPromise` at RSC boundary

## Type Flow

```
┌─────────────────────────────────────────────┐
│ React Server Component (async function)    │
│ - Accepts Route.LoaderArgs                 │
│ - Returns Promise<Data>                    │
└─────────────┬───────────────────────────────┘
              │
              │ await Ef.runPromise(program)
              ▼
┌─────────────────────────────────────────────┐
│ Effect Program                              │
│ - Ef.Effect<Data, Errors, Requirements>    │
│ - Type-safe error handling                 │
│ - Dependency injection via Ef.Layer        │
└─────────────┬───────────────────────────────┘
              │
              │ Ef.provide(layers)
              ▼
┌─────────────────────────────────────────────┐
│ Gel Query                                   │
│ - Wrapped in Ef.tryPromise                 │
│ - Auto-inferred result types               │
│ - Composed via e.select()                  │
└─────────────────────────────────────────────┘
```

**Concrete Example:**

```typescript
// 1. Gel Query (auto-typed)
const query = e.select(e.User, () => ({
  id: true,
  name: true,
}))
type User = typeof query.__element__ // Inferred

// 2. Effect Program (typed errors + requirements)
const getUser = (id: string): Ef.Effect<User, GelError, GelClient> =>
  Ef.gen(function*() {
    const { client } = yield* GelClient
    return yield* Ef.tryPromise({
      try: () => query.run(client),
      catch: (error) => new GelError({ message: 'Query failed', cause: error }),
    })
  })

// 3. RSC (Promise boundary)
export async function loader({ params }: Route.LoaderArgs) {
  const program = Ef.pipe(
    getUser(params.id),
    Ef.provide(GelClientLive),
  )
  return await Ef.runPromise(program) // Effect → Promise
}

// 4. Client (serialized data)
export default function UserProfile({ loaderData }: Route.ComponentProps) {
  const user = loaderData // Plain User object
}
```

## Effect Patterns (from Gel Blog)

### Custom Error Types

Use `Da.TaggedError` for domain-specific errors:

```typescript
import { Da } from '#deps/effect'

export class GelError extends Da.TaggedError('GelError')<{
  message: string
  cause: unknown
}> {}

export class NotFoundError extends Da.TaggedError('NotFoundError')<{
  message: string
  id: string
}> {}
```

### Effect.tryPromise Pattern

Wrap all database operations:

```typescript
const getUserData = (id: string) => Ef.gen(function* () {
  const { client } = yield* GelClient

  return yield* Ef.tryPromise({
    try: async () => {
      const user = await e.select(e.User, (u) => ({
        filter_single: e.op(u.id, '=', e.uuid(id)),
        ...
      })).run(client)

      if (!user) throw new NotFoundError({ message: 'User not found', id })
      return user
    },
    catch: (error) => {
      if (error instanceof NotFoundError) return error
      return new GelError({ message: 'Failed to fetch user', cause: error })
    }
  })
})
```

### Service Layers with Dependency Injection

```typescript
// Define service
export class GelClient extends Ef.Context.Tag('GelClient')<
  GelClient,
  { readonly client: Client }
>() {}

// Implement layer
export const GelClientLive = Ef.Layer.sync(
  GelClient,
  () => ({ client: createClient() }),
)

// Use in program
const program = Ef.pipe(
  getAllProjects,
  Ef.provide(GelClientLive),
)
```

### Composition with pipe

```typescript
const loadUser = (id: string) =>
  Ef.pipe(
    Ef.log(`Fetching user ${id}`),
    Ef.flatMap(() => getUserData(id)),
    Ef.tap((user) => updateAnalytics(user.id)),
    Ef.catchAll((error) => handleError(error)),
  )
```

## Framework Boundaries

**CRITICAL:** `async` functions are ONLY allowed at framework boundaries with mandatory comment:

```typescript
// ✅ Framework boundary: RSC expects Promise return
export async function loader({ params }: Route.LoaderArgs) {
  return await Ef.runPromise(program)
}

// ✅ Framework boundary: CLI requires async
await Ef.runPromise(seed)

// ❌ WRONG: No async in business logic
async function getUserData(id: string) {
  return await fetch(...)
}
```

**Rule:** Use Effect everywhere, convert to Promise ONLY at:

1. React Server Component loaders/actions
2. CLI script entry points (tsx)
3. Vite plugin hooks (transform, etc.)

## Import Conventions

```typescript
// Effect namespaces (centralized)
import { Da, Ef, Op, Sc } from '#deps/effect'

// Libraries
import { Conf } from '#lib/conf'
import { Env } from '#lib/env'
import { Railway } from '#lib/railway'

// Config (when developing config features)
import { Config } from '#lib/config'
```

## What We Avoid and Why

### ❌ Effect RPC

- **Status:** Alpha (v0.69.2)
- **Issue:** "APIs are not stable", breaking changes expected
- **Decision:** Too risky for interview timeline

### ❌ Drizzle ORM

- **Performance:** 6x slower than Gel native
- **Use Case:** Better for SQL familiarity, Postgres migrations
- **Decision:** Gel native has superior type safety + performance

### ❌ tRPC

- **Issue:** Poor Effect Schema integration
- **Problem:** `DateFromNumber` schema expects number input but tRPC infers Date type
- **Workaround:** Manual encode/decode (error-prone, lots of boilerplate)
- **Decision:** RSC eliminates need for RPC layer

### ❌ Schema.Struct for Data Types

- **Preference:** Schema.Class for opaque types with methods
- **Use Struct:** Only for plain data without behavior
- **TaggedStruct:** Use for ADT union members

## Resources

- [Building with Effect and EdgeDB: Part 1](https://www.geldata.com/blog/building-with-effect-and-edgedb-part-1) - Core Effect patterns
- [Gel Query Builder Design](https://www.geldata.com/blog/designing-the-ultimate-typescript-query-builder) - Type safety architecture
- [React Server Components](https://react.dev/reference/rsc/server-components) - RSC fundamentals
- [Effect Documentation](https://effect.website/docs) - Effect patterns
