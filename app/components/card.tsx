import { styled } from '#styled-system/jsx'

export const Card = styled('div', {
  base: {
    background: 'white',
    borderRadius: '0',
    border: '1px solid black',
    overflow: 'hidden',
  },
  variants: {
    padding: {
      none: { padding: '0' },
      sm: { padding: '16px' },
      md: { padding: '24px' },
      lg: { padding: '32px' },
      xl: { padding: '48px' },
    },
    hover: {
      true: {
        cursor: 'pointer',
        transition: 'none',
        _hover: {
          background: 'black',
          color: 'white',
          '& *': {
            color: 'white',
          },
        },
      },
      lift: {
        cursor: 'pointer',
        transition: 'transform 0.1s',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 0 0 black',
        },
      },
    },
    variant: {
      outline: {
        background: 'white',
        border: '2px solid black',
      },
      solid: {
        background: 'black',
        color: 'white',
        border: 'none',
      },
    },
  },
  defaultVariants: {
    padding: 'md',
  },
})
