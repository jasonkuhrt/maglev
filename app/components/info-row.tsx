import { styled } from '#styled-system/jsx'
import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  value: ReactNode
  isLast?: boolean
}

export const InfoRow: React.FC<Props> = ({ icon, label, value, isLast = false }) => {
  return (
    <styled.div
      mb={isLast ? '0' : '24px'}
      pb={isLast ? '0' : '24px'}
      borderBottom={isLast ? 'none' : '1px solid black'}
      display='grid'
      gridTemplateColumns='1fr 2fr'
      alignItems='center'
    >
      <styled.div display='flex' alignItems='center' gap='8px'>
        {icon}
        <styled.label
          fontSize='xs'
          fontWeight='700'
          letterSpacing='0.08em'
          textTransform='uppercase'
          color='black'
        >
          {label}
        </styled.label>
      </styled.div>
      <styled.div>
        {value}
      </styled.div>
    </styled.div>
  )
}
