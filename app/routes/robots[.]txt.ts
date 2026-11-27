import { readConfig } from '~/lib/env.server'
import { buildRobots } from '~/lib/seo'

export function loader(): Response {
  return new Response(buildRobots(readConfig().siteUrl), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
