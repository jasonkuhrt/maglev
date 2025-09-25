import { Text } from '@radix-ui/themes'
import type { ComponentPropsWithoutRef } from 'react'
import { forwardRef } from 'react'

type Props = ComponentPropsWithoutRef<typeof Text>

export const TextLabel = forwardRef<HTMLSpanElement, Props>(({ style, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      size='1'
      weight='bold'
      {...props}
      style={{
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-wide)',
        ...style,
      }}
    />
  )
})

TextLabel.displayName = 'TextLabel'
