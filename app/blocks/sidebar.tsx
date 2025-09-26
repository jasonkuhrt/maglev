'use client'

import { styled } from '#styled-system/jsx'
import { LayoutDashboard, Package, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router'

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <styled.aside
      w='{sizes.sidebar}'
      h='100vh'
      position='fixed'
      left='0'
      top='0'
      borderRight='1px solid black'
      bg='white'
      display='flex'
      flexDirection='column'
      p='20px 16px'
    >
      {/* Logo */}
      <Link to='/' style={{ textDecoration: 'none' }}>
        <styled.div mb='36px'>
          <styled.span
            fontSize='sm'
            fontWeight='800'
            letterSpacing='-0.02em'
            color='black'
          >
            MAGLEV
          </styled.span>
        </styled.div>
      </Link>

      {/* Main Navigation */}
      <styled.nav flex='1'>
        <styled.ul listStyle='none' p='0' m='0'>
          <styled.li mb='12px'>
            <Link to='/market' style={{ textDecoration: 'none' }}>
              <styled.div
                display='flex'
                alignItems='center'
                gap='10px'
                position='relative'
              >
                <Package
                  size={14}
                  strokeWidth={isActive('/market') ? 2.5 : 1.5}
                  style={{ opacity: 0.6 }}
                />
                <styled.span
                  fontSize='sm'
                  color='black'
                  fontWeight={isActive('/market') ? '700' : '500'}
                  letterSpacing='-0.01em'
                  _hover={{
                    fontWeight: '700',
                  }}
                >
                  Market
                </styled.span>
              </styled.div>
            </Link>
          </styled.li>

          <styled.li mb='12px'>
            <Link to='/dashboard' style={{ textDecoration: 'none' }}>
              <styled.div
                display='flex'
                alignItems='center'
                gap='10px'
                position='relative'
              >
                <LayoutDashboard
                  size={14}
                  strokeWidth={isActive('/dashboard') ? 2.5 : 1.5}
                  style={{ opacity: 0.6 }}
                />
                <styled.span
                  fontSize='sm'
                  color='black'
                  fontWeight={isActive('/dashboard') ? '700' : '500'}
                  letterSpacing='-0.01em'
                  _hover={{
                    fontWeight: '700',
                  }}
                >
                  Dashboard
                </styled.span>
              </styled.div>
            </Link>
          </styled.li>
        </styled.ul>
      </styled.nav>

      {/* Settings at bottom */}
      <styled.div>
        <Link to='/settings' style={{ textDecoration: 'none' }} title='Settings'>
          <styled.div
            display='flex'
            alignItems='center'
            justifyContent='center'
            w='32px'
            h='32px'
            _hover={{
              bg: 'black',
              color: 'white',
              '& svg': {
                stroke: 'white',
                opacity: 1,
              },
            }}
          >
            <Settings
              size={16}
              strokeWidth={isActive('/settings') ? 2.5 : 1.5}
              style={{ opacity: isActive('/settings') ? 1 : 0.6 }}
            />
          </styled.div>
        </Link>
      </styled.div>
    </styled.aside>
  )
}
