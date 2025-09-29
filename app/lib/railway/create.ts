import { Graffle } from './__generated__/_namespace.js'
import { MissingApiTokenError } from './errors.js'
import { getToken } from './token.js'

export const create = () => {
  return Graffle.create()
    .transport({
      url: new URL('https://backboard.railway.app/graphql/v2'), // Using v2 API
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
  // .anyware(async function logRequests({ exchange }) {
  //   // Log the request body to see the actual GraphQL query
  //   console.log('\n📤 Railway GraphQL Request:')
  //   console.log('Body:', exchange.input.request.body)

  //   const result = await exchange()

  //   // Only log response if it's an error
  //   if (result instanceof Error || (result && typeof result === 'object' && 'errors' in result)) {
  //     console.log('\n📥 Railway GraphQL Response (Error):')
  //     console.log(JSON.stringify(result, null, 2))
  //   }

  //   return result
  // })
}

export type Client = ReturnType<typeof create>
