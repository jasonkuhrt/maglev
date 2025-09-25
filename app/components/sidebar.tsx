import { Box, Flex, Text } from '@radix-ui/themes'
import { CubeIcon, DashboardIcon, GearIcon } from '@radix-ui/react-icons'
import { Link, useLocation } from 'react-router'

export const Sidebar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path || (path === '/' && location.pathname === '/')

  return (
    <Box
      style={{
        width: '200px',
        height: '100vh',
        borderRight: '1px solid black',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <Box p="4" style={{ borderBottom: '1px solid black' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
          <Flex align="center" gap="3">
            <img src="/favicon.svg" alt="Maglev logo" style={{ width: '24px', height: '24px' }} />
            <Text size="4" weight="bold" style={{ letterSpacing: '0.05em' }}>MAGLEV</Text>
          </Flex>
        </Link>
      </Box>

      <Flex direction="column" style={{ flex: 1 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
          <Flex align="center" gap="3" p="4" style={{ borderBottom: '1px solid black' }}>
            <CubeIcon width="16" height="16" />
            <Text size="1" weight={isActive('/') ? 'bold' : 'regular'} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Market
            </Text>
          </Flex>
        </Link>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'black' }}>
          <Flex align="center" gap="3" p="4" style={{ borderBottom: '1px solid black' }}>
            <DashboardIcon width="16" height="16" />
            <Text size="1" weight={isActive('/dashboard') ? 'bold' : 'regular'} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dashboard
            </Text>
          </Flex>
        </Link>
      </Flex>

      <Link to="/settings" style={{ textDecoration: 'none', color: 'black' }}>
        <Flex align="center" gap="3" p="4" style={{ borderTop: '1px solid black' }}>
          <GearIcon width="16" height="16" />
          <Text size="1" weight={isActive('/settings') ? 'bold' : 'regular'} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Settings
          </Text>
        </Flex>
      </Link>
    </Box>
  )
}