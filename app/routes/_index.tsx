import { HeadingPage } from '#components/heading-page.js'
import { Container, Flex, Text } from '@radix-ui/themes'
import { HomeButtons } from '#components/home-buttons.js'

export default function Home() {
  return (
    <Container size='4' p='6'>
      <Flex direction='column' gap='6' align='center' justify='center' style={{ minHeight: '60vh' }}>
        <HeadingPage size='9' style={{ textAlign: 'center' }}>
          Welcome to Maglev
        </HeadingPage>

        <Text size='4' style={{ textAlign: 'center', maxWidth: '600px' }}>
          Deploy Railway templates instantly. Browse our curated collection and launch your next project in seconds.
        </Text>

        <HomeButtons />
      </Flex>
    </Container>
  )
}