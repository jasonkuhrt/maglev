'use client'

import { styled } from '#styled-system/jsx'
import { Link } from 'react-router'

export interface Props {
  project: {
    id: string
    name: string
    status: 'deploying' | 'active' | 'failed'
    url?: string
    templateName: string
    templateDescription: string | null
    createdAt: string
    railwayProjectId: string
    railwayData: any
  }
}

export const ProjectCard = ({ project }: Props) => {
  return (
    <Link
      to={`/projects/${project.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <styled.article
        border='2px solid black'
        bg='white'
        p='24px'
        cursor='pointer'
        position='relative'
        overflow='hidden'
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
          {project.templateName}
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
              {project.status === 'active' && (
                <styled.span
                  display='inline-block'
                  w='6px'
                  h='6px'
                  borderRadius='50%'
                  bg='green.500'
                />
              )}
              {project.status === 'deploying' && (
                <styled.span
                  display='inline-block'
                  w='6px'
                  h='6px'
                  borderRadius='50%'
                  bg='yellow.500'
                />
              )}
              {project.status === 'failed' && (
                <styled.span
                  display='inline-block'
                  w='6px'
                  h='6px'
                  borderRadius='50%'
                  bg='red.500'
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
    </Link>
  )
}
