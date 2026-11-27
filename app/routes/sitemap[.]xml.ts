import { readConfig } from '~/lib/env.server'
import { buildSitemap } from '~/lib/seo'

export function loader(): Response {
  return new Response(buildSitemap(readConfig().siteUrl), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}
