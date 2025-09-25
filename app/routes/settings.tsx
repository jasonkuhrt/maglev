import { BoxPanel } from '#components/box-panel'
import { ButtonAction } from '#components/button-action'
import { HeadingPage } from '#components/heading-page'
import { TextLabel } from '#components/text-label'
import { Config } from '#core/config'
import { settings } from '#data/mock'
import { Ef, Op, pipe } from '#deps/effect'
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem'
import { Container, Flex, Link as RadixLink, Select, Text, TextField } from '@radix-ui/themes'
import type { Route } from './+types/settings'

export const loader = async () => {
  const result = await Ef.runPromise(
    pipe(
      Config.ConfigService,
      Ef.andThen((service) => service.read),
      Ef.provide(Config.ConfigServiceLive),
      Ef.provide(NodeFileSystem.layer),
      Ef.option,
    ),
  )

  return {
    gelDsn: Op.match(result, {
      onNone: () => '',
      onSome: (config) => config.gelDsn,
    }),
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const gelDsn = formData.get('gelDsn') as string

  await Ef.runPromise(
    pipe(
      Config.ConfigService,
      Ef.andThen((service) => service.write(Config.Config.make({ gelDsn }))),
      Ef.provide(Config.ConfigServiceLive),
      Ef.provide(NodeFileSystem.layer),
    ),
  )

  return { success: true }
}

export default function Settings({ loaderData }: Route.ComponentProps) {
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
