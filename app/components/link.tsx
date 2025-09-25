import { Link as RadixLink } from '@radix-ui/themes'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import { Link as RRLink } from 'react-router'

type RadixLinkProps = ComponentProps<typeof RadixLink>
type RRLinkProps = ComponentProps<typeof RRLink>

type Props =
  & Omit<RRLinkProps, 'color'>
  & Pick<RadixLinkProps, 'size' | 'weight' | 'underline' | 'color' | 'highContrast' | 'trim'>

export const Link = forwardRef<HTMLAnchorElement, Props>(
  ({ size, weight, underline, color, highContrast, trim, ...rrLinkProps }, ref) => {
    const radixProps = {
      asChild: true as const,
      ...(size !== undefined && { size }),
      ...(weight !== undefined && { weight }),
      ...(underline !== undefined && { underline }),
      ...(color !== undefined && { color }),
      ...(highContrast !== undefined && { highContrast }),
      ...(trim !== undefined && { trim }),
    }

    return (
      <RadixLink {...radixProps}>
        <RRLink ref={ref} {...rrLinkProps} />
      </RadixLink>
    )
  },
)

Link.displayName = 'Link'
