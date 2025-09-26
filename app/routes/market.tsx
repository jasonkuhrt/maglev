import { RailwayTokenPrompt } from '#blocks/prompt-railway-token'
import { TemplateCard } from '#blocks/template-card'
import { Card } from '#components/card'
import { ErrorDisplay } from '#components/error-display'
import { PageLayout } from '#components/page-layout'
import { Heading, Text } from '#components/typography'
import { Route } from '#composers/route'
import { Ei } from '#deps/effect'
import { Railway } from '#lib/railway'
import { Grid } from '#styled-system/jsx'
import { fetchTemplates, type Template } from './_market/operations'

export const ServerComponent = Route.Server(function*() {
  const result = yield* fetchTemplates

  if (Ei.isLeft(result)) {
    const error = result.left

    // Check if it's a missing token error
    // - Direct instance check
    // - In error.cause chain
    // - In error message from Graffle interceptor wrapper
    if (
      error instanceof Railway.MissingApiTokenError
      || (error instanceof Error && error.cause instanceof Railway.MissingApiTokenError)
      || (error instanceof Error && error.message.includes('MissingApiTokenError'))
    ) {
      return <RailwayTokenPrompt />
    }

    return (
      <PageLayout maxWidth='lg'>
        <Heading size='xl' caps marginBottom='32px'>
          Railway Templates
        </Heading>
        <ErrorDisplay error={error} title='Error Loading Templates' />
      </PageLayout>
    )
  }

  const templates = result.right

  return (
    <PageLayout maxWidth='lg'>
      <Heading size='xl' caps marginBottom='40px'>
        Railway Templates
      </Heading>

      {templates.length === 0
        ? (
          <Card padding='md'>
            <Text>No templates available</Text>
          </Card>
        )
        : (
          <Grid
            gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap='0'
          >
            {templates.map((template: Template) => {
              const githubRepos = template.serializedConfig
                ? Railway.SerializedTemplateConfig.extractGitHubRepos(template.serializedConfig)
                : []
              const services = template.serializedConfig
                ? Object.values(template.serializedConfig.services) as Array<{ name: string }>
                : []

              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  services={services}
                  githubRepos={githubRepos}
                />
              )
            })}
          </Grid>
        )}
    </PageLayout>
  )
})
