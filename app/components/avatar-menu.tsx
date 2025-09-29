'use client'

import { Session } from '#core/session'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'
import { LogOut, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Form, Link } from 'react-router'

interface Props {
  user: Session.User
}

export const AvatarMenu: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '32px',
          h: '32px',
          p: '0',
          bg: 'transparent',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
          _hover: {
            opacity: 0.8,
          },
        })}
      >
        <img
          src={user.avatarUrl || `https://github.com/${user.username}.png`}
          alt={user.username}
          className={css({
            w: '32px',
            h: '32px',
            borderRadius: '50%',
            border: '2px solid',
            borderColor: 'gray.200',
          })}
        />
      </button>

      {/* Popover menu */}
      {isOpen && (
        <styled.div
          position='absolute'
          bottom='100%'
          left='0'
          mb='8px'
          bg='white'
          border='1px solid black'
          borderRadius='4px'
          minW='160px'
          zIndex='50'
          boxShadow='0 2px 8px rgba(0,0,0,0.1)'
        >
          {/* User info */}
          <styled.div
            p='12px'
            borderBottom='1px solid'
            borderColor='gray.200'
          >
            <styled.div fontSize='sm' fontWeight='600' color='gray.900'>
              {user.username}
            </styled.div>
            {user.email && (
              <styled.div fontSize='xs' color='gray.600' mt='2px'>
                {user.email}
              </styled.div>
            )}
          </styled.div>

          {/* Menu items */}
          <styled.div p='4px'>
            <Link
              to='/settings'
              style={{ textDecoration: 'none', display: 'block' }}
              onClick={() => setIsOpen(false)}
            >
              <styled.div
                display='flex'
                alignItems='center'
                gap='8px'
                px='8px'
                py='6px'
                fontSize='sm'
                color='gray.700'
                borderRadius='3px'
                cursor='pointer'
                _hover={{
                  bg: 'gray.100',
                  color: 'black',
                }}
              >
                <Settings size={14} />
                Settings
              </styled.div>
            </Link>

            <Form method='post' action='/auth/logout'>
              <styled.button
                type='submit'
                display='flex'
                alignItems='center'
                gap='8px'
                px='8px'
                py='6px'
                w='100%'
                bg='transparent'
                border='none'
                fontSize='sm'
                color='gray.700'
                borderRadius='3px'
                cursor='pointer'
                textAlign='left'
                _hover={{
                  bg: 'gray.100',
                  color: 'black',
                }}
              >
                <LogOut size={14} />
                Sign out
              </styled.button>
            </Form>
          </styled.div>
        </styled.div>
      )}
    </div>
  )
}
