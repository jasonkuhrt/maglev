import { Button } from '#components/button'
import { InputSecret } from '#components/input-secret'
import { PageLayout } from '#components/page-layout'
import { Heading } from '#components/typography'
import { Route } from '#composers/route'
import { Config } from '#core/config'
import { Settings } from '#core/settings'
import { Ef, Op } from '#deps/effect'
import { Railway } from '#lib/railway'
import { styled } from '#styled-system/jsx'

export const action = Route.action(function*() {
  const formData = yield* Route.FormData
  const railwayApiToken = String(formData.get('railwayApiToken') || '')
  const gelDsn = String(formData.get('gelDsn') || '')
  const theme = String(formData.get('theme') || Settings.Theme.system) as Settings.Theme

  // Save Railway API token, Gel DSN, and theme to database
  const settingsService = yield* Settings.Service
  yield* settingsService.write({ railwayApiToken, gelDsn: gelDsn || null, theme })

  // Update module token variable immediately
  Railway.setToken(railwayApiToken)

  // Save Gel DSN to config file for Gel client connection
  if (gelDsn) {
    const configService = yield* Config.ConfigService
    yield* configService.write(Config.Config.make({ gelDsn }))
  }

  return { success: true }
})

export const ServerComponent = Route.Server(function*() {
  // Get settings from database
  const settingsService = yield* Settings.Service
  const settings = yield* settingsService.read.pipe(Ef.option)

  const railwayApiToken = Op.match(settings, {
    onNone: () => null,
    onSome: (s) => s.railwayApiToken,
  })

  const gelDsn = Op.match(settings, {
    onNone: () => null,
    onSome: (s) => s.gelDsn ?? null,
  })

  const theme = Op.match(settings, {
    onNone: () => Settings.Theme.system,
    onSome: (s) => s.theme ?? Settings.Theme.system,
  })

  return (
    <PageLayout maxWidth='sm'>
      <Heading size='xl' caps marginBottom='32px'>
        Settings
      </Heading>

      <styled.div
        border='2px solid black'
        bg='white'
        p='40px'
      >
        <form method='post'>
          {/* Railway API Token */}
          <styled.div mb='32px'>
            <styled.label
              display='block'
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              mb='12px'
              color='black'
            >
              Railway API Token
            </styled.label>
            <styled.div display='flex' gap='8px'>
              <InputSecret
                name='railwayApiToken'
                placeholder='Enter your Railway API token'
                currentValue={railwayApiToken}
              />
            </styled.div>
            <styled.div
              mt='8px'
              fontSize='xs'
              letterSpacing='0.02em'
            >
              {railwayApiToken
                ? (
                  <styled.span color='green' fontWeight='600' textTransform='uppercase'>
                    Value Configured
                  </styled.span>
                )
                : <styled.span color='black'>No value set</styled.span>}
            </styled.div>
            <styled.div
              mt='4px'
              fontSize='xs'
              textTransform='uppercase'
              letterSpacing='0.05em'
            >
              Get your token from{' '}
              <styled.a
                href='https://railway.com/account/tokens'
                target='_blank'
                color='black'
                textDecoration='underline'
                fontWeight='600'
              >
                Railway Settings
              </styled.a>
            </styled.div>
          </styled.div>

          {/* Gel DSN */}
          <styled.div mb='32px'>
            <styled.label
              display='block'
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              mb='12px'
              color='black'
            >
              Gel DSN
            </styled.label>
            <styled.div display='flex' gap='8px'>
              <InputSecret
                name='gelDsn'
                placeholder='gel://...'
                currentValue={gelDsn}
              />
            </styled.div>
            <styled.div
              mt='8px'
              fontSize='xs'
              letterSpacing='0.02em'
            >
              {gelDsn
                ? (
                  <styled.span color='green' fontWeight='600' textTransform='uppercase'>
                    Value Configured
                  </styled.span>
                )
                : <styled.span color='black'>No value set</styled.span>}
            </styled.div>
            <styled.div
              mt='4px'
              fontSize='xs'
              textTransform='uppercase'
              letterSpacing='0.05em'
            >
              Gel connection string for data persistence
            </styled.div>
          </styled.div>

          {/* Theme */}
          <styled.div mb='40px'>
            <styled.label
              display='block'
              fontSize='xs'
              fontWeight='700'
              letterSpacing='0.08em'
              textTransform='uppercase'
              mb='12px'
              color='black'
            >
              Theme
            </styled.label>
            <styled.select
              name='theme'
              defaultValue={theme}
              p='10px 12px'
              border='2px solid black'
              borderRadius='0'
              bg='white'
              fontSize='sm'
              fontWeight='500'
              cursor='pointer'
              width='240px'
              textTransform='capitalize'
              _hover={{
                bg: 'black',
                color: 'white',
              }}
            >
              <option value={Settings.Theme.light}>Light</option>
              <option value={Settings.Theme.dark}>Dark</option>
              <option value={Settings.Theme.system}>System</option>
            </styled.select>
          </styled.div>

          {/* Submit Button */}
          <Button type='submit' variant='solid' size='lg' style={{ width: '100%' }}>
            Save Settings
          </Button>
        </form>
      </styled.div>
    </PageLayout>
  )
})
