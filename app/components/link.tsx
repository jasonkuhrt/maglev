'use client'

import { Link as RadixLink } from '@radix-ui/themes'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import { Link as RRLink, useLocation } from 'react-router'

type RadixLinkProps = ComponentProps<typeof RadixLink>
type RRLinkProps = ComponentProps<typeof RRLink>

type Props =
  & Omit<RRLinkProps, 'color'>
  & Pick<RadixLinkProps, 'size' | 'weight' | 'underline' | 'color' | 'highContrast' | 'trim'>
  & {
    activeClassName?: string
    activeWeight?: RadixLinkProps['weight']
    activeColor?: RadixLinkProps['color']
  }

export const Link = forwardRef<HTMLAnchorElement, Props>(
  ({
    size,
    weight,
    underline,
    color,
    highContrast,
    trim,
    activeClassName,
    activeWeight,
    activeColor,
    className,
    to,
    ...rrLinkProps
  }, ref) => {
    const location = useLocation()
    const isActive = location.pathname === to

    // Apply active styles
    const effectiveWeight = isActive && activeWeight ? activeWeight : weight
    const effectiveColor = isActive && activeColor ? activeColor : color
    const effectiveClassName = isActive && activeClassName
      ? className ? `${className} ${activeClassName}` : activeClassName
      : className

    const radixProps = {
      asChild: true as const,
      ...(size !== undefined && { size }),
      ...(effectiveWeight !== undefined && { weight: effectiveWeight }),
      ...(underline !== undefined && { underline }),
      ...(effectiveColor !== undefined && { color: effectiveColor }),
      ...(highContrast !== undefined && { highContrast }),
      ...(trim !== undefined && { trim }),
    }

    return (
      <RadixLink {...radixProps}>
        <RRLink
          ref={ref}
          to={to}
          className={effectiveClassName}
          data-active={isActive || undefined}
          {...rrLinkProps}
        />
      </RadixLink>
    )
  },
)

Link.displayName = 'Link'