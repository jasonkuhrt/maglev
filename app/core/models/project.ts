import { Gel } from '#core/gel'
import { projects } from '#data/mock'
import { Ef } from '#deps/effect'
import type { Template } from './template.js'

// Project type - will be replaced with EdgeDB generated type
export interface Project {
  id: string
  name: string
  template: Template
  railwayProjectId: string
  railwayServiceId?: string
  railwayEnvironmentId?: string
  createdAt: string
  updatedAt?: string
  status?: 'running' | 'stopped' | 'error'
  url?: string
}

/**
 * Get all projects ordered by creation date (newest first)
 */
export const getAll = () =>
  Ef.gen(function*() {
    // TODO: Replace with actual EdgeDB query once set up
    // const { client } = yield* Gel.GelClient
    // return yield* Ef.tryPromise({
    //   try: () => e
    //     .select(e.Project, () => ({
    //       ...e.Project['*'],
    //       template: e.Project.template['*'],
    //       order_by: {
    //         expression: e.Project.createdAt,
    //         direction: e.DESC,
    //       },
    //     }))
    //     .run(client),
    //   catch: (error) => new Gel.GelError({
    //     message: 'Failed to fetch projects',
    //     cause: error
    //   })
    // })

    // Mock implementation for now
    return projects as unknown as Project[]
  })

/**
 * Get a project by ID with its template
 */
export const getById = (id: string) =>
  Ef.gen(function*() {
    // TODO: Replace with actual EdgeDB query once set up
    // const { client } = yield* Gel.GelClient
    // return yield* Ef.tryPromise({
    //   try: async () => {
    //     const project = await e
    //       .select(e.Project, (p) => ({
    //         filter_single: e.op(p.id, '=', e.uuid(id)),
    //         ...e.Project['*'],
    //         template: e.Project.template['*'],
    //       }))
    //       .run(client)
    //
    //     if (!project) {
    //       throw new Gel.NotFoundError({
    //         resource: 'Project',
    //         id
    //       })
    //     }
    //
    //     return project
    //   },
    //   catch: (error) => {
    //     if (error instanceof Gel.NotFoundError) return error
    //     return new Gel.GelError({
    //       message: `Failed to fetch project ${id}`,
    //       cause: error
    //     })
    //   }
    // })

    // Mock implementation for now
    const project = projects.find(p => p.id === id)
    if (!project) {
      yield* Ef.fail(
        new Gel.NotFoundError({
          resource: 'Project',
          id,
        }),
      )
    }
    return project as unknown as Project
  })

/**
 * Create a new project
 */
export const create = (data: {
  name: string
  templateId: string
  railwayProjectId: string
  railwayServiceId?: string
  railwayEnvironmentId?: string
}) =>
  Ef.gen(function*() {
    // TODO: Replace with actual EdgeDB query once set up
    // const { client } = yield* Gel.GelClient
    // return yield* Ef.tryPromise({
    //   try: () => e
    //     .insert(e.Project, {
    //       name: data.name,
    //       template: e.select(e.Template, (t) => ({
    //         filter_single: e.op(t.id, '=', e.uuid(data.templateId)),
    //       })),
    //       railwayProjectId: data.railwayProjectId,
    //       railwayServiceId: data.railwayServiceId,
    //       railwayEnvironmentId: data.railwayEnvironmentId,
    //     })
    //     .run(client),
    //   catch: (error) => new Gel.GelError({
    //     message: 'Failed to create project',
    //     cause: error
    //   })
    // })

    // Mock implementation for now
    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name: data.name,
      template: { id: data.templateId } as Template,
      railwayProjectId: data.railwayProjectId,
      ...(data.railwayServiceId && { railwayServiceId: data.railwayServiceId }),
      ...(data.railwayEnvironmentId && { railwayEnvironmentId: data.railwayEnvironmentId }),
      createdAt: new Date().toISOString(),
    }
    return newProject
  })

/**
 * Delete a project by ID
 */
export const deleteById = (id: string) =>
  Ef.gen(function*() {
    // TODO: Replace with actual EdgeDB query once set up
    // const { client } = yield* Gel.GelClient
    // return yield* Ef.tryPromise({
    //   try: async () => {
    //     const result = await e
    //       .delete(e.Project, (p) => ({
    //         filter_single: e.op(p.id, '=', e.uuid(id)),
    //       }))
    //       .run(client)
    //
    //     if (!result) {
    //       throw new Gel.NotFoundError({
    //         resource: 'Project',
    //         id
    //       })
    //     }
    //
    //     return result
    //   },
    //   catch: (error) => {
    //     if (error instanceof Gel.NotFoundError) return error
    //     return new Gel.GelError({
    //       message: `Failed to delete project ${id}`,
    //       cause: error
    //     })
    //   }
    // })

    // Mock implementation for now
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) {
      yield* Ef.fail(
        new Gel.NotFoundError({
          resource: 'Project',
          id,
        }),
      )
    }
    projects.splice(index, 1)
    return true
  })

export const ProjectRepository = {
  getAll,
  getById,
  create,
  deleteById,
}
