import { ProjectActions } from '#blocks/project-actions'
import { ExternalLink } from '#components/external-link'
import { InfoRow } from '#components/info-row'
import { PageLayout } from '#components/page-layout'
import { StatusIndicator } from '#components/status-indicator'
import { Heading } from '#components/typography'
import { Route } from '#composers/route'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Ef } from '#deps/effect.js'
import { Railway } from '#lib/railway'
import { styled } from '#styled-system/jsx'
import { Activity, ArrowLeft, Calendar, Globe, Layout } from 'lucide-react'
import { Link } from 'react-router'

export const loader = Route.loader()

export const ServerComponent = Route.Server(function*() {
  const session = yield* Session.Context
  yield* session.getUser()
  const railway = yield* Railway.Context
  const gel = yield* Gel.Client
  const params = yield* Route.Params
  const projectId = params['id']

  if (!projectId) {
    return (
      <PageLayout maxWidth='sm'>
        <Heading size='xl' caps>
          Project not found
        </Heading>
      </PageLayout>
    )
  }

  const project = yield* Ef.tryPromise({
    try: () =>
      Gel.$.select(Gel.$.Project, p => ({
        filter_single: Gel.$.op(p.id, '=', Gel.$.uuid(projectId)),
        id: true,
        name: true,
        railwayProjectId: true,
        createdAt: true,
        template: {
          name: true,
          description: true,
        },
      })).run(gel.client),
    catch: (cause) =>
      new Gel.Errors.DatabaseOperationError({
        operation: 'select',
        table: 'Project',
        cause,
      }),
  }).pipe(
    Ef.catchAll(() => Ef.succeed(null)),
  )

  if (!project) {
    return (
      <PageLayout maxWidth='sm'>
        <Heading size='xl' caps>
          Project not found
        </Heading>
      </PageLayout>
    )
  }

  // Fetch Railway data to get current deployment status
  let railwayData: {
    name: string
    id: string
    services: {
      edges: {
        node: {
          id: string
          name: string
        }
      }[]
    }
    deployments: {
      edges: {
        node: {
          id: string
          status:
            | 'CRASHED'
            | 'INITIALIZING'
            | 'REMOVED'
            | 'REMOVING'
            | 'SKIPPED'
            | 'WAITING'
            | 'BUILDING'
            | 'DEPLOYING'
            | 'FAILED'
            | 'NEEDS_APPROVAL'
            | 'QUEUED'
            | 'SLEEPING'
            | 'SUCCESS'
          staticUrl: string | null
        }
      }[]
    }
  } | null = null

  // Always query Railway if we have a project ID
  if (project.railwayProjectId) {
    railwayData = yield* Ef.tryPromise({
      try: () =>
        railway.query.project({
          $: {
            id: project.railwayProjectId,
          },
          id: true,
          name: true,
          services: {
            edges: {
              node: {
                id: true,
                name: true,
              },
            },
          },
          deployments: {
            $: {
              first: 10, // Get recent deployments
            },
            edges: {
              node: {
                id: true,
                status: true,
                staticUrl: true,
              },
            },
          },
        }),
      catch: (cause) =>
        new Railway.Errors.RailwayError({
          message: 'Failed to load Railway project data',
          cause,
        }),
    }).pipe(
      Ef.catchAll(() => Ef.succeed(null)),
    )
  }

  // Derive status from Railway deployment data
  let status: 'deploying' | 'active' | 'failed' | 'unknown' = 'unknown'
  let deploymentUrl: string | null = null

  if (railwayData) {
    const deployments = railwayData.deployments?.edges || []
    const hasServices = (railwayData.services?.edges || []).length > 0

    if (deployments.length > 0) {
      // Check deployment statuses
      const statuses = deployments.map(d => d.node.status)
      const mainDeployment = deployments.find(d => d.node.staticUrl)?.node

      if (mainDeployment?.staticUrl) {
        deploymentUrl = `https://${mainDeployment.staticUrl}`
      }

      if (statuses.some(s => s === 'SUCCESS')) {
        status = 'active'
      } else if (statuses.some(s => s === 'FAILED' || s === 'CRASHED')) {
        status = 'failed'
      } else if (statuses.some(s => s === 'BUILDING' || s === 'DEPLOYING' || s === 'INITIALIZING')) {
        status = 'deploying'
      }
    } else if (hasServices) {
      // Services exist but no deployments yet
      status = 'deploying'
    }
  }

  // Render the project detail UI directly
  return (
    <PageLayout maxWidth='sm'>
      {/* Back button */}
      <Link to='/templates' style={{ textDecoration: 'none' }}>
        <styled.span
          display='inline-flex'
          alignItems='center'
          gap='8px'
          fontSize='xs'
          fontWeight='700'
          letterSpacing='0.08em'
          textTransform='uppercase'
          color='black'
          mb='32px'
          _hover={{
            textDecoration: 'underline',
          }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to Projects
        </styled.span>
      </Link>

      <Heading size='xl' caps marginBottom='32px'>
        {project.name}
      </Heading>

      {/* Project Info Card */}
      <styled.div
        border='2px solid black'
        bg='white'
        p='40px'
        mb='24px'
      >
        {/* Status */}
        <InfoRow
          icon={<Activity size={14} strokeWidth={2} style={{ opacity: 0.7 }} />}
          label='Status'
          value={<StatusIndicator status={status} />}
        />

        {/* Deployment URL */}
        {deploymentUrl && (
          <InfoRow
            icon={<Globe size={14} strokeWidth={2} style={{ opacity: 0.7 }} />}
            label='Deployment URL'
            value={<ExternalLink href={deploymentUrl}>{deploymentUrl}</ExternalLink>}
          />
        )}

        {/* Railway Dashboard */}
        {project.railwayProjectId && (
          <InfoRow
            icon={<Layout size={14} strokeWidth={2} style={{ opacity: 0.7 }} />}
            label='Railway Dashboard'
            value={
              <ExternalLink href={`https://railway.app/project/${project.railwayProjectId}`}>
                View on Railway
              </ExternalLink>
            }
          />
        )}

        {/* Template */}
        {project.template && (project.template as any).name && (
          <InfoRow
            icon={<Layout size={14} strokeWidth={2} style={{ opacity: 0.7 }} />}
            label='Template'
            value={
              <styled.span fontSize='md' fontWeight='400'>
                {(project.template as any).name}
              </styled.span>
            }
          />
        )}

        {/* Created */}
        <InfoRow
          icon={<Calendar size={14} strokeWidth={2} style={{ opacity: 0.7 }} />}
          label='Created'
          value={
            <styled.span fontSize='md' fontWeight='400'>
              {new Date(project.createdAt).toLocaleString()}
            </styled.span>
          }
          isLast={!railwayData || !railwayData.services?.edges?.length}
        />

        {/* Show service count if available */}
        {railwayData && railwayData.services?.edges?.length > 0 && (
          <InfoRow
            icon={<Layout size={14} strokeWidth={2} style={{ opacity: 0.7 }} />}
            label='Services'
            value={
              <styled.span fontSize='md' fontWeight='400'>
                {railwayData.services.edges.map(s => s.node.name).join(', ')}
              </styled.span>
            }
            isLast
          />
        )}
      </styled.div>

      {/* Actions Card */}
      <styled.div
        border='2px solid black'
        bg='white'
        p='32px'
      >
        <Heading size='md' caps marginBottom='24px'>
          Actions
        </Heading>
        <styled.div display='flex' gap='12px' flexWrap='wrap'>
          <ProjectActions
            projectId={project.id}
            railwayProjectId={project.railwayProjectId}
          />
        </styled.div>
      </styled.div>
    </PageLayout>
  )
})
