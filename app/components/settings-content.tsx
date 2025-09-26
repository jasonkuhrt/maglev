'use client'

import { BoxPanel } from '#components/box-panel'
import { ButtonAction } from '#components/button-action'
import { HeadingPage } from '#components/heading-page'
import { TextLabel } from '#components/text-label'
import { settings } from '#data/mock'
import { Container, Flex, Link as RadixLink, Select, Text, TextField } from '@radix-ui/themes'

interface SettingsContentProps {
  gelDsn?: string
}

export function SettingsContent({ gelDsn = '' }: SettingsContentProps) {
  return (
    <Container size='2' p='6'>
      <HeadingPage mb='6'>
        Settings
      </HeadingPage>

      <Flex direction='column' gap='4'>
        <BoxPanel p='4'>
          <Flex direction='column' gap='4' asChild>
            <form method='post'>
              <Flex direction='column' gap='2'>
                <TextLabel as='label'>
                  Railway API Token
                </TextLabel>
                <TextField.Root
                  placeholder='Enter your Railway API token'
                  defaultValue={settings.railwayApiToken}
                />
                <Text size='1'>
                  Get your token from{' '}
                  <RadixLink
                    href='https://railway.com/account/tokens'
                    target='_blank'
                    style={{ color: 'var(--gray-12)', textDecoration: 'underline' }}
                  >
                    Railway Settings
                  </RadixLink>
                </Text>
              </Flex>

              <Flex direction='column' gap='2'>
                <TextLabel as='label'>
                  Gel DSN
                </TextLabel>
                <TextField.Root
                  name='gelDsn'
                  placeholder='edgedb://...'
                  defaultValue={gelDsn}
                />
                <Text size='1'>
                  EdgeDB connection string for data persistence
                </Text>
              </Flex>

              <Flex direction='column' gap='2'>
                <TextLabel as='label'>
                  Theme
                </TextLabel>
                <Select.Root defaultValue={settings.theme}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value='light'>Light</Select.Item>
                    <Select.Item value='dark'>Dark</Select.Item>
                    <Select.Item value='system'>System</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>

              <ButtonAction type='submit' size='2'>
                Save Settings
              </ButtonAction>
            </form>
          </Flex>
        </BoxPanel>
      </Flex>
    </Container>
  )
}
