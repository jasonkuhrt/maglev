import { ProjectCard, type Props as ProjectCardProps } from '#blocks/project-card'
import { Card } from '#components/card'
import { PageLayout } from '#components/page-layout'
import { Heading, Text } from '#components/typography'
import { Route } from '#composers/route'
import { Gel } from '#core/gel'
import { Ef } from '#deps/effect.js'
import { Railway } from '#lib/railway'
import { Grid } from '#styled-system/jsx'

export const loader = Route.loader()

export const ServerComponent = Route.Server(function*() {
  const railway = yield* Railway.Context
  const gel = yield* Gel.Client

  // Fetch all projects from database
  const projects = yield* Ef.tryPromise({
    try: () =>
      Gel.$.select(Gel.$.Project, project => ({
        id: true,
        name: true,
        railwayProjectId: true,
        createdAt: true,
        template: {
          name: true,
          description: true,
        },
        order_by: { expression: project.createdAt, direction: Gel.$.DESC },
      })).run(gel.client),
    catch: (cause) =>
      new Gel.Errors.DatabaseOperationError({
        operation: 'select',
        table: 'Project',
        cause,
      }),
  })

  // Enrich projects with Railway data to determine status
  const enrichedProjects = yield* Ef.forEach(projects, (project) =>
    Ef.gen(function*() {
      // Default status if we can't query Railway
      let status: 'deploying' | 'active' | 'failed' | 'unknown' = 'unknown'
      let deploymentUrl: string | null = null
      let railwayData: any = null

      if (project.railwayProjectId) {
        // Try to fetch Railway project data
        const railwayProject = yield* Ef.tryPromise({
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
              message: 'Failed to fetch Railway data',
              cause,
            }),
        }).pipe(
          Ef.catchAll(() => Ef.succeed(null)),
        )

        if (railwayProject) {
          railwayData = railwayProject
          const deployments = railwayProject.deployments?.edges || []
          const hasServices = (railwayProject.services?.edges || []).length > 0

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
      }

      return {
        ...project,
        status,
        url: deploymentUrl,
        railwayData,
      }
    }), { concurrency: 5 })

  return (
    <PageLayout maxWidth='lg'>
      <Heading size='xl' caps marginBottom='40px'>
        Projects
      </Heading>

      {enrichedProjects.length === 0
        ? (
          <Card padding='md'>
            <Text>No projects yet. Deploy a template to get started.</Text>
          </Card>
        )
        : (
          <Grid
            gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap='0'
          >
            {enrichedProjects.map((project) => {
              const projectData: ProjectCardProps['project'] = {
                id: project.id,
                name: project.name,
                status: project.status === 'unknown'
                  ? 'deploying'
                  : project.status as 'deploying' | 'active' | 'failed', // Default unknown to deploying for UI
                templateName: project.template?.name || 'Unknown Template',
                templateDescription: project.template?.description || null,
                createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
                railwayProjectId: project.railwayProjectId,
                railwayData: project.railwayData,
              }

              // Add optional URL if we found a deployment URL
              if (project.url) {
                projectData.url = project.url
              }

              return <ProjectCard key={project.id} project={projectData} />
            })}
          </Grid>
        )}
    </PageLayout>
  )
})
