import { TemplateMarketplace } from '#blocks/template-marketplace'
import { Card } from '#components/card'
import { ErrorDisplay } from '#components/error-display'
import { PageLayout } from '#components/page-layout'
import { Heading, Text } from '#components/typography'
import { Route } from '#composers/route'
import { Session } from '#core/session'
import { Ef, Ei } from '#deps/effect.js'
import { Railway } from '#lib/railway'

export const loader = Route.loader()

export const ServerComponent = Route.Server(function*() {
  const session = yield* Session.Context
  yield* session.getUser()
  const railway = yield* Railway.Context

  const templatesResult = yield* Ef.tryPromise({
    try: () =>
      railway.query.templates({
        $: { first: 50 },
        edges: {
          node: {
            id: true,
            code: true,
            name: true,
            description: true,
            serializedConfig: true,
          },
        },
      }),
    catch: (cause) => new Error('Failed to load templates', { cause }),
  }).pipe(
    Ef.map((result) => {
      // Transform the data for our view
      return result.edges
        .filter((edge) => edge.node !== null)
        .map((edge) => edge.node)
    }),
    Ef.either,
  )

  // Handle errors
  if (Ei.isLeft(templatesResult)) {
    return (
      <PageLayout maxWidth='lg'>
        <Heading size='xl' caps marginBottom='32px'>
          Railway Templates
        </Heading>
        <ErrorDisplay error={templatesResult.left} title='Error Loading Templates' />
      </PageLayout>
    )
  }

  const templates = templatesResult.right

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
          <TemplateMarketplace
            templates={templates.map((template: any) => {
              const githubRepos = template.serializedConfig
                ? Railway.SerializedTemplateConfig.extractGitHubRepos(template.serializedConfig)
                : []
              const services = template.serializedConfig
                ? Object.values(template.serializedConfig.services) as Array<{ name: string }>
                : []

              return {
                id: template.id,
                code: template.code,
                name: template.name || 'Unnamed Template',
                description: template.description,
                services,
                githubRepos,
              }
            })}
          />
        )}
    </PageLayout>
  )
})
