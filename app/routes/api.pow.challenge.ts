import { env } from "cloudflare:workers";

import type { Route } from "./+types/api.pow.challenge";
import { readConfig } from "~/lib/env.server";
import { handleChallenge, methodNotAllowed } from "~/lib/pow/handlers.server";
import { createRateLimiter, type RateLimitBinding } from "~/lib/pow/rate-limit.server";

export function loader({ request }: Route.LoaderArgs) {
  const binding = (env as unknown as { RATE_LIMITER_CHALLENGE?: RateLimitBinding })
    .RATE_LIMITER_CHALLENGE;
  return handleChallenge(request, readConfig(), Date.now(), createRateLimiter(binding));
}

export function action() {
  return methodNotAllowed("GET");
}
