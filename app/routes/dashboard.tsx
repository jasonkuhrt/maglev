import { Box, Button, Container, Flex, Grid, Heading, Link as RadixLink, Text } from '@radix-ui/themes'
import { Link } from 'react-router'
import { projects } from '#data/mock'

export default function Dashboard() {
  return (
    <Container size="4" p="6">
      <Heading size="8" mb="6" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
        Projects
      </Heading>
      <Grid columns={{ initial: '1' }} gap="0" style={{ border: '1px solid black' }}>
        {projects.map((project) => (
          <Box
            key={project.id}
            p="4"
            style={{
              borderBottom: '1px solid black',
            }}
          >
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1">
                <RadixLink asChild>
                  <Link
                    to={`/projects/${project.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {project.name}
                  </Link>
                </RadixLink>
                <Text size="1" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {project.template.name} · {new Date(project.createdAt).toLocaleDateString()}
                </Text>
              </Flex>
              <Flex gap="4" align="center">
                <Text
                  size="1"
                  weight="bold"
                  color={project.status === 'running' ? undefined : 'gray'}
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {project.status}
                </Text>
                <Flex gap="2">
                  <Button
                    variant="outline"
                    size="1"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 'bold',
                    }}
                  >
                    Restart
                  </Button>
                  <Button
                    variant="outline"
                    size="1"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 'bold',
                    }}
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Container>
  )
}