import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./app/**/*.{ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Enable JSX framework for style props
  jsxFramework: 'react',

  // Type safety settings
  // strictTokens: true,
  // strictPropertyValues: true,

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          gray: {
            50: { value: '#f9fafb' },
            100: { value: '#f3f4f6' },
            200: { value: '#e5e7eb' },
            300: { value: '#d1d5db' },
            400: { value: '#9ca3af' },
            500: { value: '#6b7280' },
            600: { value: '#4b5563' },
            700: { value: '#374151' },
            800: { value: '#1f2937' },
            900: { value: '#111827' },
            950: { value: '#030712' },
          },
          black: { value: '#000000' },
          white: { value: '#ffffff' },
          blue: {
            500: { value: '#3b82f6' },
            600: { value: '#2563eb' },
          },
          red: {
            500: { value: '#ef4444' },
            600: { value: '#dc2626' },
          },
          green: {
            500: { value: '#16a34a' },
            600: { value: '#059669' },
          },
          yellow: {
            50: { value: '#fefce8' },
            500: { value: '#eab308' },
            600: { value: '#ca8a04' },
          },
        },
        fonts: {
          body: { value: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' },
          heading: { value: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' },
          mono: { value: 'SF Mono, Monaco, Inconsolata, monospace' },
        },
        spacing: {
          0: { value: '0' },
          1: { value: '0.25rem' },
          2: { value: '0.5rem' },
          3: { value: '0.75rem' },
          4: { value: '1rem' },
          5: { value: '1.25rem' },
          6: { value: '1.5rem' },
          8: { value: '2rem' },
          10: { value: '2.5rem' },
          12: { value: '3rem' },
          16: { value: '4rem' },
          20: { value: '5rem' },
          24: { value: '6rem' },
        },
        radii: {
          none: { value: '0' },
          sm: { value: '1px' },
          md: { value: '2px' },
          lg: { value: '2px' },
          xl: { value: '2px' },
          full: { value: '9999px' },
        },
        fontSizes: {
          xs: { value: '0.625rem' },
          sm: { value: '0.75rem' },
          md: { value: '1rem' },
          lg: { value: '1.25rem' },
          xl: { value: '1.5rem' },
          '2xl': { value: '2rem' },
          '3xl': { value: '2.5rem' },
          '4xl': { value: '3rem' },
          '5xl': { value: '4rem' },
        },
        borders: {
          1: { value: '1px' },
          2: { value: '2px' },
        },
        sizes: {
          sidebar: { value: '160px' },
          containerSm: { value: '600px' },
          containerMd: { value: '800px' },
          containerLg: { value: '1200px' },
        },
      },
      semanticTokens: {
        colors: {
          border: {
            primary: { value: '{colors.black}' },
            hover: { value: '{colors.black}' },
            accent: { value: '{colors.black}' },
          },
          text: {
            primary: { value: '{colors.black}' },
            secondary: { value: '{colors.black}' },
            muted: { value: '{colors.black}' },
            inverted: { value: '{colors.white}' },
          },
          background: {
            primary: { value: '{colors.white}' },
            secondary: { value: '{colors.white}' },
            tertiary: { value: '{colors.white}' },
            hover: { value: '{colors.black}' },
            inverted: { value: '{colors.black}' },
          },
          error: {
            border: { value: '{colors.red.500}' },
            background: { value: '#fee2e2' },
            text: { value: '{colors.red.600}' },
          },
          warning: {
            border: { value: '{colors.yellow.500}' },
            background: { value: '{colors.yellow.50}' },
            text: { value: '{colors.yellow.600}' },
          },
          success: {
            border: { value: '{colors.green.500}' },
            background: { value: '#d1fae5' },
            text: { value: '{colors.green.600}' },
          },
        },
        // @claude this is not a real key
        // effects: {
        //   hoverLift: { value: 'translateY(-2px)' },
        // },
      },
    },
  },
  // The output directory for your css system
  outdir: 'app/styled-system',
  // @claude this is not a real key
  // Emit CSS artifacts
  // emitPackage: true,
  clean: true,
  outExtension: 'js',
})
