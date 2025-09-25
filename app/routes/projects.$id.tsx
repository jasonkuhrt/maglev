import { BoxPanel } from '#components/box-panel'
import { ButtonAction } from '#components/button-action'
import { HeadingPage } from '#components/heading-page'
import { Link } from '#components/link'
import { TextLabel } from '#components/text-label'
import { projects } from '#data/mock'
import { Box, Container, Flex, Link as RadixLink, Text } from '@radix-ui/themes'
import { useParams } from 'react-router'

export default function ProjectDetail() {
  const { id } = useParams()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <Container size='3' p='6'>
        <HeadingPage>
          Project not found
        </HeadingPage>
      </Container>
    )
  }

  return (
    <Container size='3' p='6'>
      <Flex direction='column' gap='4'>
        <Link
          to='/dashboard'
          underline='none'
          style={{
            color: 'var(--gray-12)',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          ← Back
        </Link>

        <HeadingPage>
          {project.name}
        </HeadingPage>

        <BoxPanel p='4'>
          <Flex direction='column' gap='3'>
            <Flex justify='between' align='center' pb='3' style={{ borderBottom: '1px solid var(--gray-12)' }}>
              <TextLabel>Status</TextLabel>
              <TextLabel color={project.status === 'running' ? undefined : 'gray'}>
                {project.status}
              </TextLabel>
            </Flex>

            <Flex direction='column' gap='1' pb='3' style={{ borderBottom: '1px solid var(--gray-12)' }}>
              <TextLabel>
                Deployment URL
              </TextLabel>
              <RadixLink href={project.url} target='_blank' style={{ color: 'var(--gray-12)' }}>
                {project.url}
              </RadixLink>
            </Flex>

            <Flex direction='column' gap='1' pb='3' style={{ borderBottom: '1px solid var(--gray-12)' }}>
              <TextLabel>
                Template
              </TextLabel>
              <Text size='2'>{project.template.name}</Text>
            </Flex>

            <Flex direction='column' gap='1'>
              <TextLabel>Created</TextLabel>
              <Text size='2'>{new Date(project.createdAt).toLocaleString()}</Text>
            </Flex>
          </Flex>
        </BoxPanel>

        <BoxPanel p='4'>
          <Flex direction='column' gap='3'>
            <HeadingPage size='4'>
              Actions
            </HeadingPage>
            <Flex gap='2' wrap='wrap'>
              <ButtonAction size='2'>
                Restart Deployment
              </ButtonAction>
              <ButtonAction size='2'>
                Stop Service
              </ButtonAction>
              <ButtonAction size='2'>
                Delete Project
              </ButtonAction>
            </Flex>
          </Flex>
        </BoxPanel>
      </Flex>
    </Container>
  )
}
