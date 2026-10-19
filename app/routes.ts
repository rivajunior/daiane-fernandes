import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('api/pow/challenge', 'routes/api.pow.challenge.ts'),
  route('api/pow/verify', 'routes/api.pow.verify.ts'),
  route('sitemap.xml', 'routes/sitemap[.]xml.ts'),
  route('robots.txt', 'routes/robots[.]txt.ts'),
] satisfies RouteConfig
