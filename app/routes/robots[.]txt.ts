import { buildRobots } from '~/lib/seo'

export function loader(): Response {
  return new Response(buildRobots(), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
