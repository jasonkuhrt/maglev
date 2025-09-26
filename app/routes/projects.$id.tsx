import { Button } from '#components/button'
import { PageLayout } from '#components/page-layout'
import { Heading, Text } from '#components/typography'
import { projects } from '#data/mock'
import { styled } from '#styled-system/jsx'
import { Activity, ArrowLeft, Calendar, ExternalLink as ExternalLinkIcon, Globe, Layout } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <PageLayout maxWidth='sm'>
        <Heading size='xl' caps>
          Project not found
        </Heading>
      </PageLayout>
    )
  }

  return (
    <PageLayout maxWidth='sm'>
      {/* Back button */}
      <styled.button
        onClick={() => navigate('/dashboard')}
        display='inline-flex'
        alignItems='center'
        gap='8px'
        fontSize='xs'
        fontWeight='700'
        letterSpacing='0.08em'
        textTransform='uppercase'
        color='black'
        bg='transparent'
        border='none'
        cursor='pointer'
        mb='32px'
        p='0'
        _hover={{
          textDecoration: 'underline',
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Back to Projects
      </styled.button>

      <Heading size='xl' caps marginBottom='32px'>
        {project.name}
      </Heading>

      {/* Project Info Card */}
      <styled.div
        border='2px solid black'
        bg='white'
        p='40px'
        mb='24px'
      >
        {/* Status */}
        <styled.div
          mb='24px'
          pb='24px'
          borderBottom='1px solid black'
          display='grid'
          gridTemplateColumns='1fr 2fr'
          alignItems='center'
        >
          <styled.div display='flex' alignItems='center' gap='8px'>
            <Activity size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
            <styled.label
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              color='black'
            >
              Status
            </styled.label>
          </styled.div>
          <styled.div display='flex' alignItems='center' gap='8px'>
            {project.status === 'running' && (
              <styled.span
                display='inline-block'
                w='8px'
                h='8px'
                borderRadius='50%'
                bg='green.500'
              />
            )}
            <styled.span
              fontSize='md'
              fontWeight='400'
              textTransform='uppercase'
              color='black'
            >
              {project.status}
            </styled.span>
          </styled.div>
        </styled.div>

        {/* Deployment URL */}
        <styled.div
          mb='24px'
          pb='24px'
          borderBottom='1px solid black'
          display='grid'
          gridTemplateColumns='1fr 2fr'
          alignItems='center'
        >
          <styled.div display='flex' alignItems='center' gap='8px'>
            <Globe size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
            <styled.label
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              color='black'
            >
              Deployment URL
            </styled.label>
          </styled.div>
          <styled.a
            href={project.url}
            target='_blank'
            display='inline-flex'
            alignItems='center'
            gap='6px'
            fontSize='md'
            fontWeight='400'
            color='black'
            borderBottom='1px dashed black'
            textDecoration='none'
            pb='1px'
            _hover={{
              borderBottom: '1px solid black',
            }}
          >
            {project.url}
            <ExternalLinkIcon size={12} strokeWidth={2} />
          </styled.a>
        </styled.div>

        {/* Template */}
        <styled.div
          mb='24px'
          pb='24px'
          borderBottom='1px solid black'
          display='grid'
          gridTemplateColumns='1fr 2fr'
          alignItems='center'
        >
          <styled.div display='flex' alignItems='center' gap='8px'>
            <Layout size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
            <styled.label
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              color='black'
            >
              Template
            </styled.label>
          </styled.div>
          <styled.span fontSize='md' fontWeight='400'>
            {project.template.name}
          </styled.span>
        </styled.div>

        {/* Created */}
        <styled.div display='grid' gridTemplateColumns='1fr 2fr' alignItems='center'>
          <styled.div display='flex' alignItems='center' gap='8px'>
            <Calendar size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
            <styled.label
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              color='black'
            >
              Created
            </styled.label>
          </styled.div>
          <styled.span fontSize='md' fontWeight='400'>
            {new Date(project.createdAt).toLocaleString()}
          </styled.span>
        </styled.div>
      </styled.div>

      {/* Actions Card */}
      <styled.div
        border='2px solid black'
        bg='white'
        p='32px'
      >
        <Heading size='md' caps marginBottom='24px'>
          Actions
        </Heading>
        <styled.div display='flex' gap='12px' flexWrap='wrap'>
          <Button variant='outline' size='md'>
            Restart Deployment
          </Button>
          <Button variant='outline' size='md'>
            Stop Service
          </Button>
          <Button variant='solid' size='md' bg='red.600' borderColor='red.600'>
            Delete Project
          </Button>
        </styled.div>
      </styled.div>
    </PageLayout>
  )
}
