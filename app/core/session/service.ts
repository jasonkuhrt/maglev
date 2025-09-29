import { Gel } from '#core/gel'
import { Ef, Lr } from '#deps/effect'
import { checkAuth, Context, NotAuthenticatedError, type RequestInfoData, type User } from './session.js'

/**
 * Create the session service implementation
 */
export const make = (requestInfo: RequestInfoData): Ef.Effect<
  {
    readonly getUser: () => Ef.Effect<User, NotAuthenticatedError, Gel.Client>
    readonly getUserMaybe: () => Ef.Effect<User | null, never, Gel.Client>
  },
  never,
  never
> =>
  Ef.succeed({
    getUserMaybe: () =>
      checkAuth(requestInfo).pipe(
        Ef.catchAll(() => Ef.succeed(null)),
      ),

    getUser: () =>
      Ef.gen(function*() {
        const user = yield* checkAuth(requestInfo).pipe(
          Ef.catchAll(() => Ef.succeed(null)),
        )
        if (!user) {
          return yield* Ef.fail(new NotAuthenticatedError())
        }
        return user
      }),
  })

/**
 * Layer that provides the Session.Session service
 */
export const layer = (requestInfo: RequestInfoData) => Lr.effect(Context, make(requestInfo))

/**
 * Namespace for SessionService utilities
 */
export const SessionService = {
  layer,
  make,
}
