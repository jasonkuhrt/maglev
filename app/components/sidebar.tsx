import { CubeIcon, DashboardIcon, GearIcon } from '@radix-ui/react-icons'
import { Box, Flex, Text } from '@radix-ui/themes'
import { useLocation } from 'react-router'
import { Link } from './link'

export const Sidebar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path || (path === '/' && location.pathname === '/')

  return (
    <Box
      style={{
        borderRight: '1px solid var(--gray-12)',
        width: '200px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <Box p='4' style={{ borderBottom: '1px solid var(--gray-12)' }}>
        <Link to='/' underline='none'>
          <Flex align='center' gap='3'>
            <img src='/favicon.svg' alt='Maglev logo' style={{ width: '24px', height: '24px' }} />
            <Text
              size='4'
              weight='bold'
              style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-normal)' }}
            >
              MAGLEV
            </Text>
          </Flex>
        </Link>
      </Box>

      <Flex direction='column' style={{ flex: 1 }}>
        <Link to='/' underline='none'>
          <Flex align='center' gap='3' p='4' style={{ borderBottom: '1px solid var(--gray-12)' }}>
            <CubeIcon width='16' height='16' />
            <Text
              size='1'
              weight={isActive('/') ? 'bold' : 'regular'}
              style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-normal)' }}
            >
              Market
            </Text>
          </Flex>
        </Link>
        <Link to='/dashboard' underline='none'>
          <Flex align='center' gap='3' p='4' style={{ borderBottom: '1px solid var(--gray-12)' }}>
            <DashboardIcon width='16' height='16' />
            <Text
              size='1'
              weight={isActive('/dashboard') ? 'bold' : 'regular'}
              style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-normal)' }}
            >
              Dashboard
            </Text>
          </Flex>
        </Link>
      </Flex>

      <Link to='/settings' underline='none'>
        <Flex align='center' gap='3' p='4' style={{ borderTop: '1px solid var(--gray-12)' }}>
          <GearIcon width='16' height='16' />
          <Text
            size='1'
            weight={isActive('/settings') ? 'bold' : 'regular'}
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Settings
          </Text>
        </Flex>
      </Link>
    </Box>
  )
}
