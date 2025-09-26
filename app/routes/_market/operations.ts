import { Ef } from '#deps/effect'
import { Railway } from '#lib/railway'

export const fetchTemplates = Ef.gen(function*() {
  const railway = yield* Railway.Context

  const result = yield* Railway.toEffect(
    railway.query.templates({
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
    }),
  )

  const templates = result.edges
    .filter((edge) => edge.node !== null)
    .map((edge) => edge.node)

  return templates
})

// Export the inferred type for templates
export type Templates = Ef.Effect.Success<typeof fetchTemplates>
export type Template = Templates[number]
