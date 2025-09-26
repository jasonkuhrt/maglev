import { ProjectCard } from '#blocks/project-card'
import { Card } from '#components/card'
import { PageLayout } from '#components/page-layout'
import { Heading, Text } from '#components/typography'
import { Route } from '#composers/route'
import { projects } from '#data/mock'
import { Grid } from '#styled-system/jsx'

export const ServerComponent = Route.Server(function*() {
  return (
    <PageLayout maxWidth='lg'>
      <Heading size='xl' caps marginBottom='40px'>
        Projects
      </Heading>

      {projects.length === 0
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
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </Grid>
        )}
    </PageLayout>
  )
})
