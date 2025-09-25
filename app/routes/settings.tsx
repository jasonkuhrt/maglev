import { BoxPanel } from '#components/box-panel'
import { ButtonAction } from '#components/button-action'
import { HeadingPage } from '#components/heading-page'
import { TextLabel } from '#components/text-label'
import { Config } from '#core/config'
import { Route } from '#core/route'
import { settings } from '#data/mock'
import { Ef, Op } from '#deps/effect'
import { Container, Flex, Link as RadixLink, Select, Text, TextField } from '@radix-ui/themes'
import type { Route as RouteTypes } from './+types/settings'

export const loader = Route.loader(function* () {
  const service = yield* Config.ConfigService
  const config = yield* service.read.pipe(Ef.option)

  return {
    gelDsn: Op.match(config, {
      onNone: () => '',
      onSome: (c) => c.gelDsn,
    }),
  }
})

export const action = Route.action(function* () {
  const formData = yield* Route.FormData
  const gelDsn = String(formData.get('gelDsn'))

  const service = yield* Config.ConfigService
  yield* service.write(Config.Config.make({ gelDsn }))

  return { success: true }
})

export default function Settings({ loaderData }: RouteTypes.ComponentProps) {
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
                  defaultValue={loaderData?.gelDsn}
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
