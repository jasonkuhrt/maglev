import { Ef } from '#deps/effect'

/**
 * Type for values that can be Effect, generator function, or vanilla function
 * Supports maximum flexibility for route handlers and APIs
 */
export type EffectOrGen<$A = any, $E = any, $R = any> =
  | Ef.Effect<$A, $E, $R>
  | (() => Generator<any, $A, any>)
  | (() => $A) // Sync vanilla function
  | (() => Promise<$A>) // Async vanilla function

/**
 * Normalizes any supported input type into an Effect.
 *
 * This utility handles Effect values, generator functions, and vanilla functions,
 * converting them all to Effects. It's useful when building APIs that want to
 * accept multiple styles of functions for developer convenience.
 *
 * - Effects: passed through unchanged
 * - Generator functions: wrapped with Ef.gen
 * - Vanilla sync functions: wrapped with Ef.sync
 * - Vanilla async functions: wrapped with Ef.promise
 *
 * @example
 * ```typescript
 * // Works with Effects
 * const effect1 = normalizeGenOrEffect(Ef.succeed('result'))
 *
 * // Works with generator functions
 * const effect2 = normalizeGenOrEffect(function* () {
 *   const result = yield* Ef.succeed(42)
 *   return result
 * })
 *
 * // Works with vanilla sync functions
 * const effect3 = normalizeGenOrEffect(() => 'sync result')
 *
 * // Works with vanilla async functions
 * const effect4 = normalizeGenOrEffect(async () => {
 *   await delay(100)
 *   return 'async result'
 * })
 * ```
 */
export function normalizeGenOrEffect<T extends EffectOrGen<any, any, any>>(
  input: T,
): T extends Ef.Effect<infer $A, infer $E, infer $R> ? Ef.Effect<$A, $E, $R>
  : T extends () => Generator<any, infer $A, any> ? Ef.Effect<$A, unknown, unknown> // Generators have unknown E and R
  : T extends () => Promise<infer $A> ? Ef.Effect<$A, unknown, never> // Async functions: never R, unknown E
  : T extends () => infer $A ? Ef.Effect<$A, unknown, never> // Sync functions: never R, unknown E
  : never

export function normalizeGenOrEffect(input: EffectOrGen<any, any, any>) {
  // Check if it's already an Effect
  if (Ef.isEffect(input)) {
    return input as any
  }

  // It's a function of some kind
  if (typeof input === 'function') {
    // Check if it's a generator function
    if (input.constructor.name === 'GeneratorFunction') {
      return Ef.gen(input as any) as any
    }

    // Check if it's an async function
    if (input.constructor.name === 'AsyncFunction') {
      return Ef.promise(input as any) as any
    }

    // Regular sync function
    return Ef.sync(input as any) as any
  }

  // Shouldn't happen with proper types, but handle gracefully
  return Ef.succeed(input) as any
}
