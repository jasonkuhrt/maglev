import { templates } from '#data/mock'
import { Box, Container, Flex, Grid, Text } from '@radix-ui/themes'
import { useNavigate } from 'react-router'
import { HeadingPage } from '#components/heading-page'

export default function Market() {
  const navigate = useNavigate()

  const handleLaunch = (templateId: string) => {
    navigate('/dashboard')
  }

  return (
    <Container size='4' p='6'>
      <HeadingPage mb='6'>
        Templates
      </HeadingPage>
      <Grid columns={{ initial: '1', md: '2' }} gap='1' style={{ border: '1px solid var(--gray-12)' }}>
        {templates.map((template) => (
          <Box
            key={template.id}
            p='4'
            style={{
              borderRight: '1px solid var(--gray-12)',
              borderBottom: '1px solid var(--gray-12)',
              cursor: template.status === 'coming-soon' ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
            onClick={() => template.status === 'available' && handleLaunch(template.id)}
            onMouseEnter={(e) => {
              if (template.status === 'available') {
                e.currentTarget.style.backgroundColor = 'var(--gray-2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ''
            }}
          >
            <Flex direction='column' gap='2'>
              <HeadingPage size='4'>
                {template.name}
              </HeadingPage>
              <Text size='2' style={{ lineHeight: '1.5' }}>
                {template.shortDescription}
              </Text>
              <Text size='1' style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {template.techStack.join(' · ')}
              </Text>
              <Text size='1' weight='bold' mt='2' style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {template.status === 'coming-soon' ? '→ Coming Soon' : '→ Launch'}
              </Text>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Container>
  )
}
