import { ButtonAction } from '#components/button-action'
import { HeadingPage } from '#components/heading-page'
import { Link } from '#components/link'
import { projects } from '#data/mock'
import { Box, Container, Flex, Grid, Text } from '@radix-ui/themes'

export default function Dashboard() {
  return (
    <Container size='4' p='6'>
      <HeadingPage mb='6'>
        Projects
      </HeadingPage>
      <Grid columns={{ initial: '1' }} gap='0' style={{ border: '1px solid var(--gray-12)' }}>
        {projects.map((project) => (
          <Box
            key={project.id}
            p='4'
            style={{ borderBottom: '1px solid var(--gray-12)' }}
          >
            <Flex justify='between' align='center'>
              <Flex direction='column' gap='1'>
                <Link
                  to={`/projects/${project.id}`}
                  underline='none'
                  style={{
                    color: 'var(--gray-12)',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {project.name}
                </Link>
                <Text size='1' style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {project.template.name} · {new Date(project.createdAt).toLocaleDateString()}
                </Text>
              </Flex>
              <Flex gap='4' align='center'>
                <Text
                  size='1'
                  weight='bold'
                  color={project.status === 'running' ? undefined : 'gray'}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  {project.status}
                </Text>
                <Flex gap='2'>
                  <ButtonAction size='1'>
                    Restart
                  </ButtonAction>
                  <ButtonAction size='1'>
                    Delete
                  </ButtonAction>
                </Flex>
              </Flex>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Container>
  )
}
