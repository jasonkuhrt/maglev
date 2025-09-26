import { RailwayTokenPrompt } from '#blocks/prompt-railway-token'
import { Settings } from '#core/settings'
import { Ef } from '#deps/effect'
import type { ReactElement } from 'react'

/**
 * Composer for server components that require API key
 * Checks if API key is configured and returns RailwayTokenPrompt if missing
 *
 * Usage in a Route.Server component:
 * ```tsx
 * const apiKeyCheck = yield* withApiKey
 * if (apiKeyCheck) return apiKeyCheck
 * ```
 */
export const withApiKey = Ef.gen(function*() {
  const hasKey = yield* Settings.hasApiKey

  if (!hasKey) {
    return <RailwayTokenPrompt /> as ReactElement
  }

  return null
})
