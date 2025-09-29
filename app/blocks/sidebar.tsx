'use client'

import { AvatarMenu } from '#components/avatar-menu'
import { Session } from '#core/session'
import { styled } from '#styled-system/jsx'
import { Layers, Package } from 'lucide-react'
import { Link, useLocation } from 'react-router'

interface Props {
  user: Session.User | null
}

export const Sidebar: React.FC<Props> = ({ user }) => {
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
      {/* Main Navigation */}
      <styled.nav flex='1'>
        <styled.ul listStyle='none' p='0' m='0'>
          <styled.li mb='12px'>
            <Link to='/projects' style={{ textDecoration: 'none' }}>
              <styled.div
                display='flex'
                alignItems='center'
                gap='10px'
                position='relative'
              >
                <Layers
                  size={14}
                  strokeWidth={isActive('/projects') ? 2.5 : 1.5}
                  style={{ opacity: 0.6 }}
                />
                <styled.span
                  fontSize='sm'
                  color='black'
                  fontWeight={isActive('/projects') ? '700' : '500'}
                  letterSpacing='-0.01em'
                  _hover={{
                    fontWeight: '700',
                  }}
                >
                  Projects
                </styled.span>
              </styled.div>
            </Link>
          </styled.li>

          <styled.li mb='12px'>
            <Link to='/templates' style={{ textDecoration: 'none' }}>
              <styled.div
                display='flex'
                alignItems='center'
                gap='10px'
                position='relative'
              >
                <Package
                  size={14}
                  strokeWidth={isActive('/templates') ? 2.5 : 1.5}
                  style={{ opacity: 0.6 }}
                />
                <styled.span
                  fontSize='sm'
                  color='black'
                  fontWeight={isActive('/templates') ? '700' : '500'}
                  letterSpacing='-0.01em'
                  _hover={{
                    fontWeight: '700',
                  }}
                >
                  Templates
                </styled.span>
              </styled.div>
            </Link>
          </styled.li>
        </styled.ul>
      </styled.nav>

      {/* User menu at bottom - only show when authenticated */}
      {user && (
        <styled.div>
          <AvatarMenu user={user} />
        </styled.div>
      )}
    </styled.aside>
  )
}
