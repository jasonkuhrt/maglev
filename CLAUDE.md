# Conventions

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
