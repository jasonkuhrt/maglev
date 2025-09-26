'use client'

import { styled } from '#styled-system/jsx'
import { useNavigate } from 'react-router'

interface Props {
  template: {
    id: string
    code: string
    name: string
    description: string | null
  }
  services: Array<{ name: string }>
  githubRepos: string[]
}

export const TemplateCard = ({ template, services, githubRepos }: Props) => {
  const navigate = useNavigate()

  const handleLaunch = () => {
    navigate('/dashboard')
  }

  return (
    <styled.article
      border='2px solid black'
      bg='white'
      p='24px'
      cursor='pointer'
      position='relative'
      overflow='hidden'
      onClick={handleLaunch}
      _hover={{
        bg: 'black',
        color: 'white',
        '& *': {
          color: 'white',
          borderColor: 'white',
        },
        '& [data-arrow]': {
          transform: 'translateX(4px)',
        },
      }}
    >
      {/* Title */}
      <styled.h3
        fontSize='lg'
        fontWeight='800'
        letterSpacing='-0.01em'
        mb='12px'
        textTransform='uppercase'
      >
        {template.name}
      </styled.h3>

      {/* Description */}
      <styled.p
        fontSize='sm'
        lineHeight='1.4'
        mb='16px'
        minH='40px'
      >
        {template.description || 'No description available'}
      </styled.p>

      {/* Metadata */}
      <styled.div
        borderTop='1px solid'
        borderColor='inherit'
        pt='12px'
        mt='auto'
      >
        {services.length > 0 && (
          <styled.div
            fontSize='xs'
            fontWeight='600'
            letterSpacing='0.05em'
            textTransform='uppercase'
            mb='8px'
          >
            {services.length} {services.length === 1 ? 'Service' : 'Services'}
          </styled.div>
        )}

        {githubRepos.length > 0 && (
          <styled.div
            fontSize='xs'
            mb='12px'
            fontFamily='mono'
          >
            {githubRepos[0].replace('https://github.com/', '')}
          </styled.div>
        )}

        {/* Launch Action */}
        <styled.div
          display='flex'
          alignItems='center'
          fontSize='sm'
          fontWeight='700'
          letterSpacing='0.05em'
          textTransform='uppercase'
        >
          Deploy
          <styled.span
            data-arrow
            ml='8px'
            display='inline-block'
            transition='transform 0.15s'
          >
            →
          </styled.span>
        </styled.div>
      </styled.div>
    </styled.article>
  )
}
