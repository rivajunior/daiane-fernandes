import { expect, test } from "vitest";

import { handleChallenge, handleVerify } from "./handlers.server";
import { createChallenge, leadingZeroBits } from "./pow.server";
import { hashAttempt } from "./shared";
import type { SiteConfig } from "~/config.server";

const config: SiteConfig = {
  siteUrl: "https://example.com.br",
  whatsappNumber: "5585900000000",
  contactEmail: "contato@example.com",
  powSecret: "secret",
};
const now = 1_000_000;
const allow = async () => false;

async function solvedBody(difficulty = 8) {
  const challenge = await createChallenge(config.powSecret, now, difficulty);
  for (let nonce = 0; ; nonce++) {
    if (leadingZeroBits(await hashAttempt(challenge.salt, nonce)) >= difficulty) {
      return { ...challenge, nonce };
    }
  }
}

function post(body: unknown, raw = false) {
  return new Request("https://example.com.br/api/pow/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

test("challenge endpoint returns a signed challenge and is never cached", async () => {
  const response = await handleChallenge(config, now);
  const body = (await response.json()) as object;

  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(Object.keys(body).sort()).toEqual(["difficulty", "expiresAt", "salt", "signature"]);
});

test("verify endpoint returns the email only for a valid solution", async () => {
  const valid = await handleVerify(post(await solvedBody()), config, now, allow);
  expect(valid.status).toBe(200);
  expect(valid.headers.get("cache-control")).toBe("no-store");
  expect(await valid.json()).toEqual({ email: "contato@example.com" });

  const solved = await solvedBody();
  const bad = [
    await handleVerify(post({ ...solved, difficulty: 1 }), config, now, allow),
    await handleVerify(post(solved), config, solved.expiresAt + 1, allow),
    await handleVerify(post({ salt: "x" }), config, now, allow),
    await handleVerify(post("not json", true), config, now, allow),
  ];
  for (const response of bad) {
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("contato@example.com");
  }
});

test("verify endpoint answers 429 when rate limited, before checking the solution", async () => {
  const response = await handleVerify(post(await solvedBody()), config, now, async () => true);

  expect(response.status).toBe(429);
  expect(await response.text()).not.toContain("contato@example.com");
});
