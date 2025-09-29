import { Button } from '#components/button'
import { InputSecret } from '#components/input-secret'
import { PageLayout } from '#components/page-layout'
import { Heading } from '#components/typography'
import { Route } from '#composers/route'
import { Session } from '#core/session'
import { Settings } from '#core/settings'
import { Ef, Sc } from '#deps/effect'
import { Railway } from '#lib/railway'
import { styled } from '#styled-system/jsx'

export const loader = Route.loader()

// Define the schema for settings form data
const SettingsFormSchema = Sc.Struct({
  clearRailwayToken: Sc.optional(Sc.String),
  railwayApiToken: Sc.optional(Sc.String),
  theme: Sc.optional(Sc.Enums(Settings.Theme)),
}).pipe(
  // Transform empty strings to undefined
  Sc.transform(
    Sc.Struct({
      clearRailwayToken: Sc.optional(Sc.String),
      railwayApiToken: Sc.optional(Sc.String),
      theme: Sc.optional(Sc.Enums(Settings.Theme)),
    }),
    {
      decode: (data) => ({
        clearRailwayToken: data.clearRailwayToken || undefined,
        railwayApiToken: data.railwayApiToken || undefined,
        theme: data.theme || Settings.Theme.system,
      }),
      encode: (data) => data,
    },
  ),
)

export const action = Route.action(function*() {
  const data = yield* Route.Args(SettingsFormSchema)
  const session = yield* Session.Context
  const user = yield* session.getUser()
  const userId = user.githubId

  // Check if this is a clear action
  if (data.clearRailwayToken === 'true') {
    const settingsService = yield* Settings.Service
    const currentSettings = yield* settingsService.read(userId)
    yield* settingsService.write(userId, {
      ...currentSettings,
      railwayApiToken: null,
    })
    Railway.setToken(null)
    return // Auto-redirects to same route
  }

  const railwayApiToken = data.railwayApiToken || ''
  const theme = data.theme || Settings.Theme.system

  // Save Railway API token and theme to database
  const settingsService = yield* Settings.Service
  yield* settingsService.write(userId, { railwayApiToken, theme })

  // Update module token variable immediately
  Railway.setToken(railwayApiToken)

  // Auto-redirects to same route when returning nothing
})

export const ServerComponent = Route.Server(
  function*() {
    const session = yield* Session.Context
    const user = yield* session.getUser()

    // Fetch settings for this user directly in the server component
    const settingsService = yield* Settings.Service
    const settings = yield* settingsService.read(user.githubId).pipe(
      Ef.catchAll(() =>
        Ef.succeed({
          railwayApiToken: null,
          theme: Settings.Theme.system,
        })
      ),
    )

    const railwayApiToken = settings.railwayApiToken
    const theme = settings.theme ?? Settings.Theme.system

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
              <styled.div display='flex' gap='8px' alignItems='stretch'>
                <styled.div flex='1'>
                  <InputSecret
                    name='railwayApiToken'
                    placeholder='Enter your Railway API token'
                    currentValue={railwayApiToken}
                  />
                </styled.div>
                {railwayApiToken && (
                  <form method='post' style={{ display: 'inline' }}>
                    <input type='hidden' name='clearRailwayToken' value='true' />
                    <Button
                      type='submit'
                      variant='outline'
                      size='md'
                    >
                      Clear
                    </Button>
                  </form>
                )}
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
  },
)
