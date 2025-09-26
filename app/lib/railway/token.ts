/**
 * Module-level mutable state for Railway API token.
 * This allows us to update the token at runtime without recreating the Graffle client.
 */

let _token: string | null = null

export const getToken = () => _token

export const setToken = (newToken: string | null) => {
  _token = newToken
}

// For backward compatibility
export { _token as token }
