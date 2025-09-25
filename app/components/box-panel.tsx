import { Box } from '@radix-ui/themes'
import type { ComponentPropsWithoutRef } from 'react'
import { forwardRef } from 'react'

type Props = ComponentPropsWithoutRef<typeof Box>

export const BoxPanel = forwardRef<HTMLDivElement, Props>(({ style, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      {...props}
      style={{
        border: '1px solid var(--gray-12)',
        ...style,
      }}
    />
  )
})

BoxPanel.displayName = 'BoxPanel'
