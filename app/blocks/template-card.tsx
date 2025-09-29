'use client'

import { ActionArrow } from '#components/action-arrow'
import { styled } from '#styled-system/jsx'
import React, { useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'

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
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Check for errors in fetcher data
  const error = fetcher.data?.error || fetcher.data?.type === 'error'
  const isLoading = fetcher.state === 'submitting'

  // Handle successful submission - navigate to the new project
  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success && fetcher.data?.projectId) {
      // Navigate to the new project page
      navigate(`/projects/${fetcher.data.projectId}`)
    }
  }, [fetcher.state, fetcher.data, navigate])

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.stopPropagation()
    // Don't prevent default - let fetcher.Form handle submission
  }

  return (
    <styled.article
      border='2px solid black'
      bg='white'
      p='24px'
      cursor={showForm ? 'default' : 'pointer'}
      position='relative'
      overflow='hidden'
      onClick={showForm ? undefined : handleLaunch}
      display='flex'
      flexDirection='column'
      height='100%'
      _hover={showForm ? {} : {
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
        flex='1'
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
            {githubRepos[0]?.replace('https://github.com/', '')}
          </styled.div>
        )}

        {/* Launch Action */}
        {showForm
          ? (
            <fetcher.Form
              method='post'
              action='/api/template-launch'
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
            >
              <input type='hidden' name='templateId' value={template.id} />
              <input type='hidden' name='templateCode' value={template.code} />
              <input type='hidden' name='templateName' value={template.name} />

              {error && (
                <styled.div
                  mb='8px'
                  p='8px'
                  bg='red.50'
                  border='1px solid red'
                  color='red.900'
                  fontSize='xs'
                >
                  {fetcher.data?.error || 'Failed to deploy template'}
                </styled.div>
              )}
              <styled.input
                type='text'
                name='projectName'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder='Project name'
                autoFocus
                pattern='[a-zA-Z0-9_-]+'
                required
                minLength={3}
                maxLength={50}
                border='1px solid black'
                p='4px 8px'
                fontSize='sm'
                width='100%'
                mb='8px'
                bg='white'
                color='black'
              />
              <styled.div display='flex' gap='8px'>
                <styled.button
                  type='submit'
                  border='1px solid black'
                  bg='black'
                  color='white'
                  p='4px 12px'
                  fontSize='xs'
                  fontWeight='700'
                  letterSpacing='0.05em'
                  textTransform='uppercase'
                  cursor='pointer'
                  disabled={isLoading}
                  _hover={{ bg: 'white', color: 'black' }}
                  _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                >
                  {isLoading ? 'Deploying...' : 'Deploy'}
                </styled.button>
                <styled.button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowForm(false)
                    setProjectName('')
                  }}
                  border='1px solid black'
                  bg='white'
                  color='black'
                  p='4px 12px'
                  fontSize='xs'
                  fontWeight='700'
                  letterSpacing='0.05em'
                  textTransform='uppercase'
                  cursor='pointer'
                  _hover={{ bg: 'black', color: 'white' }}
                >
                  Cancel
                </styled.button>
              </styled.div>
            </fetcher.Form>
          )
          : <ActionArrow text='Deploy' />}
      </styled.div>
    </styled.article>
  )
}
