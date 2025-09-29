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

  console.log('Delete action called with:', { projectId, railwayProjectId })

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
    console.log('Attempting to delete from Railway:', railwayProjectId)
    const deleteResult = yield* Ef.tryPromise({
      try: () =>
        railway.mutation.projectDelete({
          $: {
            id: railwayProjectId,
          },
        }),
      catch: (cause) => {
        // Log the error but don't fail - we still want to delete from our DB
        console.error('Failed to delete from Railway:', cause)
        return false
      },
    })

    if (deleteResult) {
      console.log('Successfully deleted project from Railway')
    } else {
      console.log('Railway deletion failed or returned false')
    }
  }

  // Delete from our database
  console.log('Attempting to delete from database:', projectId)

  const deleteResult = yield* Ef.tryPromise({
    try: async () => {
      const result = await Gel.$.delete(Gel.$.Project, project => ({
        filter_single: Gel.$.op(project.id, '=', Gel.$.uuid(projectId)),
      })).run(gel.client)
      console.log('Database delete result:', result)
      return result
    },
    catch: (cause) => {
      console.error('Database delete failed:', cause)
      return new Error('Failed to delete project from database', { cause })
    },
  })

  // Check if the delete actually failed
  if (deleteResult instanceof Error) {
    console.log('Delete failed, returning error response')
    return Response.json({
      success: false,
      error: deleteResult.message,
    }, { status: 500 })
  }

  console.log('Delete completed, returning success response')
  const response = Response.json({
    success: true,
    message: 'Project deleted successfully',
    deletedId: projectId,
  })
  console.log('Returning response:', response)
  return response
})
