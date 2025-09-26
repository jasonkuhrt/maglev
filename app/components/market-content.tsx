'use client'

import { HeadingPage } from '#components/heading-page'
import { TemplateCard } from '#components/template-card'
import { Box, Container, Grid, Text } from '@radix-ui/themes'
import { extractGitHubRepos } from '../lib/railway/scalars/SerializedTemplateConfig'
import type { Template, Templates } from '../routes/_market/operations'

interface MarketContentProps {
  templates: Templates
  error?: string | null
}

export function MarketContent({ templates, error }: MarketContentProps) {
  return (
    <Container size='4' p='6'>
      <HeadingPage mb='6'>
        Railway Templates
      </HeadingPage>

      {error
        ? (
          <Box p='4' style={{ border: '1px solid var(--red-9)', backgroundColor: 'var(--red-2)' }}>
            <Text>{error}</Text>
            {error.includes('API token') && (
              <Text as='div' mt='2'>
                Please configure your Railway API token in the environment variables.
              </Text>
            )}
          </Box>
        )
        : templates.length === 0
        ? (
          <Box p='4'>
            <Text>No templates available</Text>
          </Box>
        )
        : (
          <Grid columns={{ initial: '1', md: '2' }} gap='1' style={{ border: '1px solid var(--gray-12)' }}>
            {templates.map((template: Template) => {
              const githubRepos = template.serializedConfig ? extractGitHubRepos(template.serializedConfig) : []
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
    </Container>
  )
}
