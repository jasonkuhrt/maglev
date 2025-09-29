import { styled } from '#styled-system/jsx'
import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  href: string
  children: ReactNode
}

export const ExternalLink: React.FC<Props> = ({ href, children }) => {
  return (
    <styled.a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
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
      {children}
      <ExternalLinkIcon size={12} strokeWidth={2} />
    </styled.a>
  )
}
