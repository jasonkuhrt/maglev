'use client'

import { styled } from '#styled-system/jsx'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface InputSecretProps {
  name: string
  placeholder?: string
  currentValue?: string | null
  defaultValue?: string
}

const Input = styled('input', {
  base: {
    flex: 1,
    padding: '10px 12px',
    border: '2px solid black',
    borderRadius: '0',
    fontSize: 'sm',
    backgroundColor: 'white',
    color: 'black',
    fontFamily: 'mono',
    _placeholder: {
      color: 'black',
      opacity: '0.5',
    },
    _focus: {
      outline: 'none',
      backgroundColor: 'black',
      color: 'white',
      _placeholder: {
        color: 'white',
        opacity: '0.5',
      },
    },
  },
})

const ToggleButton = styled('button', {
  base: {
    padding: '10px',
    border: '2px solid black',
    borderLeft: 'none',
    borderRadius: '0',
    backgroundColor: 'white',
    color: 'black',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    _hover: {
      backgroundColor: 'black',
      color: 'white',
    },
  },
})

export const InputSecret = ({ name, placeholder, currentValue, defaultValue = '' }: InputSecretProps) => {
  const [value, setValue] = useState(defaultValue)
  const [showValue, setShowValue] = useState(false)
  const hasCurrentValue = !!currentValue

  return (
    <styled.div display='flex' width='100%'>
      <Input
        name={name}
        type={showValue ? 'text' : 'password'}
        placeholder={hasCurrentValue ? '••••••••••••••••' : placeholder || 'Enter secret value'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <ToggleButton
        type='button'
        onClick={() => setShowValue(!showValue)}
        title={showValue ? 'Hide value' : 'Show value'}
      >
        {showValue ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
      </ToggleButton>
    </styled.div>
  )
}
