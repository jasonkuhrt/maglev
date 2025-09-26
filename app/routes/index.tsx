import { LinkButton } from '#components/button'
import { Heading, Text } from '#components/typography'
import { Center, Container, styled, VStack } from '#styled-system/jsx'
import { Heart } from 'lucide-react'

export default function Index() {
  return (
    <Center minH='100vh' p='40px'>
      <Container maxW='600px'>
        <VStack gap='0'>
          {/* Main Content */}
          <styled.div
            border='2px solid black'
            bg='white'
            p='48px 40px'
            textAlign='center'
            width='100%'
          >
            <Heading size='2xl' caps marginBottom='24px'>
              Maglev
            </Heading>

            <Text size='lg' marginBottom='40px'>
              Your Railway platform management tool.
            </Text>

            <styled.div display='flex' gap='16px' justifyContent='center'>
              <LinkButton to='/dashboard' variant='solid' size='lg'>
                Go to Dashboard
              </LinkButton>

              <LinkButton to='/market' variant='outline' size='lg'>
                Browse Templates
              </LinkButton>
            </styled.div>
          </styled.div>

          {/* Footer */}
          <styled.div
            borderTop='none'
            border='2px solid black'
            bg='black'
            p='20px'
            textAlign='center'
            width='100%'
            display='flex'
            alignItems='center'
            justifyContent='center'
            gap='6px'
          >
            <Text size='sm' color='white' fontWeight='bold' style={{ margin: 0 }}>
              Built in Montreal with
            </Text>
            <Heart size={14} fill='red' color='red' />
          </styled.div>
        </VStack>
      </Container>
    </Center>
  )
}
