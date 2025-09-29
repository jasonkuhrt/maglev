import { Route } from '#composers/route'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Ef, Sc } from '#deps/effect.js'
import { Railway } from '#lib/railway'

// Define validation schema for project deletion
const DeleteProjectSchema = Sc.Struct({
  projectId: Sc.String,
  railwayProjectId: Sc.optional(Sc.String),
})

export const action = Route.action(function*() {
  const { projectId, railwayProjectId } = yield* Route.Args(DeleteProjectSchema)

  // Ensure user is authenticated
  const session = yield* Session.Context
  const user = yield* session.getUser()

  const gel = yield* Gel.Client
  const railway = yield* Railway.Context

  // First verify the user owns this project
  const project = yield* Ef.tryPromise({
    try: () =>
      Gel.$.select(Gel.$.Project, p => ({
        filter_single: Gel.$.op(p.id, '=', Gel.$.uuid(projectId)),
        owner: { id: true },
      })).run(gel.client),
    catch: (cause) => new Error('Failed to fetch project', { cause }),
  })

  if (!project) {
    return Response.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.owner?.id !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // If there's a Railway project ID, try to delete from Railway first
  if (railwayProjectId) {
    const deleteResult = yield* Ef.tryPromise({
      try: () =>
        railway.mutation.projectDelete({
          $: {
            id: railwayProjectId,
          },
        }),
      catch: (cause) => {
        // Don't fail - we still want to delete from our DB
        return false
      },
    })
  }

  // Delete from our database
  const deleteResult = yield* Ef.tryPromise({
    try: async () => {
      return await Gel.$.delete(Gel.$.Project, project => ({
        filter_single: Gel.$.op(project.id, '=', Gel.$.uuid(projectId)),
      })).run(gel.client)
    },
    catch: (cause) => {
      return new Error('Failed to delete project from database', { cause })
    },
  })

  // Check if the delete actually failed
  if (deleteResult instanceof Error) {
    return Response.json({
      success: false,
      error: deleteResult.message,
    }, { status: 500 })
  }

  return Response.json({
    success: true,
    message: 'Project deleted successfully',
    deletedId: projectId,
  })
})
