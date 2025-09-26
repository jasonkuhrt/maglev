import { Text } from '#components/typography'
import { styled, VStack } from '#styled-system/jsx'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface PromptProps {
  variant?: 'warning' | 'error' | 'info'
  icon: LucideIcon
  title: string
  message: string | ReactNode
  action?: ReactNode
}

const variantStyles = {
  warning: {
    bg: 'yellow.50',
    borderColor: 'yellow.500',
    iconColor: 'yellow.600',
    titleColor: 'gray.900',
    textColor: 'gray.700',
  },
  error: {
    bg: 'red.50',
    borderColor: 'red.500',
    iconColor: 'red.600',
    titleColor: 'red.900',
    textColor: 'red.700',
  },
  info: {
    bg: 'blue.50',
    borderColor: 'blue.500',
    iconColor: 'blue.600',
    titleColor: 'blue.900',
    textColor: 'blue.700',
  },
}

const Container = styled('div', {
  base: {
    padding: '{spacing.6}',
  },
})

const Box = styled('div', {
  base: {
    padding: '{spacing.4}',
    borderWidth: '{borders.1}',
    borderRadius: '{radii.md}',
    display: 'flex',
    gap: '{spacing.3}',
  },
})

export const Prompt = ({ variant = 'warning', icon: Icon, title, message, action }: PromptProps) => {
  const styles = variantStyles[variant]

  return (
    <Container>
      <Box
        style={{
          backgroundColor: `var(--colors-${styles.bg})`,
          borderColor: `var(--colors-${styles.borderColor})`,
        }}
      >
        <styled.div
          flexShrink='0'
          style={{ color: `var(--colors-${styles.iconColor})` }}
        >
          <Icon size={20} />
        </styled.div>
        <VStack gap='3' alignContent='stretch' flex='1'>
          <Text weight='bold' style={{ color: `var(--colors-${styles.titleColor})` }}>
            {title}
          </Text>
          {typeof message === 'string'
            ? (
              <Text style={{ color: `var(--colors-${styles.textColor})` }}>
                {message}
              </Text>
            )
            : message}
          {action && (
            <styled.div>
              {action}
            </styled.div>
          )}
        </VStack>
      </Box>
    </Container>
  )
}
