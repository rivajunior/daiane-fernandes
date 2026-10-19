import { readPublicConfig } from '~/lib/env.server'
import { buildRobots } from '~/lib/seo'

export function loader(): Response {
  return new Response(buildRobots(readPublicConfig().siteUrl, readPublicConfig().indexable), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
