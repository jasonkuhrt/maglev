import { Button } from '@radix-ui/themes'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'

type Props = ComponentProps<typeof Button>

export const ButtonAction = forwardRef<HTMLButtonElement, Props>(({ style, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant='outline'
      {...props}
      style={{
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-wide)',
        fontWeight: 'bold',
        ...style,
      }}
    />
  )
})

ButtonAction.displayName = 'ButtonAction'
