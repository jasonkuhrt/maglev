import { Ctx, Ef } from '#deps/effect'
import { Ts } from '@wollybeard/kit'
import { describe, expect, test } from 'vitest'
import { Efy } from './$.js'

// Declare phantom value for type casting

describe('.normalizeGenOrEffect', () => {
  test('passes through an Effect unchanged', async () => {
    const effect = Ef.succeed(42)
    const normalized = Efy.normalizeGenOrEffect(effect)

    // Runtime assertions
    expect(await Ef.runPromise(normalized)).toBe(42)
    expect(normalized).toBe(effect)

    // Type assertions co-located with runtime test
    Ts.assert<Ef.Effect<number, never, never>>()(normalized as any)
  })

  test('converts a generator function to an Effect', async () => {
    const gen = function*() {
      return (yield* Ef.succeed(10)) * 2
    }
    const result = Efy.normalizeGenOrEffect(gen)

    // Runtime assertion
    expect(await Ef.runPromise(result)).toBe(20)

    // Type assertion - generator function returns Effect with unknown for E and R
    Ts.assert<Ef.Effect<number, unknown, unknown>>()(result as any)
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
    Ts.assert<Ef.Effect<number, never, never>>()(result as any)
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
    Ts.assert<Ef.Effect<string, never, never>>()(result as any)
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
    Ts.assert<Ef.Effect<User, never, never>>()(effectResult as any)

    // Generator function with complex type
    const gen = function*(): Generator<any, User, any> {
      return yield* Ef.succeed(user)
    }
    const genResult = Efy.normalizeGenOrEffect(gen)
    expect(await Ef.runPromise(genResult)).toEqual(user)
    Ts.assert<Ef.Effect<User, never, never>>()(genResult as any)
  })

  test('converts sync vanilla function to Effect', async () => {
    const fn = () => 42
    const result = Efy.normalizeGenOrEffect(fn)

    // Runtime assertion
    expect(await Ef.runPromise(result)).toBe(42)

    // Type assertion - vanilla sync function returns Effect with never R, unknown E
    Ts.assert<Ef.Effect<number, unknown, never>>()(result as any)
  })

  test('converts async vanilla function to Effect', async () => {
    const fn = async () => {
      await new Promise(r => setTimeout(r, 1))
      return 'async result'
    }
    const result = Efy.normalizeGenOrEffect(fn)

    // Runtime assertion
    expect(await Ef.runPromise(result)).toBe('async result')

    // Type assertion - vanilla async function returns Effect with never R, unknown E
    Ts.assert<Ef.Effect<string, unknown, never>>()(result as any)
  })

  test('handles vanilla functions that throw', async () => {
    const fn = () => {
      throw new Error('sync error')
    }
    const result = Efy.normalizeGenOrEffect(fn)

    // Runtime assertion
    await expect(Ef.runPromise(result)).rejects.toThrow('sync error')
  })

  test('handles async functions that reject', async () => {
    const fn = async () => {
      throw new Error('async error')
    }
    const result = Efy.normalizeGenOrEffect(fn)

    // Runtime assertion
    await expect(Ef.runPromise(result)).rejects.toThrow('async error')
  })

  test('handles vanilla function returning complex types', async () => {
    interface Data {
      count: number
      items: string[]
    }

    const syncFn = (): Data => ({ count: 2, items: ['a', 'b'] })
    const syncResult = Efy.normalizeGenOrEffect(syncFn)
    expect(await Ef.runPromise(syncResult)).toEqual({ count: 2, items: ['a', 'b'] })
    Ts.assert<Ef.Effect<Data, unknown, never>>()(syncResult as any)

    const asyncFn = async (): Promise<Data> => ({ count: 3, items: ['x', 'y', 'z'] })
    const asyncResult = Efy.normalizeGenOrEffect(asyncFn)
    expect(await Ef.runPromise(asyncResult)).toEqual({ count: 3, items: ['x', 'y', 'z'] })
    Ts.assert<Ef.Effect<Data, unknown, never>>()(asyncResult as any)
  })

  test('preserves Effect type parameters (E and R)', () => {
    // Effect with error type
    const failEffect = Ef.fail('error message')
    const failResult = Efy.normalizeGenOrEffect(failEffect)
    Ts.assert<Ef.Effect<never, string, never>>()(failResult as any)

    // Effect with custom error type
    class CustomError {
      readonly _tag = 'CustomError'
    }
    const customFailEffect = Ef.fail(new CustomError())
    const customFailResult = Efy.normalizeGenOrEffect(customFailEffect)
    Ts.assert<Ef.Effect<never, CustomError, never>>()(customFailResult as any)

    // Effect with requirements (using Context)
    class TestContext extends Ctx.Tag('TestContext')<TestContext, { value: number }>() {}
    const contextEffect = Ef.gen(function*() {
      const ctx = yield* TestContext
      return ctx.value
    })
    const contextResult = Efy.normalizeGenOrEffect(contextEffect)
    Ts.assert<Ef.Effect<number, never, TestContext>>()(contextResult as any)
  })

  test('infers types correctly without explicit type parameters', () => {
    // String effect
    const strEffect = Ef.succeed('hello')
    const strResult = Efy.normalizeGenOrEffect(strEffect)
    Ts.assert<Ef.Effect<string, never, never>>()(strResult as any)

    // Number generator function
    const numGen = function*() {
      return (yield* Ef.succeed(42))
    }
    const numResult = Efy.normalizeGenOrEffect(numGen)
    Ts.assert<Ef.Effect<number, never, never>>()(numResult as any)

    // Boolean effect
    const boolEffect = Ef.succeed(true)
    const boolResult = Efy.normalizeGenOrEffect(boolEffect)
    Ts.assert<Ef.Effect<boolean, never, never>>()(boolResult)
  })

  test('preserves requirements when normalizing generators with context requirements', () => {
    // Create test contexts
    class ConfigService extends Ctx.Tag('ConfigService')<ConfigService, { apiUrl: string }>() {}
    class DatabaseService extends Ctx.Tag('DatabaseService')<DatabaseService, { connectionString: string }>() {}

    // Test with single requirement
    const singleReqGen: Efy.EffectOrGen<string, Error, ConfigService> = function*() {
      const config = yield* ConfigService
      return config.apiUrl
    }
    const singleResult = Efy.normalizeGenOrEffect(singleReqGen)
    // Type assertion - now properly preserves requirements
    Ts.assert<Ef.Effect<string, Error, ConfigService>>()(singleResult as any)

    // Test with multiple requirements (union)
    const multiReqGen: Efy.EffectOrGen<string, Error, ConfigService | DatabaseService> = function*() {
      const config = yield* ConfigService
      const db = yield* DatabaseService
      return `${config.apiUrl} - ${db.connectionString}`
    }
    const multiResult = Efy.normalizeGenOrEffect(multiReqGen)
    // Type assertion - preserves union requirements
    Ts.assert<Ef.Effect<string, Error, ConfigService | DatabaseService>>()(multiResult as any)

    // Test with Effect that has requirements
    const effectWithReq: Efy.EffectOrGen<number, never, ConfigService> = Ef.gen(function*() {
      const config = yield* ConfigService
      return config.apiUrl.length
    })
    const effectResult = Efy.normalizeGenOrEffect(effectWithReq)
    // Type assertion - preserves requirements from Effect
    Ts.assert<Ef.Effect<number, never, ConfigService>>()(effectResult as any)
  })
})
