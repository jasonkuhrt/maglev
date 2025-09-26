import { Ctx, Ef } from '#deps/effect'
import { Ts } from '@wollybeard/kit'
import { describe, expect, test } from 'vitest'
import { Efy } from './$.js'

describe('.normalizeGenOrEffect', () => {
  test('passes through an Effect unchanged', async () => {
    const effect = Ef.succeed(42)
    const normalized = Efy.normalizeGenOrEffect(effect)

    // Runtime assertions
    expect(await Ef.runPromise(normalized)).toBe(42)
    expect(normalized).toBe(effect)

    // Type assertions co-located with runtime test
    Ts.assert<Ef.Effect<number, never, never>>()(normalized)
  })

  test('converts a generator function to an Effect', async () => {
    const gen = function*() {
      return (yield* Ef.succeed(10)) * 2
    }
    const result = Efy.normalizeGenOrEffect(gen)

    // Runtime assertion
    expect(await Ef.runPromise(result)).toBe(20)

    // Type assertion - generator function returns Effect with never for E and R
    Ts.assert<Ef.Effect<number, never, never>>()(result)
  })

  test('handles generator functions that yield multiple Effects', async () => {
    const gen = function*() {
      const a = yield* Ef.succeed(5)
      const b = yield* Ef.succeed(10)
      return a + b
    }
    const result = Efy.normalizeGenOrEffect(gen)

    // Runtime assertion
    expect(await Ef.runPromise(result)).toBe(15)

    // Type assertion - generator function returns Effect with never for E and R
    Ts.assert<Ef.Effect<number, never, never>>()(result)
  })

  test('handles generator functions with error Effects', async () => {
    const gen = function*() {
      yield* Ef.fail(new Error('test error'))
      return 'unreachable'
    }
    const result = Efy.normalizeGenOrEffect(gen)

    // Runtime assertion
    await expect(Ef.runPromise(result)).rejects.toThrow('test error')

    // Type assertion - generator function returns Effect with never for E and R
    Ts.assert<Ef.Effect<string, never, never>>()(result)
  })

  test('handles complex types', async () => {
    interface User {
      id: number
      name: string
    }
    const user: User = { id: 1, name: 'Alice' }

    // Effect with complex type
    const effect = Ef.succeed(user)
    const effectResult = Efy.normalizeGenOrEffect(effect)
    expect(await Ef.runPromise(effectResult)).toEqual(user)
    Ts.assert<Ef.Effect<User, never, never>>()(effectResult)

    // Generator function with complex type
    const gen = function*(): Generator<any, User, any> {
      return yield* Ef.succeed(user)
    }
    const genResult = Efy.normalizeGenOrEffect(gen)
    expect(await Ef.runPromise(genResult)).toEqual(user)
    Ts.assert<Ef.Effect<User, never, never>>()(genResult)
  })

  test('preserves Effect type parameters (E and R)', () => {
    // Effect with error type
    const failEffect = Ef.fail('error message')
    const failResult = Efy.normalizeGenOrEffect(failEffect)
    Ts.assert<Ef.Effect<never, string, never>>()(failResult)

    // Effect with custom error type
    class CustomError {
      readonly _tag = 'CustomError'
    }
    const customFailEffect = Ef.fail(new CustomError())
    const customFailResult = Efy.normalizeGenOrEffect(customFailEffect)
    Ts.assert<Ef.Effect<never, CustomError, never>>()(customFailResult)

    // Effect with requirements (using Context)
    class TestContext extends Ctx.Tag('TestContext')<TestContext, { value: number }>() {}
    const contextEffect = Ef.gen(function*() {
      const ctx = yield* TestContext
      return ctx.value
    })
    const contextResult = Efy.normalizeGenOrEffect(contextEffect)
    Ts.assert<Ef.Effect<number, never, TestContext>>()(contextResult)
  })

  test('infers types correctly without explicit type parameters', () => {
    // String effect
    const strEffect = Ef.succeed('hello')
    const strResult = Efy.normalizeGenOrEffect(strEffect)
    Ts.assert<Ef.Effect<string, never, never>>()(strResult)

    // Number generator function
    const numGen = function*() {
      return (yield* Ef.succeed(42))
    }
    const numResult = Efy.normalizeGenOrEffect(numGen)
    Ts.assert<Ef.Effect<number, never, never>>()(numResult)

    // Boolean effect
    const boolEffect = Ef.succeed(true)
    const boolResult = Efy.normalizeGenOrEffect(boolEffect)
    Ts.assert<Ef.Effect<boolean, never, never>>()(boolResult)
  })
})
