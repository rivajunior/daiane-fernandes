import { buildSitemap } from '~/lib/seo'

export function loader(): Response {
  return new Response(buildSitemap(), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}
