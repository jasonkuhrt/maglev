import { Config } from '#core/config'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Settings } from '#core/settings'
import { Ef, Lr } from '#deps/effect'
import { Railway } from '#lib/railway'
import { FileSystem } from '@effect/platform'
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem'

/**
 * Base runtime shared by all route composers (loader, action, Server)
 * Includes all common service layers except Session (which requires request info)
 */
export const BaseRuntime = Lr.mergeAll(
  NodeFileSystem.layer,
  Config.ConfigServiceLive,
  Gel.ClientLive,
  Settings.ServiceLive,
)

/**
 * Creates the complete runtime for route composers
 * Provides all services including Session and Railway contexts
 *
 * @param requestInfo Request information for session management
 * @returns Complete runtime layer with all services
 */
export const createRouteRuntime = (requestInfo: Session.RequestInfoData) => {
  const sessionLayer = Session.SessionService.layer(requestInfo)

  return Lr.mergeAll(
    BaseRuntime,
    sessionLayer,
    // Railway.ContextLive depends on Session.Context from sessionLayer
    Railway.ContextLive,
  )
}

/**
 * Provides all route services to an Effect
 * This is the standard way to provide services in route composers
 *
 * @param requestInfo Request information for session management
 * @returns Function that can be used in pipe chains to provide services
 */
export const provideRouteServices = (requestInfo: Session.RequestInfoData) => {
  const runtime = createRouteRuntime(requestInfo)
  return <R, E, A>(
    effect: Ef.Effect<A, E, R>,
  ): Ef.Effect<
    A,
    E,
    Exclude<
      R,
      Config.ConfigService | Gel.Client | Settings.Service | Session.Context | Railway.Context | FileSystem.FileSystem
    >
  > => effect.pipe(Ef.provide(runtime))
}
