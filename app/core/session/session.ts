import { Gel } from '#core/gel'
import { Ctx, Da, Ef } from '#deps/effect'
import { createCookieSessionStorage } from 'react-router'

// ================
// TYPES
// ================

/**
 * Serializable request information that can be passed between server/client
 * Headers can be either Headers object or plain object (for serialization)
 */
export type RequestInfoData = {
  url: string
  headers: Headers | Record<string, string>
}

/**
 * User type returned from authentication
 */
export interface User {
  id: string
  githubId: string
  username: string
  avatarUrl?: string | null
  email?: string | null
}

/**
 * Authentication error - user is not authenticated
 */
export class NotAuthenticatedError extends Da.TaggedError('NotAuthenticatedError')<{
  readonly message: string
}> {
  constructor(message: string = 'Authentication required') {
    super({ message })
  }
}

// ================
// CONTEXT TAGS
// ================

/**
 * Context tag for accessing serialized request info (available in ServerComponents)
 */
export class RequestInfo extends Ctx.Tag('Session.RequestInfo')<RequestInfo, RequestInfoData>() {}

/**
 * Session service that provides user access methods
 */
export class Context extends Ctx.Tag('Session.Context')<
  Context,
  {
    /**
     * Get the current user, fails with NotAuthenticatedError if not authenticated
     */
    readonly getUser: () => Ef.Effect<User, NotAuthenticatedError, Gel.Client>
    /**
     * Get the current user if authenticated, returns null otherwise
     */
    readonly getUserMaybe: () => Ef.Effect<User | null, never, Gel.Client>
  }
>() {}

// Create session storage using cookies
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'maglev_session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax',
    secrets: [import.meta.env['VITE_SESSION_SECRET'] || 'dev-secret-change-in-production'],
    secure: import.meta.env.PROD,
  },
})

// Helper to get session from request
export const getSession = (request: RequestInfoData) =>
  Ef.gen(function*() {
    const headers = request.headers instanceof Headers
      ? request.headers
      : new Headers(request.headers)
    const cookie = headers.get('Cookie')

    return yield* Ef.tryPromise({
      try: () => sessionStorage.getSession(cookie),
      catch: (cause) => new Error('Failed to get session', { cause }),
    })
  })

// Helper to commit session
export const commitSession = (session: any) =>
  Ef.tryPromise({
    try: () => sessionStorage.commitSession(session),
    catch: (cause) => new Error('Failed to commit session', { cause }),
  })

// Helper to destroy session
export const destroySession = (session: any) =>
  Ef.tryPromise({
    try: () => sessionStorage.destroySession(session),
    catch: (cause) => new Error('Failed to destroy session', { cause }),
  })

/**
 * Check if a user is authenticated using session
 */
export const checkAuth = (request: RequestInfoData) =>
  Ef.gen(function*() {
    const session = yield* getSession(request)

    const userId = session.get('userId')
    if (!userId) {
      return null
    }

    const gel = yield* Gel.Client
    const user = yield* Ef.tryPromise({
      try: () =>
        Gel.$.select(Gel.$.default.User, (user) => ({
          filter_single: Gel.$.op(user.id, '=', Gel.$.uuid(userId)),
          id: true,
          githubId: true,
          username: true,
          avatarUrl: true,
          email: true,
        })).run(gel.client),
      catch: () => null,
    })

    return user
  })

/**
 * Require authentication for a route
 * Fails with NotAuthenticatedError if not authenticated
 */
export const requireAuth = (request: RequestInfoData) =>
  Ef.gen(function*() {
    const user = yield* checkAuth(request)

    if (!user) {
      return yield* Ef.fail(new NotAuthenticatedError())
    }

    return user
  })
