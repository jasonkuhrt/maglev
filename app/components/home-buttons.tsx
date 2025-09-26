'use client'

import { Box, Flex, Text } from '@radix-ui/themes'
import { Link } from './link.js'

export function HomeButtons() {
  return (
    <Flex gap='4' mt='4'>
      <Link to='/market'>
        <Box
          p='4'
          style={{
            border: '1px solid var(--gray-12)',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gray-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = ''
          }}
        >
          <Text size='3' weight='bold' style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-normal)' }}>
            → Browse Templates
          </Text>
        </Box>
      </Link>

      <Link to='/dashboard'>
        <Box
          p='4'
          style={{
            border: '1px solid var(--gray-12)',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gray-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = ''
          }}
        >
          <Text size='3' weight='bold' style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-normal)' }}>
            → View Projects
          </Text>
        </Box>
      </Link>
    </Flex>
  )
}