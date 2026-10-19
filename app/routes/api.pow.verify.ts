import { readConfig, readRateLimitBinding } from '~/lib/env.server'
import { handleVerify, methodNotAllowed } from '~/lib/pow/handlers.server'
import { createRateLimiter } from '~/lib/pow/rate-limit.server'

import type { Route } from './+types/api.pow.verify'

export function loader(): Response {
  return methodNotAllowed('POST')
}

export async function action({ request }: Route.ActionArgs): Promise<Response> {
  const binding = readRateLimitBinding('RATE_LIMITER')
  return handleVerify(request, readConfig(), Date.now(), createRateLimiter(binding))
}
