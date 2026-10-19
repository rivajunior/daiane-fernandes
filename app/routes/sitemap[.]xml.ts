import { readPublicConfig } from '~/lib/env.server'
import { buildSitemap } from '~/lib/seo'

export function loader(): Response {
  return new Response(buildSitemap(readPublicConfig().siteUrl), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}
