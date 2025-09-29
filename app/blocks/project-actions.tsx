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
    console.log('Submitting delete request for project:', projectId)
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
    console.log('Fetcher state:', fetcher.state)
    console.log('Fetcher data:', JSON.stringify(fetcher.data))

    // Check if we have a successful response
    if (fetcher.data && typeof fetcher.data === 'object') {
      const data = fetcher.data as any
      console.log('Checking success field:', data.success)

      if (data.success === true) {
        console.log('Delete successful, navigating to /projects')
        // Force navigation with a small delay to ensure state updates
        setTimeout(() => {
          window.location.href = '/projects'
        }, 100)
      } else if (data.error) {
        console.log('Delete failed with error:', data.error)
        setError(data.error as string)
        setShowConfirmDelete(false)
      }
    }
  }, [fetcher.data])

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
