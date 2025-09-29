# Feature: GitHub OAuth Login & User Account System

## Overview

Implement a minimal, simple user authentication system for Maglev using GitHub OAuth, allowing users to log in with their GitHub account and have their projects associated with their account.

## Goals

- **Dead Simple**: Minimal UI, minimal data storage, minimal complexity
- **GitHub-First**: Leverage GitHub for authentication and profile data
- **Privacy-Focused**: Store only essential data
- **Fast**: Quick login flow, no unnecessary steps

## User Flow

1. User clicks "Sign in with GitHub" button
2. Redirected to GitHub OAuth authorization
3. GitHub redirects back to Maglev with auth code
4. Maglev exchanges code for access token
5. User is logged in and sees their projects

## Database Schema

### Minimal User Model

```sql
-- Add to EdgeDB schema
type User {
  required githubId: str {
    constraint exclusive;
  }
  required username: str;
  avatarUrl: str;
  email: str;  # Only if user makes it public
  required createdAt: datetime {
    default := datetime_current();
  }
  lastLoginAt: datetime;

  # Relations
  multi projects := .<owner[is Project];

  # Indexes
  index on (.githubId);
}

# Update Project type
type Project {
  # ... existing fields ...
  owner: User;  # Link projects to users
}
```

## Implementation

### 1. GitHub App Setup

Create a GitHub App with minimal permissions:

```yaml
# GitHub App Configuration
name: Maglev
description: Deploy Railway templates with one click
callback_url: https://maglev.app/auth/callback

# Permissions (minimal)
permissions:
  metadata: read  # Basic user info
  email: read     # User email (if public)

# No repository permissions needed initially
```

### 2. Environment Variables

```env
# .env
GITHUB_APP_ID=123456
GITHUB_CLIENT_ID=Iv1.abc123
GITHUB_CLIENT_SECRET=abc123def456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
SESSION_SECRET=random-32-char-string
```

### 3. Auth Routes

#### Login Route

```typescript
// app/routes/auth.login.tsx
export const action = Route.action(function*() {
  const state = crypto.randomUUID()

  // Store state in session for CSRF protection
  yield* Session.set('oauth_state', state)

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.APP_URL}/auth/callback`,
    scope: 'read:user user:email',
    state,
  })

  return redirect(`https://github.com/login/oauth/authorize?${params}`)
})
```

#### Callback Route

```typescript
// app/routes/auth.callback.tsx
export const loader = Route.loader(function*({ request }) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  // Verify CSRF state
  const sessionState = yield* Session.get('oauth_state')
  if (state !== sessionState) {
    throw new Response('Invalid state', { status: 400 })
  }

  // Exchange code for access token
  const tokenResponse = yield* Ef.tryPromise({
    try: () =>
      fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }).then(r => r.json()),
    catch: (cause) => new Error('Failed to exchange code', { cause }),
  })

  const accessToken = tokenResponse.access_token

  // Get user info from GitHub
  const githubUser = yield* Ef.tryPromise({
    try: () =>
      fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }).then(r => r.json()),
    catch: (cause) => new Error('Failed to fetch user', { cause }),
  })

  // Create or update user in database
  const gel = yield* Gel.Client
  const user = yield* Ef.tryPromise({
    try: () =>
      Gel.$.insert(Gel.$.User, {
        githubId: String(githubUser.id),
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        email: githubUser.email,
        lastLoginAt: new Date(),
      }).unlessConflict({
        on: user => user.githubId,
        else: user => ({
          ...user,
          set: {
            lastLoginAt: new Date(),
            avatarUrl: githubUser.avatar_url, // Update avatar in case it changed
          },
        }),
      }).run(gel.client),
    catch: (cause) => new Error('Failed to save user', { cause }),
  })

  // Store user ID in session
  yield* Session.set('userId', user.id)

  return redirect('/projects')
})
```

#### Logout Route

```typescript
// app/routes/auth.logout.tsx
export const action = Route.action(function*() {
  yield* Session.clear()
  return redirect('/')
})
```

### 4. Session Management

Simple cookie-based sessions using Effect:

```typescript
// app/core/session/session.ts
import { Ctx, Ef } from '#deps/effect'
import { createCookieSessionStorage } from 'react-router'

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secrets: [process.env.SESSION_SECRET!],
  },
})

export class Session extends Ctx.Tag('Session')<
  Session,
  {
    get: (key: string) => Ef.Effect<string | null>
    set: (key: string, value: string) => Ef.Effect<void>
    clear: () => Ef.Effect<void>
    getUserId: () => Ef.Effect<string | null>
  }
>() {}

// Implementation would handle cookie operations
```

### 5. Auth Context & Hooks

```typescript
// app/core/auth/auth.ts
export class CurrentUser extends Ctx.Tag('CurrentUser')<
  CurrentUser,
  {
    id: string
    githubId: string
    username: string
    avatarUrl?: string
  } | null
>() {}

