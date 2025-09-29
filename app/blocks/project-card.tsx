'use client'

import { ActionArrow } from '#components/action-arrow'
import { StatusIndicator } from '#components/status-indicator'
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
            >
              <StatusIndicator status={project.status} size='sm' />
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
          <ActionArrow text='Open' />
        </styled.div>
      </styled.article>
    </Link>
  )
}
