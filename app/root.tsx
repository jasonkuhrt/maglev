import './styled-system/styles.css'
import './index.css'
import { Sidebar } from '#blocks/sidebar'
import { ErrorDisplay } from '#components/error-display'
import { PageLayout } from '#components/page-layout'
import { Heading } from '#components/typography'
import { Route } from '#composers/route'
import { Session } from '#core/session'
import { Flex, styled } from '#styled-system/jsx'
import { Err } from '@wollybeard/kit'
import { isRouteErrorResponse, Links, Meta, Outlet, ScrollRestoration } from 'react-router'

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
      </body>
    </html>
  )
}

export const loader = Route.loader()

export const ServerComponent = Route.Server(function*() {
  const session = yield* Session.Context
  const user = yield* session.getUserMaybe()

  // Show sidebar only when authenticated
  if (user) {
    return (
      <Flex>
        <Sidebar user={user} />
        <styled.div
          marginLeft='{sizes.sidebar}'
          width='calc(100% - {sizes.sidebar})'
          minHeight='100vh'
        >
          <Outlet />
        </styled.div>
      </Flex>
    )
  }

  // No sidebar for unauthenticated users
  return <Outlet />
})

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (import.meta.env.DEV) {
    Err.log(new Error('Error Boundary', { cause: error }))
  }

  let title = 'Error'
  let errorToDisplay: any = error

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page Not Found'
      errorToDisplay = new Error('The requested page could not be found.')
    } else {
      title = `Error ${error.status}`
      errorToDisplay = new Error(error.statusText || 'An unexpected error occurred.')
    }
  }

  return (
    <PageLayout maxWidth='sm'>
      <Heading size='xl' caps marginBottom='24px'>
        {title}
      </Heading>
      <ErrorDisplay error={errorToDisplay} showHelp={false} />
      <styled.div marginTop='32px' textAlign='center'>
        <styled.a
          href='/'
          color='black'
          textDecoration='underline'
          fontSize='sm'
          fontWeight='600'
          textTransform='uppercase'
          letterSpacing='0.05em'
          _hover={{ textDecoration: 'none' }}
        >
          ← Back to Home
        </styled.a>
      </styled.div>
    </PageLayout>
  )
}
