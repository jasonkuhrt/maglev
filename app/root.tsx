import { Flex, Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import './global.css'
import { isRouteErrorResponse, Links, Meta, Outlet, ScrollRestoration } from 'react-router'

import { Sidebar } from '#components/sidebar'
import type { Route } from './+types/root'

export function Layout({ children }: { children: React.ReactNode }) {
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

export default function App() {
  return (
    <Theme appearance='light' accentColor='gray' grayColor='gray' radius='none' scaling='100%'>
      <Flex>
        <Sidebar />
        <Flex direction='column' style={{ marginLeft: '200px', width: 'calc(100% - 200px)', minHeight: '100vh' }}>
          <Outlet />
        </Flex>
      </Flex>
    </Theme>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ overflow: 'auto', padding: '1rem', background: '#f5f5f5' }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
