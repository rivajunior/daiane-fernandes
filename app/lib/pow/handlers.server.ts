import type { SiteConfig } from "~/config.server";

import { createChallenge, verifySolution, type Solution } from "./pow.server";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export function methodNotAllowed(allow: "GET" | "POST"): Response {
  return new Response(JSON.stringify({ error: "Método não permitido." }), {
    status: 405,
    headers: { ...JSON_HEADERS, allow },
  });
}

function isSolution(value: unknown): value is Solution {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.salt === "string" &&
    typeof candidate.signature === "string" &&
    typeof candidate.difficulty === "number" &&
    typeof candidate.expiresAt === "number" &&
    typeof candidate.nonce === "number"
  );
}

export async function handleChallenge(
  request: Request,
  config: SiteConfig,
  now: number,
  isRateLimited: (request: Request) => Promise<boolean>,
): Promise<Response> {
  if (await isRateLimited(request)) {
    return json({ error: "Muitas tentativas. Tente novamente em instantes." }, 429);
  }
  return json(await createChallenge(config.powSecret, now));
}

export async function handleVerify(
  request: Request,
  config: SiteConfig,
  now: number,
  isRateLimited: (request: Request) => Promise<boolean>,
): Promise<Response> {
  if (await isRateLimited(request)) {
    return json({ error: "Muitas tentativas. Tente novamente em instantes." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Requisição inválida." }, 400);
  }

  if (!isSolution(body) || !(await verifySolution(config.powSecret, body, now))) {
    return json({ error: "Verificação inválida ou expirada." }, 400);
  }

  return json({ email: config.contactEmail });
}
