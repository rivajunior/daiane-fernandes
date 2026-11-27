import { readConfig } from '~/lib/env.server'
import { buildRobots } from '~/lib/seo'

export function loader(): Response {
  const { siteUrl, indexable } = readConfig()
  return new Response(buildRobots(siteUrl, indexable), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
