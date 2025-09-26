'use client'

import { HeadingPage } from '#components/heading-page.js'
import { Box, Flex, Text } from '@radix-ui/themes'
import { useNavigate } from 'react-router'

type Props = {
  template: {
    id: string
    code: string
    name: string
    description: string | null
  }
  services: Array<{ name: string }>
  githubRepos: string[]
}

export const TemplateCard: React.FC<Props> = ({ template, services, githubRepos }) => {
  const navigate = useNavigate()

  const handleLaunch = () => {
    navigate('/dashboard')
  }

  return (
    <Box
      p='4'
      style={{
        borderRight: '1px solid var(--gray-12)',
        borderBottom: '1px solid var(--gray-12)',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onClick={handleLaunch}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--gray-2)'
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
          {template.description || 'No description available'}
        </Text>
        {services.length > 0 && (
          <Text size='1' style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-normal)' }}>
            {services.map(s =>
              s.name
            ).join(' · ')}
          </Text>
        )}
        {githubRepos.length > 0 && (
          <Text size='1' color='gray'>
            GitHub: {githubRepos[0]}
          </Text>
        )}
        <Text
          size='1'
          weight='bold'
          mt='2'
          style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}
        >
          → Launch
        </Text>
      </Flex>
    </Box>
  )
}
