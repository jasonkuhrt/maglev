import { Settings } from '#core/settings'
import { Ef, Ei } from '#deps/effect'
import { Railway } from '#lib/railway'

export const fetchTemplates = Ef.gen(function*() {
  // Load settings and set the token
  const settingsService = yield* Settings.Service
  const settings = yield* settingsService.read
  Railway.setToken(settings.railwayApiToken)

  // Create Railway client - it will return MissingApiTokenError if no token
  const railway = Railway.create()

  const templates = yield* Ef.tryPromise({
    try: async () => {
      const result = await railway.query.templates({
        $: { first: 50 },
        edges: {
          node: {
            id: true,
            code: true,
            name: true,
            description: true,
            serializedConfig: true,
          },
        },
      })

      // Check if there are GraphQL errors in the result
      if (result && typeof result === 'object' && 'errors' in result && result.errors) {
        console.error('GraphQL errors:', result.errors)
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
      }

      return result
    },
    catch: (error) => {
      return error // Pass through the error as-is
    },
  }).pipe(Ef.either)

  return Ei.map(templates, templates => {
    return templates.edges
      .filter((edge) => edge.node !== null)
      .map((edge) => edge.node)
  })
})

// Export the inferred type for templates
export type Templates = Ei.Either.Right<Ef.Effect.Success<typeof fetchTemplates>>
export type Template = Templates[number]
