import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('templates', 'routes/templates.tsx'),
  route('projects', 'routes/projects.tsx'),
  route('projects/:id', 'routes/projects.$id.tsx'),
  route('settings', 'routes/settings.tsx'),
  route('api/template-launch', 'routes/api.template-launch.tsx'),
  route('api/project-delete', 'routes/api.project-delete.tsx'),
  route('auth/login', 'routes/auth.login.tsx'),
  route('auth/callback', 'routes/auth.callback.tsx'),
  route('auth/logout', 'routes/auth.logout.tsx'),
] satisfies RouteConfig
