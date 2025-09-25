import { projects } from '#data/mock'
import { Box, Button, Container, Flex, Heading, Link as RadixLink, Text } from '@radix-ui/themes'
import { Link, useParams } from 'react-router'

export default function ProjectDetail() {
  const { id } = useParams()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <Container size='3' p='6'>
        <Heading size='8' style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
          Project not found
        </Heading>
      </Container>
    )
  }

  return (
    <Container size='3' p='6'>
      <Flex direction='column' gap='4'>
        <RadixLink asChild>
          <Link
            to='/dashboard'
            style={{
              textDecoration: 'none',
              color: 'black',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 'bold',
            }}
          >
            ← Back
          </Link>
        </RadixLink>

        <Heading size='8' style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
          {project.name}
        </Heading>

        <Box p='4' style={{ border: '1px solid black' }}>
          <Flex direction='column' gap='3'>
            <Flex justify='between' align='center' pb='3' style={{ borderBottom: '1px solid black' }}>
              <Text size='1' weight='bold' style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</Text>
              <Text
                size='1'
                weight='bold'
                color={project.status === 'running' ? undefined : 'gray'}
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {project.status}
              </Text>
            </Flex>

            <Flex direction='column' gap='1' pb='3' style={{ borderBottom: '1px solid black' }}>
              <Text size='1' weight='bold' style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Deployment URL
              </Text>
              <RadixLink href={project.url} target='_blank' style={{ color: 'black' }}>
                {project.url}
              </RadixLink>
            </Flex>

            <Flex direction='column' gap='1' pb='3' style={{ borderBottom: '1px solid black' }}>
              <Text size='1' weight='bold' style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Template
              </Text>
              <Text size='2'>{project.template.name}</Text>
            </Flex>

            <Flex direction='column' gap='1'>
              <Text size='1' weight='bold' style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Created</Text>
              <Text size='2'>{new Date(project.createdAt).toLocaleString()}</Text>
            </Flex>
          </Flex>
        </Box>

        <Box p='4' style={{ border: '1px solid black' }}>
          <Flex direction='column' gap='3'>
            <Heading size='4' style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
              Actions
            </Heading>
            <Flex gap='2' wrap='wrap'>
              <Button
                variant='outline'
                size='2'
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 'bold',
                }}
              >
                Restart Deployment
              </Button>
              <Button
                variant='outline'
                size='2'
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 'bold',
                }}
              >
                Stop Service
              </Button>
              <Button
                variant='outline'
                size='2'
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 'bold',
                }}
              >
                Delete Project
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Container>
  )
}
