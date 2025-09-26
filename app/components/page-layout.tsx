import { styled } from '#styled-system/jsx'
import type { PropsWithChildren } from 'react'

interface PageLayoutProps extends PropsWithChildren {
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
}

const maxWidths = {
  sm: '800px',
  md: '1000px',
  lg: '1200px',
  full: '100%',
} as const

export const PageLayout: React.FC<PageLayoutProps> = ({ children, maxWidth = 'md' }) => {
  return (
    <styled.div
      p='80px'
      maxW={maxWidths[maxWidth]}
      w='100%'
    >
      {children}
    </styled.div>
  )
}
