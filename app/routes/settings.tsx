import { settings } from '#data/mock'
import { Box, Button, Container, Flex, Heading, Link as RadixLink, Select, Text, TextField } from '@radix-ui/themes'

export default function Settings() {
  return (
    <Container size='2' p='6'>
      <Heading size='8' mb='6' style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
        Settings
      </Heading>

      <Flex direction='column' gap='4'>
        <Box p='4' style={{ border: '1px solid black' }}>
          <Flex direction='column' gap='4'>
            <Flex direction='column' gap='2'>
              <Text size='1' weight='bold' as='label' style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Railway API Token
              </Text>
              <TextField.Root
                placeholder='Enter your Railway API token'
                defaultValue={settings.railwayApiToken}
              />
              <Text size='1'>
                Get your token from{' '}
                <RadixLink
                  href='https://railway.com/account/tokens'
                  target='_blank'
                  style={{ color: 'black', textDecoration: 'underline' }}
                >
                  Railway Settings
                </RadixLink>
              </Text>
            </Flex>

            <Flex direction='column' gap='2'>
              <Text size='1' weight='bold' as='label' style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Theme
              </Text>
              <Select.Root defaultValue={settings.theme}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value='light'>Light</Select.Item>
                  <Select.Item value='dark'>Dark</Select.Item>
                  <Select.Item value='system'>System</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            <Button
              variant='outline'
              size='2'
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 'bold',
              }}
            >
              Save Settings
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Container>
  )
}
