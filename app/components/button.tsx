import { styled } from '#styled-system/jsx'
import { Link as RouterLink } from 'react-router'

const buttonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  transition: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderRadius: '0',
  _disabled: {
    opacity: '0.3',
    cursor: 'not-allowed',
    _hover: {
      background: 'inherit',
      color: 'inherit',
    },
  },
}

const buttonVariants = {
  variant: {
    solid: {
      background: 'black',
      color: 'white',
      border: '2px solid black',
      _hover: {
        background: 'white',
        color: 'black',
      },
    },
    outline: {
      background: 'white',
      color: 'black',
      border: '2px solid black',
      _hover: {
        background: 'black',
        color: 'white',
      },
    },
    ghost: {
      background: 'transparent',
      color: 'black',
      border: '2px solid transparent',
      _hover: {
        borderColor: 'black',
      },
    },
    danger: {
      background: 'white',
      color: 'black',
      border: '2px solid black',
      _hover: {
        background: 'black',
        color: 'white',
      },
    },
  },
  size: {
    sm: {
      padding: '6px 12px',
      fontSize: '0.625rem',
    },
    md: {
      padding: '8px 16px',
      fontSize: '0.75rem',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '0.875rem',
    },
  },
}

const defaultVariants = {
  variant: 'solid' as const,
  size: 'md' as const,
}

export const Button = styled('button', {
  base: buttonBase,
  variants: buttonVariants,
  defaultVariants,
})

export const LinkButton = styled(RouterLink, {
  base: buttonBase,
  variants: buttonVariants,
  defaultVariants,
})
