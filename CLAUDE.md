# Project Architecture & Conventions

**CRITICAL**: Read and follow `DEVELOPMENT.md` for complete architecture rules, import hierarchy, and project structure.

## Panda CSS

When working with Panda CSS in this project:

- Always reference https://panda-css.com/llms.txt for comprehensive API documentation
- Use https://panda-css.com/llms-full.txt for detailed implementation examples
- Add `.mdx` to any Panda docs URL to get raw markdown (e.g., `/docs/concepts/recipes.mdx`)
- Import from `styled-system/*` directories (css, patterns, recipes, tokens) - these are generated build artifacts
- Never manually edit files in the `styled-system` directory
- Use `css()` for atomic styles, `cva()` for component recipes with variants
- Be explicit with units (use `'13px'` not `13`)
- Use shorthand properties (`bg` not `backgroundColor`, `p` not `padding`)

## Effect Imports

**ALWAYS** import Effect namespaces from `#deps/effect.js`:

```typescript
// ✅ CORRECT
import { Ef, Op, Sc } from '#deps/effect.js'

// ❌ WRONG
import { Effect, Option, Schema } from 'effect'
```

Available namespaces:

- `Ef` - Effect
- `Op` - Option
- `Sc` - Schema

This centralizes Effect imports and provides consistent short aliases across the codebase.

## Error Handling with Effect

### tryPromise Error Handling Rule

**CRITICAL**: When using `Ef.tryPromise`, ALWAYS use proper cause chains in the catch handler. NEVER interpolate error messages directly.

```typescript
// ❌ WRONG - Loses error context through string interpolation
yield * Ef.tryPromise({
  try: () => someAsyncOperation(),
  catch: (e) => new Error(`Failed to do something: ${e}`),
})

// ✅ CORRECT - Preserves full error context in cause chain
yield * Ef.tryPromise({
  try: () => someAsyncOperation(),
  catch: (cause) => new Error('Failed to do something', { cause }),
})
```

**Why this matters:**

- Preserves the full error stack trace and context
- Allows proper error debugging and logging
- Prevents loss of critical error information
- Maintains structured error handling throughout the application

Always:

- Use descriptive error messages without interpolation
- Pass the caught error as the `cause` property
- Name the catch parameter `cause` for consistency
