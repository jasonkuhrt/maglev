# Development Guide

## Prerequisites

- **pnpm**
- **Node.js** 24+ (via `pnpm env use 24`)

## Project Structure

```
app/
├── routes/           # UI
├── components/       # Local component library
├── core/             # Business logic
├── lib/              # Local libraries decoupled from business logic
├── deps/             # Re-exports of deps (aliasing exports, augmenting with new exports, ...)
├── sandbox/          # Developer scratch space (gitignored)
```

## Tool Resources

- [React Router Docs](https://reactrouter.com)
- [React Router RSC Guide](https://reactrouter.com/how-to/react-server-components)
- [Graffle Docs](https://graffle.js.org)
- [Railway API Docs](https://docs.railway.com/reference/public-api)
- [Radix Themes](https://www.radix-ui.com/themes/docs)

## Setup

See [README.md](./README.md) for initial setup instructions.

```bash
# Generate all code
pnpm gen          # Run all generators in parallel
```

## Code Generation

This project uses multiple code generators to maintain type safety:

### All Generators (`pnpm gen`)

**What:** Runs all `gen:*` scripts in parallel.

**When to run:**

- Initial setup
- After pulling changes that affect routes or schemas
- Before committing to ensure all types are up to date

### React Router Typegen (`pnpm gen:routes`)

**What:** Generates TypeScript types for routes and route loaders.

**When to run:**

- After creating/modifying route files in `app/routes/`
- Before type checking if routes changed

**Why:** Provides autocomplete and type safety for `useLoaderData()`, route params, and navigation.

**Output:** `.react-router/types/` directory

### Railway Client (`pnpm gen:railway`)

**What:** Introspects Railway's GraphQL API and generates a fully typed client.

**When to run:**

- Initial setup
- When Railway API schema changes (rare)
- After updating `graffle.config.ts`

**Why:**

- Type-safe Railway API access with autocomplete
- No manual GraphQL query strings needed
- Automatic type inference for query results

**Output:** `app/lib/railway/__generated__/` directory (gitignored)

**Config:** `graffle.config.ts`

**Usage:**

```typescript
import { Railway } from '#lib/railway'

// Use environment variable (MAGLEV_RAILWAY_API_TOKEN or RAILWAY_API_TOKEN)
const railway = Railway.create()

// Or pass explicitly
const railway = Railway.create({ apiToken: 'your-token' })

// Query API with full type safety
const projects = await railway.query.projects({
  // Fully typed fields and arguments
})
```

# Scripts

## Running the App

```bash
# Development server (with HMR)
pnpm dev
# Production build
pnpm build
# Production server
pnpm start
```

## Quality Checks

```bash
# Run all checks
pnpm check
# # Run all fixers
pnpm fix
```

# Tips

## Type Checking Flow

- Alaways have code generated before chasing type errors
- Package scripts should automate this for you.
