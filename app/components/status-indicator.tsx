import { styled } from '#styled-system/jsx'

export type Status = 'active' | 'deploying' | 'failed' | 'unknown'

interface Props {
  status: Status
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const statusColors: Record<Status, string> = {
  active: 'green.500',
  deploying: 'yellow.500',
  failed: 'red.500',
  unknown: 'gray.400',
}

export const StatusIndicator: React.FC<Props> = ({ status, size = 'md', showLabel = true }) => {
  const dotSize = size === 'sm' ? '6px' : '8px'

  return (
    <styled.div display='flex' alignItems='center' gap={showLabel ? '8px' : '0'}>
      <styled.span
        display='inline-block'
        w={dotSize}
        h={dotSize}
        borderRadius='50%'
        bg={statusColors[status]}
      />
      {showLabel && (
        <styled.span
          fontSize='md'
          fontWeight='400'
          textTransform='uppercase'
          color='black'
        >
          {status}
        </styled.span>
      )}
    </styled.div>
  )
}