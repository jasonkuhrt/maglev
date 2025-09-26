import { Ef, Lr } from '#deps/effect'
import { Railway } from '#lib/railway'
import { Service, ServiceLive } from '../settings/$$.js'

/**
 * Configuration error for Railway setup
 */
export class RailwayConfigError extends Error {
  readonly _tag = 'RailwayConfigError'
  constructor(message: string) {
    super(message)
    this.name = 'RailwayConfigError'
  }
}

/**
 * Live implementation of Railway client that integrates with Settings
 */
export const ContextLive = Lr.effect(
  Railway.Context,
  Ef.gen(function*() {
    const settingsService = yield* Service
    const settings = yield* settingsService.read

    // Set the module token variable
    Railway.setToken(settings.railwayApiToken)

    // Return single client instance (created once)
    // The anyware middleware will handle missing token
    return Railway.create()
  }),
).pipe(
  Lr.provide(ServiceLive),
)
