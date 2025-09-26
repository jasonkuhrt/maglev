import { Graffle } from './__generated__/_namespace'
import { MissingApiTokenError } from './errors'
import { getToken } from './token'

export const create = () => {
  return Graffle.create()
    .transport({
      url: new URL('https://backboard.railway.app/graphql/v2'),
    })
    .anyware(async function addAuthToken({ exchange }) {
      const token = getToken()
      if (!token) {
        // Throw our custom error directly
        throw new MissingApiTokenError()
      }

      // Add token to request headers - use set() to ensure header is properly added
      const headers = new Headers(exchange.input.request.headers)
      headers.set('Authorization', `Bearer ${token}`)
      exchange.input.request.headers = headers

      // Continue with the request
      return exchange()
    })
}

export type Client = ReturnType<typeof create>
