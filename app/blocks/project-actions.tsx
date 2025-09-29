'use client'

import { Button } from '#components/button'
import { useEffect, useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'

interface Props {
  projectId: string
  railwayProjectId: string | null
}

export const ProjectActions = ({ projectId, railwayProjectId }: Props) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const isDeleting = fetcher.state === 'submitting'

  const handleDelete = () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true)
      setError(null)
      return
    }

    // Submit the delete request
    setError(null)
    fetcher.submit(
      {
        projectId,
        ...(railwayProjectId && { railwayProjectId }),
      },
      {
        method: 'POST',
        action: '/api/project-delete',
        encType: 'application/x-www-form-urlencoded',
      },
    )
  }

  // Handle delete response
  useEffect(() => {
    // Check if we have a successful response
    if (fetcher.data && typeof fetcher.data === 'object') {
      const data = fetcher.data as any

      if (data.success === true) {
        // Navigate using React Router
        navigate('/projects')
      } else if (data.error) {
        setError(data.error as string)
        setShowConfirmDelete(false)
      }
    }
  }, [fetcher.data, navigate])

  return (
    <>
      {error && (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '12px',
            background: '#fee',
            border: '1px solid #f88',
            borderRadius: '4px',
            color: '#c00',
            fontSize: '14px',
          }}
        >
          Error: {error}
        </div>
      )}
      <Button variant='outline' size='md' disabled>
        Restart Deployment
      </Button>
      <Button variant='outline' size='md' disabled>
        Stop Service
      </Button>
      {!showConfirmDelete
        ? (
          <Button
            variant='solid'
            size='md'
            bg='red.600'
            borderColor='red.600'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete Project
          </Button>
        )
        : (
          <>
            <Button
              variant='solid'
              size='md'
              bg='red.700'
              borderColor='red.700'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
            <Button
              variant='outline'
              size='md'
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </>
        )}
    </>
  )
}
