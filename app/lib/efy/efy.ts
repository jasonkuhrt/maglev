import { Ef } from '#deps/effect'

/**
 * Type for values that can be either an Effect or a generator function
 * Commonly used in route handlers and other APIs that support both styles
 */
export type EffectOrGen<$A = any, $E = any, $R = any> =
  | Ef.Effect<$A, $E, $R>
  | (() => Generator<any, $A, any>)

/**
 * Normalizes a value that might be either a generator function or an Effect into an Effect.
 *
 * This utility is useful when working with Effect APIs that accept both generator functions
 * and pre-constructed Effects. It checks if the input is a function (generator function)
 * and wraps it with Ef.gen, otherwise passes through the Effect as-is.
 *
 * The function preserves the type parameters from EffectOrGen, ensuring that requirements
 * are maintained through the transformation.
 *
 * @example
 * ```typescript
 * // Works with generator functions
 * const effect1 = normalizeGenOrEffect(function* () {
 *   const result = yield* Ef.succeed(42)
 *   return result
 * })
 *
 * // Works with Effects
 * const effect2 = normalizeGenOrEffect(Ef.succeed('result'))
 *
 * // Preserves requirements
 * const genWithReq: EffectOrGen<string, Error, ConfigService> = function*() {
 *   const config = yield* ConfigService
 *   return config.value
 * }
 * const normalized = normalizeGenOrEffect(genWithReq) // Effect<string, Error, ConfigService>
 * ```
 */
export function normalizeGenOrEffect<T extends EffectOrGen<any, any, any>>(
  input: T,
): T extends EffectOrGen<infer $A, infer $E, infer $R> ? Ef.Effect<$A, $E, $R> : never

export function normalizeGenOrEffect(input: EffectOrGen<any, any, any>) {
  // Check if it's a function (generator function)
  if (typeof input === 'function') {
    return Ef.gen(input as any) as any
  }
  // Otherwise it's already an Effect
  return input as any
}
