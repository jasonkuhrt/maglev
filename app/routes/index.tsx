import { Heading, Text } from '#components/typography'
import { Route } from '#composers/route'
import { Session } from '#core/session'
import { Center, Container, styled, VStack } from '#styled-system/jsx'
import { Form, redirect } from 'react-router'

export const loader = Route.loader(function*() {
  const session = yield* Session.Context
  const user = yield* session.getUserMaybe()

  // Redirect authenticated users to projects page
  if (user) {
    return redirect('/projects')
  }

  return null
})

export const ServerComponent = () => {
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
              Your workflow orchestration
            </Text>

            <styled.div display='flex' gap='16px' justifyContent='center'>
              <Form method='post' action='/auth/login'>
                <styled.button
                  type='submit'
                  bg='black'
                  color='white'
                  px='32px'
                  py='12px'
                  fontSize='lg'
                  fontWeight='bold'
                  border='2px solid black'
                  cursor='pointer'
                  _hover={{ bg: 'gray.900' }}
                >
                  Sign in with GitHub
                </styled.button>
              </Form>
            </styled.div>
          </styled.div>
        </VStack>
      </Container>
    </Center>
  )
}
