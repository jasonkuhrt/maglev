import { Card } from '#components/card'
import { Text } from '#components/typography'
import { VStack } from '#styled-system/jsx'

interface Props {
  error: unknown
  title?: string
  showHelp?: boolean
}

/**
 * Generic error display component that recursively renders error details
 * Handles AggregateError, ContextualAggregateError, and regular Error objects
 * Traverses error causes and displays GraphQL errors when present
 */
export const ErrorDisplay: React.FC<Props> = ({ error, title, showHelp = true }) => {
  // Helper to recursively extract error details
  const extractErrorDetails = (err: unknown, depth = 0): string[] => {
    const details: string[] = []
    const indent = '  '.repeat(depth)

    if (err instanceof Error) {
      // Handle any Error instance
      details.push(`${indent}${err.message}`)

      // Check for errors array (AggregateError or similar)
      if ('errors' in err && Array.isArray((err as any).errors)) {
        const errors = (err as any).errors
        if (errors.length > 0) {
          details.push(`${indent}Errors (${errors.length}):`)
          errors.forEach((subError: unknown, index: number) => {
            details.push(`${indent}  [${index + 1}]:`)
            details.push(...extractErrorDetails(subError, depth + 2))
          })
        }
      }

      // Check for cause chain
      if (err.cause !== undefined) {
        details.push(`${indent}Caused by:`)
        details.push(...extractErrorDetails(err.cause, depth + 1))
      }

      // Check for any other properties on the error
      const errorObj = err as any
      Object.keys(errorObj).forEach(key => {
        if (key !== 'message' && key !== 'stack' && key !== 'name' && key !== 'errors' && key !== 'cause') {
          const value = errorObj[key]
          if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
              details.push(
                `${indent}${key}: ${
                  JSON.stringify(value, null, 2).split('\n').map((line, i) => i === 0 ? line : indent + '  ' + line)
                    .join('\n')
                }`,
              )
            } else {
              details.push(`${indent}${key}: ${value}`)
            }
          }
        }
      })
    } else if (err && typeof err === 'object') {
      // Handle plain objects
      const obj = err as Record<string, any>

      // If it has a message property, show it first
      if ('message' in obj && typeof obj['message'] === 'string') {
        details.push(`${indent}${obj['message']}`)

        // Then show other properties
        Object.entries(obj).forEach(([key, value]) => {
          if (key !== 'message') {
            if (typeof value === 'object' && value !== null) {
              details.push(
                `${indent}${key}: ${
                  JSON.stringify(value, null, 2).split('\n').map((line, i) => i === 0 ? line : indent + '  ' + line)
                    .join('\n')
                }`,
              )
            } else {
              details.push(`${indent}${key}: ${value}`)
            }
          }
        })
      } else {
        // Just stringify the whole object
        details.push(
          `${indent}${
            JSON.stringify(err, null, 2).split('\n').map((line, i) => i === 0 ? line : indent + line).join('\n')
          }`,
        )
      }
    } else {
      // Primitive values
      details.push(`${indent}${String(err)}`)
    }

    return details
  }

  // Extract error title if not provided
  let errorTitle = title || 'An Error Occurred'

  if (!title && error instanceof Error) {
    if (error.name === 'ContextualAggregateError' || error.name === 'AggregateError') {
      errorTitle = 'Multiple Errors Occurred'
    } else if (error.message && !error.message.includes('\n')) {
      errorTitle = error.message
    }
  }

  const errorDetails = extractErrorDetails(error).join('\n')
  const isApiTokenError = error instanceof Error
    && (error.message.includes('API token') || error.message.includes('MissingApiTokenError'))

  return (
    <Card
      padding='md'
      style={{
        border: '1px solid {colors.error.border}',
        backgroundColor: '{colors.error.background}',
      }}
    >
      <VStack gap='3' alignItems='stretch'>
        <Text weight='bold' size='lg'>{errorTitle}</Text>
        {errorDetails && (
          <Text size='sm' style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {errorDetails}
          </Text>
        )}
        {showHelp && isApiTokenError && (
          <Text size='sm'>
            Please configure your Railway API token in the settings.
          </Text>
        )}
      </VStack>
    </Card>
  )
}
