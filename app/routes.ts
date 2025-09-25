import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/market.tsx'),
  route('dashboard', 'routes/dashboard.tsx'),
  route('projects/:id', 'routes/projects.$id.tsx'),
  route('settings', 'routes/settings.tsx'),
] satisfies RouteConfig