// Helper to get current user
export const getCurrentUser = Ef.gen(function*() {
  const session = yield* Session
  const userId = yield* session.getUserId()

  if (!userId) return null

  const gel = yield* Gel.Client
  return yield* Ef.tryPromise({
    try: () =>
      Gel.$.select(Gel.$.User, user => ({
        filter_single: Gel.$.op(user.id, '=', Gel.$.uuid(userId)),
        id: true,
        githubId: true,
        username: true,
        avatarUrl: true,
      })).run(gel.client),
    catch: () => null,
  })
})
```

### 6. UI Components

#### Login Button

```typescript
// app/components/login-button.tsx
export const LoginButton = () => {
  return (
    <Form method='post' action='/auth/login'>
      <Button type='submit' variant='solid'>
        <GitHub size={16} />
        Sign in with GitHub
      </Button>
    </Form>
  )
}
```

#### User Menu

```typescript
// app/components/user-menu.tsx
export const UserMenu = ({ user }: { user: CurrentUser }) => {
  if (!user) {
    return <LoginButton />
  }

  return (
    <styled.div display='flex' alignItems='center' gap='12px'>
      {user.avatarUrl && (
        <styled.img
          src={user.avatarUrl}
          alt={user.username}
          w='32px'
          h='32px'
          borderRadius='50%'
        />
      )}
      <styled.span fontSize='sm' fontWeight='500'>
        {user.username}
      </styled.span>
      <Form method='post' action='/auth/logout'>
        <Button type='submit' variant='ghost' size='sm'>
          Sign out
        </Button>
      </Form>
    </styled.div>
  )
}
```

### 7. Route Protection

Simple middleware to protect routes:

```typescript
// app/composers/route/protected.ts
export const protectedLoader = <T>(
  fn: (
    args: LoaderArgs & { user: NonNullable<CurrentUser> },
  ) => Ef.Effect<T, any, any>,
) => {
  return Route.loader(function*(args) {
    const user = yield* getCurrentUser()

    if (!user) {
      throw redirect('/auth/login')
    }

    return yield* fn({ ...args, user })
  })
}
```

Usage:

```typescript
// app/routes/projects.tsx
export const loader = protectedLoader(function*({ user }) {
  // User is guaranteed to be logged in here
  const projects = yield* getProjectsForUser(user.id)
  return { projects }
})
```

## Data Privacy

### What We Store

- GitHub user ID (for authentication)
- GitHub username (for display)
- Avatar URL (for display)
- Email (only if public on GitHub)
- Login timestamps

### What We DON'T Store

- Access tokens (only used during login flow)
- Private repositories
- Personal information beyond basics
- Activity tracking
- Analytics

## Migration Path

### Phase 1: Optional Auth

- Auth system exists but is optional
- Projects can be created without login
- Logged-in users see only their projects

### Phase 2: Auth Required

- New projects require login
- Existing anonymous projects remain accessible
- Migration tool for claiming anonymous projects

### Phase 3: Enhanced Features

- Team accounts (GitHub organizations)
- Project sharing/collaboration
- API keys for programmatic access

## Security Considerations

1. **CSRF Protection**: State parameter in OAuth flow
2. **Secure Sessions**: HttpOnly, Secure, SameSite cookies
3. **Token Handling**: Never store access tokens, use immediately and discard
4. **Rate Limiting**: Limit login attempts
5. **Session Expiry**: 30-day rolling sessions

## Benefits

1. **Familiar**: Users already have GitHub accounts
2. **Trusted**: GitHub handles password security
3. **Simple**: No password resets, email verification, etc.
4. **Fast**: One-click login
5. **Developer-Friendly**: Target audience already uses GitHub

## Alternative Approaches Considered

1. **Magic Links**: Simpler but requires email infrastructure
2. **Railway OAuth**: Would tie us too closely to Railway
3. **Multiple Providers**: Adds complexity for minimal benefit
4. **Username/Password**: Requires significant security infrastructure

## Dependencies

```json
{
  "dependencies": {
    "@octokit/auth-app": "^6.0.0", // For GitHub App auth if needed
    "react-router": "^7.0.0" // Session management
  }
}
```

## Environment Setup

```bash
# Development
GITHUB_CLIENT_ID=dev_client_id
GITHUB_CLIENT_SECRET=dev_client_secret
APP_URL=http://localhost:5173
SESSION_SECRET=dev-secret-at-least-32-chars

# Production
GITHUB_CLIENT_ID=prod_client_id
GITHUB_CLIENT_SECRET=prod_client_secret
APP_URL=https://maglev.app
SESSION_SECRET=prod-secret-at-least-32-chars
```

## Testing Strategy

1. **Local Development**: Use GitHub OAuth dev app
2. **Test Accounts**: Create test GitHub accounts
3. **Session Testing**: Verify expiry, invalidation
4. **Error Cases**: Network failures, invalid tokens
5. **Rate Limiting**: Test login attempt limits

## Success Metrics

- Login completion rate > 90%
- Time to login < 5 seconds
- Session stability (no unexpected logouts)
- Zero password-related support tickets

## References

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [React Router Session Management](https://reactrouter.com/en/main/utils/sessions)
- [EdgeDB User Authentication Guide](https://www.edgedb.com/docs/guides/auth)
