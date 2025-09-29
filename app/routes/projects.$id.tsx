import { ProjectActions } from '#blocks/project-actions'
import { PageLayout } from '#components/page-layout'
import { Heading } from '#components/typography'
import { Route } from '#composers/route'
import { Gel } from '#core/gel'
import { Session } from '#core/session'
import { Ef } from '#deps/effect.js'
import { Railway } from '#lib/railway'
import { styled } from '#styled-system/jsx'
import { Activity, ArrowLeft, Calendar, ExternalLink as ExternalLinkIcon, Globe, Layout } from 'lucide-react'
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
        <styled.div
          mb='24px'
          pb='24px'
          borderBottom='1px solid black'
          display='grid'
          gridTemplateColumns='1fr 2fr'
          alignItems='center'
        >
          <styled.div display='flex' alignItems='center' gap='8px'>
            <Activity size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
            <styled.label
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              color='black'
            >
              Status
            </styled.label>
          </styled.div>
          <styled.div display='flex' alignItems='center' gap='8px'>
            {status === 'active' && (
              <styled.span
                display='inline-block'
                w='8px'
                h='8px'
                borderRadius='50%'
                bg='green.500'
              />
            )}
            {status === 'deploying' && (
              <styled.span
                display='inline-block'
                w='8px'
                h='8px'
                borderRadius='50%'
                bg='yellow.500'
              />
            )}
            {status === 'failed' && (
              <styled.span
                display='inline-block'
                w='8px'
                h='8px'
                borderRadius='50%'
                bg='red.500'
              />
            )}
            {status === 'unknown' && (
              <styled.span
                display='inline-block'
                w='8px'
                h='8px'
                borderRadius='50%'
                bg='gray.400'
              />
            )}
            <styled.span
              fontSize='md'
              fontWeight='400'
              textTransform='uppercase'
              color='black'
            >
              {status}
            </styled.span>
          </styled.div>
        </styled.div>

        {/* Deployment URL */}
        {deploymentUrl && (
          <styled.div
            mb='24px'
            pb='24px'
            borderBottom='1px solid black'
            display='grid'
            gridTemplateColumns='1fr 2fr'
            alignItems='center'
          >
            <styled.div display='flex' alignItems='center' gap='8px'>
              <Globe size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
              <styled.label
                fontSize='xs'
                fontWeight='700'
                letterSpacing='0.08em'
                textTransform='uppercase'
                color='black'
              >
                Deployment URL
              </styled.label>
            </styled.div>
            <styled.a
              href={deploymentUrl}
              target='_blank'
              display='inline-flex'
              alignItems='center'
              gap='6px'
              fontSize='md'
              fontWeight='400'
              color='black'
              borderBottom='1px dashed black'
              textDecoration='none'
              pb='1px'
              _hover={{
                borderBottom: '1px solid black',
              }}
            >
              {deploymentUrl}
              <ExternalLinkIcon size={12} strokeWidth={2} />
            </styled.a>
          </styled.div>
        )}

        {/* Railway Dashboard */}
        {project.railwayProjectId && (
          <styled.div
            mb='24px'
            pb='24px'
            borderBottom='1px solid black'
            display='grid'
            gridTemplateColumns='1fr 2fr'
            alignItems='center'
          >
            <styled.div display='flex' alignItems='center' gap='8px'>
              <Layout size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
              <styled.label
                fontSize='xs'
                fontWeight='700'
                letterSpacing='0.08em'
                textTransform='uppercase'
                color='black'
              >
                Railway Dashboard
              </styled.label>
            </styled.div>
            <styled.a
              href={`https://railway.app/project/${project.railwayProjectId}`}
              target='_blank'
              rel='noopener noreferrer'
              display='inline-flex'
              alignItems='center'
              gap='6px'
              fontSize='md'
              fontWeight='400'
              color='black'
              borderBottom='1px dashed black'
              textDecoration='none'
              pb='1px'
              _hover={{
                borderBottom: '1px solid black',
              }}
            >
              View on Railway
              <ExternalLinkIcon size={12} strokeWidth={2} />
            </styled.a>
          </styled.div>
        )}

        {/* Template */}
        {project.template && (project.template as any).name && (
          <styled.div
            mb='24px'
            pb='24px'
            borderBottom='1px solid black'
            display='grid'
            gridTemplateColumns='1fr 2fr'
            alignItems='center'
          >
            <styled.div display='flex' alignItems='center' gap='8px'>
              <Layout size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
              <styled.label
                fontSize='xs'
                fontWeight='700'
                letterSpacing='0.08em'
                textTransform='uppercase'
                color='black'
              >
                Template
              </styled.label>
            </styled.div>
            <styled.span fontSize='md' fontWeight='400'>
              {(project.template as any).name}
            </styled.span>
          </styled.div>
        )}

        {/* Created */}
        <styled.div display='grid' gridTemplateColumns='1fr 2fr' alignItems='center'>
          <styled.div display='flex' alignItems='center' gap='8px'>
            <Calendar size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
            <styled.label
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              color='black'
            >
              Created
            </styled.label>
          </styled.div>
          <styled.span fontSize='md' fontWeight='400'>
            {new Date(project.createdAt).toLocaleString()}
          </styled.span>
        </styled.div>

        {/* Show service count if available */}
        {railwayData && railwayData.services?.edges?.length > 0 && (
          <styled.div
            mt='24px'
            pt='24px'
            borderTop='1px solid black'
            display='grid'
            gridTemplateColumns='1fr 2fr'
            alignItems='center'
          >
            <styled.div display='flex' alignItems='center' gap='8px'>
              <Layout size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
              <styled.label
                fontSize='xs'
                fontWeight='700'
                letterSpacing='0.08em'
                textTransform='uppercase'
                color='black'
              >
                Services
              </styled.label>
            </styled.div>
            <styled.span fontSize='md' fontWeight='400'>
              {railwayData.services.edges.map(s => s.node.name).join(', ')}
            </styled.span>
          </styled.div>
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
