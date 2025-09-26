'use client'

import { styled } from '#styled-system/jsx'
import { useNavigate } from 'react-router'

interface Props {
  project: {
    id: string
    name: string
    status: string
    template: {
      name: string
    }
    createdAt: string
  }
}

export const ProjectCard = ({ project }: Props) => {
  const navigate = useNavigate()

  const handleOpen = () => {
    navigate(`/projects/${project.id}`)
  }

  return (
    <styled.article
      border='2px solid black'
      bg='white'
      p='24px'
      cursor='pointer'
      position='relative'
      overflow='hidden'
      onClick={handleOpen}
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
        mb='8px'
        textTransform='uppercase'
      >
        {project.name}
      </styled.h3>

      {/* Template */}
      <styled.p
        fontSize='xs'
        fontWeight='500'
        letterSpacing='0.05em'
        textTransform='uppercase'
        mb='16px'
      >
        {project.template.name}
      </styled.p>

      {/* Metadata */}
      <styled.div
        borderTop='1px solid'
        borderColor='inherit'
        pt='12px'
        mt='auto'
        display='flex'
        justifyContent='space-between'
        alignItems='flex-end'
      >
        <styled.div>
          {/* Status */}
          <styled.div
            fontSize='xs'
            fontWeight='700'
            letterSpacing='0.08em'
            textTransform='uppercase'
            mb='4px'
            display='flex'
            alignItems='center'
            gap='6px'
          >
            {project.status === 'running' && (
              <styled.span
                display='inline-block'
                w='6px'
                h='6px'
                borderRadius='50%'
                bg='green.500'
              />
            )}
            <styled.span>
              {project.status}
            </styled.span>
          </styled.div>

          {/* Date */}
          <styled.div
            fontSize='xs'
            fontFamily='mono'
          >
            {new Date(project.createdAt).toLocaleDateString()}
          </styled.div>
        </styled.div>

        {/* Open Action */}
        <styled.div
          display='flex'
          alignItems='center'
          fontSize='sm'
          fontWeight='700'
          letterSpacing='0.05em'
          textTransform='uppercase'
        >
          Open
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
