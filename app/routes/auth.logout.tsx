import { Route } from '#composers/route'
import { Session } from '#core/session'
import { Ef } from '#deps/effect'
import { redirect } from 'react-router'

export const action = Route.action(function*() {
  const request = yield* Route.Request
  const requestInfo: Session.RequestInfoData = {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  }

  const session = yield* Session.getSession(requestInfo)
  const cookie = yield* Session.destroySession(session)

  return redirect('/', {
    headers: {
      'Set-Cookie': cookie,
    },
  })
})
