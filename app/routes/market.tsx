import { Box, Container, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import { useNavigate } from 'react-router'
import { templates } from '#data/mock'

export default function Market() {
  const navigate = useNavigate()

  const handleLaunch = (templateId: string) => {
    navigate('/dashboard')
  }

  return (
    <Container size="4" p="6">
      <Heading size="8" mb="6" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
        Templates
      </Heading>
      <Grid columns={{ initial: '1', md: '2' }} gap="1" style={{ border: '1px solid black' }}>
        {templates.map((template) => (
          <Box
            key={template.id}
            p="4"
            style={{
              borderRight: '1px solid black',
              borderBottom: '1px solid black',
              cursor: template.status === 'coming-soon' ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
            onClick={() => template.status === 'available' && handleLaunch(template.id)}
            onMouseEnter={(e) => {
              if (template.status === 'available') {
                e.currentTarget.style.backgroundColor = '#f0f0f0'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            <Flex direction="column" gap="2">
              <Heading size="4" style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {template.name}
              </Heading>
              <Text size="2" style={{ lineHeight: '1.5' }}>
                {template.shortDescription}
              </Text>
              <Text size="1" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {template.techStack.join(' · ')}
              </Text>
              <Text size="1" weight="bold" mt="2" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {template.status === 'coming-soon' ? '→ Coming Soon' : '→ Launch'}
              </Text>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Container>
  )
}