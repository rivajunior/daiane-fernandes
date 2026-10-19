import { env } from "cloudflare:workers";

import type { Route } from "./+types/api.pow.verify";
import { readConfig } from "~/lib/env.server";
import { handleVerify, methodNotAllowed } from "~/lib/pow/handlers.server";
import { createRateLimiter, type RateLimitBinding } from "~/lib/pow/rate-limit.server";

export function loader() {
  return methodNotAllowed("POST");
}

export function action({ request }: Route.ActionArgs) {
  const binding = (env as unknown as { RATE_LIMITER?: RateLimitBinding }).RATE_LIMITER;
  return handleVerify(request, readConfig(), Date.now(), createRateLimiter(binding));
}
