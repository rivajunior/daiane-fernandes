import { readConfig, readRateLimitBinding } from '~/lib/env.server'
import { handleChallenge, methodNotAllowed } from '~/lib/pow/handlers.server'
import { createRateLimiter } from '~/lib/pow/rate-limit.server'

import type { Route } from './+types/api.pow.challenge'

export async function loader({ request }: Route.LoaderArgs): Promise<Response> {
  const binding = readRateLimitBinding('RATE_LIMITER_CHALLENGE')
  return handleChallenge(request, readConfig(), Date.now(), createRateLimiter(binding))
}

export function action(): Response {
  return methodNotAllowed('GET')
}
