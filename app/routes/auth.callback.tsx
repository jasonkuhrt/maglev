import { Route } from '#composers/route'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Ef } from '#deps/effect'
import { redirect } from 'react-router'

export const loader = Route.loader(function*() {
  const request = yield* Route.Request
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    throw new Response('Missing authorization code', { status: 400 })
  }

  // Get session using Effect
  const requestInfo: Session.RequestInfoData = {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  }
  const session = yield* Session.getSession(requestInfo)

  // Exchange code for access token
  const tokenResponse = yield* Ef.tryPromise({
    try: () =>
      fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: import.meta.env['VITE_GITHUB_CLIENT_ID'] || 'dev_client_id',
          client_secret: import.meta.env['VITE_GITHUB_CLIENT_SECRET'] || 'dev_client_secret',
          code,
        }),
      }).then((r) => r.json()),
    catch: (cause) => new Error('Failed to exchange code for token', { cause }),
  })

  const accessToken = tokenResponse.access_token
  if (!accessToken) {
    throw new Response(
      `Failed to get access token: ${tokenResponse.error_description || tokenResponse.error || 'Unknown error'}`,
      { status: 500 },
    )
  }

  // Get user info from GitHub
  const githubUser = yield* Ef.tryPromise({
    try: () =>
      fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }).then((r) => r.json()),
    catch: (cause) => new Error('Failed to fetch GitHub user', { cause }),
  })

  // Create or update user in database
  const gel = yield* Gel.Client

  // First check if user exists
  const existingUser = yield* Ef.tryPromise({
    try: () =>
      Gel.$.select(Gel.$.User, (user) => ({
        filter_single: Gel.$.op(user.githubId, '=', String(githubUser.id)),
        id: true,
        githubId: true,
        username: true,
      })).run(gel.client),
    catch: () => null,
  })

  let user
  if (existingUser) {
    // Update existing user
    user = yield* Ef.tryPromise({
      try: () =>
        Gel.$.update(Gel.$.User, () => ({
          filter_single: { id: existingUser.id },
          set: {
            lastLoginAt: new Date(),
            avatarUrl: githubUser.avatar_url,
          },
        })).run(gel.client),
      catch: (cause) => new Error('Failed to update user', { cause }),
    })
  } else {
    // Create new user
    user = yield* Ef.tryPromise({
      try: () =>
        Gel.$.insert(Gel.$.User, {
          githubId: String(githubUser.id),
          username: githubUser.login,
          avatarUrl: githubUser.avatar_url,
          email: githubUser.email,
          lastLoginAt: new Date(),
        }).run(gel.client),
      catch: (cause) => new Error('Failed to create user', { cause }),
    })
  }

  // Store user ID in session
  const userId = user?.id
  if (userId) {
    session.set('userId', userId)
  }

  // Commit session and get cookie
  const cookie = yield* Session.commitSession(session)

  return redirect('/projects', {
    headers: {
      'Set-Cookie': cookie,
    },
  })
})
