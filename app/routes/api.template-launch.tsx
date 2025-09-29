import { Route } from '#composers/route'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Settings } from '#core/settings'
import { Ef, Sc } from '#deps/effect.js'
import { Railway } from '#lib/railway'

// Define validation schema for template launch
const LaunchTemplateSchema = Sc.Struct({
  templateId: Sc.String,
  templateCode: Sc.String,
  templateName: Sc.String,
  projectName: Sc.String.pipe(
    Sc.minLength(3),
    Sc.maxLength(50),
    Sc.pattern(/^[a-zA-Z0-9-_]+$/),
  ),
})

export const action = Route.action(function*() {
  const { templateId, templateCode, templateName, projectName } = yield* Route.Args(LaunchTemplateSchema)

  // Ensure user is authenticated
  const session = yield* Session.Context
  const user = yield* session.getUser()

  // Get services from context
  const railway = yield* Railway.Context
  const gel = yield* Gel.Client
  const settings = yield* Settings.Service

  // Load the user's Railway token
  const userSettings = yield* settings.read(user.githubId).pipe(
    Ef.catchAll(() => Ef.succeed({ railwayApiToken: null, theme: Settings.Theme.system })),
  )

  if (!userSettings.railwayApiToken) {
    throw new Error('Railway API token not configured. Please add your token in Settings.')
  }

  // Get workspace ID (REQUIRED for template deployment)
  const workspaceId = yield* Ef.tryPromise({
    try: async () => {
      // First try to get the user's workspaces using the correct 'me' field
      // Note: workspaces returns a direct array, not a paginated connection
      const me = await railway.query.me({
        workspaces: {
          id: true,
          name: true,
        },
      })

      // todo don't hardcard selection of workspace
      const workspace = me?.workspaces?.[0]

      if (!workspace) {
        throw new Error(
          'No workspace found for this Railway account. Please ensure your Railway API token has access to at least one workspace.',
        )
      }

      return workspace.id
    },
    catch: (cause) => {
      return new Error(
        `Failed to get workspace from Railway API. Please check your Railway API token has proper permissions.`,
        { cause },
      )
    },
  })

  const template = yield* Ef.tryPromise({
    try: () =>
      railway.query.template({
        $: {
          code: templateCode,
        },
        id: true,
        code: true,
        name: true,
        serializedConfig: true, // Get the serialized config for v2 deployment
      }),
    catch: (cause) => {
      // new Error('Failed to query template', { cause: error })
      return new Error('Failed to query template from Railway:', { cause })
    },
  })

  // Step 1: Store template in database if it doesn't exist
  const existingTemplate = yield* Ef.tryPromise({
    try: () =>
      Gel.$.select(Gel.$.Template, template => ({
        filter_single: Gel.$.op(template.code, '=', templateCode),
      })).run(gel.client),
    catch: (cause) => new Error('Failed to try getting existing template', { cause }),
  })

  if (!existingTemplate) {
    yield* Ef.tryPromise({
      try: () =>
        Gel.$.insert(Gel.$.Template, {
          code: templateCode,
          name: templateName,
          createdAt: new Date(),
        }).run(gel.client),
      catch: (cause) => new Error(`Failed to store template`, { cause }),
    })
  }

  // Step 2: Deploy template via Railway using V2 API
  const deployment = yield* Ef.tryPromise({
    try: () =>
      railway.mutation.templateDeployV2({
        $: {
          input: {
            templateId: template.id, // Use template ID instead of code
            workspaceId,
            serializedConfig: template.serializedConfig ?? null, // Railway API expects this field even if null
          } as any,
        },
        projectId: true,
        workflowId: true,
      }),
    catch: (cause: any) => {
      return new Error('Failed to deploy template', { cause })
    },
  })

  // Check if deployment failed
  if (deployment instanceof Error) {
    return Response.json({
      success: false,
      error: deployment.message,
    }, { status: 500 })
  }

  // Step 3: Store project in database - just the reference data
  const project = yield* Ef.tryPromise({
    try: () =>
      Gel.$.insert(Gel.$.Project, {
        name: projectName,
        owner: Gel.$.select(Gel.$.User, u => ({
          filter_single: Gel.$.op(u.id, '=', Gel.$.uuid(user.id)),
        })),
        templateId: templateId,
        railwayProjectId: deployment.projectId,
        createdAt: new Date(),
        // No status field - Railway is the source of truth for deployment status
      }).run(gel.client),
    catch: (cause) => new Error(`Failed to store project`, { cause }),
  })

  // No polling needed - Railway maintains the deployment status
  // Project pages will query Railway directly for current status

  return Response.json({
    success: true,
    projectId: project.id,
    railwayProjectId: deployment.projectId,
    workflowId: deployment.workflowId,
  })
})
