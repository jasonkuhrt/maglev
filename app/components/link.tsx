'use client'

import { css, cva } from '#styled-system/css'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import { Link as RRLink, useLocation } from 'react-router'

const linkStyles = cva({
  base: {
    color: 'text.primary',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      textDecoration: 'underline',
    },
  },
  variants: {
    underline: {
      none: { textDecoration: 'none' },
      hover: { _hover: { textDecoration: 'underline' } },
      always: { textDecoration: 'underline' },
    },
    weight: {
      normal: { fontWeight: 'normal' },
      medium: { fontWeight: 'medium' },
      bold: { fontWeight: 'bold' },
    },
    color: {
      primary: { color: 'text.primary' },
      secondary: { color: 'text.secondary' },
      blue: { color: 'blue.500' },
    },
  },
  defaultVariants: {
    underline: 'hover',
    weight: 'normal',
    color: 'primary',
  },
})

type Props = ComponentProps<typeof RRLink> & {
  underline?: 'none' | 'hover' | 'always'
  weight?: 'normal' | 'medium' | 'bold'
  color?: 'primary' | 'secondary' | 'blue'
  activeClassName?: string
  activeWeight?: 'normal' | 'medium' | 'bold'
  activeColor?: 'primary' | 'secondary' | 'blue'
}

export const Link = forwardRef<HTMLAnchorElement, Props>(
  ({
    underline = 'hover',
    weight = 'normal',
    color = 'primary',
    activeClassName,
    activeWeight,
    activeColor,
    className,
    to,
    ...props
  }, ref) => {
    const location = useLocation()
    const isActive = location.pathname === to

    // Apply active styles
    const effectiveWeight = isActive && activeWeight ? activeWeight : weight
    const effectiveColor = isActive && activeColor ? activeColor : color
    const effectiveClassName = css(
      linkStyles.raw({ underline, weight: effectiveWeight, color: effectiveColor }),
      ...(className ? [className as any] : []),
      ...(isActive && activeClassName ? [activeClassName as any] : []),
    )

    return (
      <RRLink
        ref={ref}
        to={to}
        className={effectiveClassName}
        data-active={isActive || undefined}
        {...props}
      />
    )
  },
)

Link.displayName = 'Link'
