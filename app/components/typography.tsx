import { styled } from '#styled-system/jsx'

export const Heading = styled('h1', {
  base: {
    fontWeight: '900',
    lineHeight: '1',
    color: 'black',
    letterSpacing: '-0.02em',
  },
  variants: {
    size: {
      xs: { fontSize: '1rem' },
      sm: { fontSize: '1.5rem' },
      md: { fontSize: '2rem' },
      lg: { fontSize: '3rem' },
      xl: { fontSize: '4rem' },
      '2xl': { fontSize: '6rem' },
    },
    weight: {
      normal: { fontWeight: '500' },
      bold: { fontWeight: '700' },
      black: { fontWeight: '900' },
    },
    caps: {
      true: {
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
    },
  },
  defaultVariants: {
    size: 'lg',
    weight: 'black',
    align: 'left',
  },
})

export const Text = styled('p', {
  base: {
    lineHeight: '1.4',
    color: 'black',
  },
  variants: {
    size: {
      xs: { fontSize: '0.625rem' },
      sm: { fontSize: '0.75rem' },
      md: { fontSize: '1rem' },
      lg: { fontSize: '1.25rem' },
    },
    weight: {
      normal: { fontWeight: '400' },
      medium: { fontWeight: '500' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: '700' },
      black: { fontWeight: '900' },
    },
    caps: {
      true: {
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontSize: '0.875rem',
      },
    },
    mono: {
      true: {
        fontFamily: 'mono',
      },
    },
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
  },
})

export const Label = styled('label', {
  base: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'black',
    display: 'block',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  variants: {
    required: {
      true: {
        _after: {
          content: '" *"',
          color: 'black',
        },
      },
    },
  },
})

export const Caption = styled('span', {
  base: {
    fontSize: '0.625rem',
    color: 'black',
    lineHeight: '1.4',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  variants: {
    uppercase: {
      true: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: '700',
      },
    },
    mono: {
      true: {
        fontFamily: 'mono',
        textTransform: 'none',
        letterSpacing: 'normal',
      },
    },
  },
})
