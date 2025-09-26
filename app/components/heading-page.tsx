import { Heading } from '@radix-ui/themes'
import type { ComponentPropsWithoutRef } from 'react'
import { forwardRef } from 'react'

type Props = ComponentPropsWithoutRef<typeof Heading>

export const HeadingPage = forwardRef<HTMLHeadingElement, Props>(({ style, size = '8', ...props }, ref) => {
  return (
    <Heading
      ref={ref}
      size={size}
      {...props}
      style={{
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-normal)',
        ...style,
      }}
    />
  )
})

HeadingPage.displayName = 'HeadingPage'
