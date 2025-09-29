import { Ef, Ei } from './app/deps/effect.js'
import { Efy } from './app/lib/efy/$.js'

// Test case matching the route.tsx usage
type TestInput = Efy.EffectOrGen<
  React.ReactNode | undefined,
  any,
  { ConfigService: string } | { FileSystem: string } | { Settings: string }
>

const fn: TestInput = function*() {
  return undefined
}

// This should preserve the requirements
const normalized = Efy.normalizeGenOrEffect(fn)

// Check the inferred type
type NormalizedType = typeof normalized
// Should be: Effect<React.ReactNode | undefined, any, { ConfigService: string } | { FileSystem: string } | { Settings: string }>

// After providing layers, requirements should be satisfied
const withLayers = normalized.pipe(
  Ef.provide({} as any), // Simulate providing layers
  Ef.either,
)

// This should type check - requirements should be 'never' after providing
const result = Ef.runPromise(withLayers as Ef.Effect<Ei.Either<React.ReactNode | undefined, any>, never, never>)
