import { Gel } from '#core/gel'
import { templates } from '#data/mock'
import { Ef } from '#deps/effect'

// Template type - will be replaced with EdgeDB generated type
export interface Template {
  id: string
  name: string
  description: string
  shortDescription: string
  techStack: string[]
  category: 'frontend' | 'backend' | 'fullstack'
  githubRepo: string
  previewImage?: string
  status: 'available' | 'coming-soon'
  order: number
}

/**
 * Get all templates ordered by their display order
 */
export const getAll = () =>
  Ef.gen(function*() {
    // TODO: Replace with actual EdgeDB query once set up
    // const { client } = yield* Gel.GelClient
    // return yield* Ef.tryPromise({
    //   try: () => e
    //     .select(e.Template, () => ({
    //       ...e.Template['*'],
    //       order_by: e.Template.order,
    //     }))
    //     .run(client),
    //   catch: (error) => new Gel.GelError({
    //     message: 'Failed to fetch templates',
    //     cause: error
    //   })
    // })

    // Mock implementation for now
    return templates as Template[]
  })

/**
 * Get a template by ID
 */
export const getById = (id: string) =>
  Ef.gen(function*() {
    // TODO: Replace with actual EdgeDB query once set up
    // const { client } = yield* Gel.GelClient
    // return yield* Ef.tryPromise({
    //   try: async () => {
    //     const template = await e
    //       .select(e.Template, (t) => ({
    //         filter_single: e.op(t.id, '=', e.uuid(id)),
    //         ...e.Template['*'],
    //       }))
    //       .run(client)
    //
    //     if (!template) {
    //       throw new Gel.NotFoundError({
    //         resource: 'Template',
    //         id
    //       })
    //     }
    //
    //     return template
    //   },
    //   catch: (error) => {
    //     if (error instanceof Gel.NotFoundError) return error
    //     return new Gel.GelError({
    //       message: `Failed to fetch template ${id}`,
    //       cause: error
    //     })
    //   }
    // })

    // Mock implementation for now
    const template = templates.find(t => t.id === id)
    if (!template) {
      yield* Ef.fail(
        new Gel.NotFoundError({
          resource: 'Template',
          id,
        }),
      )
    }
    return template as Template
  })

export const TemplateRepository = {
  getAll,
  getById,
}
