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
