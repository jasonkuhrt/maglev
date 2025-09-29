import { Route } from '#composers/route'
import { Ef } from '#deps/effect'
import { redirect } from 'react-router'

export const action = Route.action(function*() {
  const request = yield* Route.Request
  const state = crypto.randomUUID()

  // Get the origin from the request URL
  const url = new URL(request.url)
  const origin = url.origin

  const params = new URLSearchParams({
    client_id: import.meta.env['VITE_GITHUB_CLIENT_ID'] || 'dev_client_id',
    redirect_uri: `${origin}/auth/callback`,
    scope: 'read:user user:email',
    state,
  })

  return redirect(`https://github.com/login/oauth/authorize?${params}`)
})
