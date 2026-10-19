import { expect, test } from "vitest";

import {
  createChallenge,
  leadingZeroBits,
  verifySolution,
  type Challenge,
} from "./pow.server";
import { hashAttempt } from "./shared";

const secret = "test-secret";
const now = 1_000_000;

async function solve(challenge: Challenge): Promise<number> {
  for (let nonce = 0; ; nonce++) {
    const hash = await hashAttempt(challenge.salt, nonce);
    if (leadingZeroBits(hash) >= challenge.difficulty) return nonce;
  }
}

async function failingNonce(challenge: Challenge): Promise<number> {
  for (let nonce = 0; ; nonce++) {
    const hash = await hashAttempt(challenge.salt, nonce);
    if (leadingZeroBits(hash) < challenge.difficulty) return nonce;
  }
}

test("a solved challenge verifies", async () => {
  const challenge = await createChallenge(secret, now, 8);
  const nonce = await solve(challenge);

  expect(challenge.difficulty).toBe(8);
  expect(challenge.expiresAt).toBe(now + 5 * 60 * 1000);
  expect(await verifySolution(secret, { ...challenge, nonce }, now)).toBe(true);
});

test("tampered, expired, wrong-secret and wrong-nonce solutions are rejected", async () => {
  const challenge = await createChallenge(secret, now, 8);
  const nonce = await solve(challenge);
  const solution = { ...challenge, nonce };

  expect(await verifySolution(secret, { ...solution, nonce: await failingNonce(challenge) }, now)).toBe(
    false,
  );
  expect(await verifySolution(secret, { ...solution, difficulty: 1 }, now)).toBe(false);
  expect(await verifySolution(secret, { ...solution, salt: "00".repeat(16) }, now)).toBe(
    false,
  );
  expect(await verifySolution(secret, { ...solution, expiresAt: now + 10 }, now)).toBe(
    false,
  );
  expect(await verifySolution(secret, solution, challenge.expiresAt + 1)).toBe(false);
  expect(await verifySolution("other-secret", solution, now)).toBe(false);
  expect(await verifySolution(secret, { ...solution, signature: "zz" }, now)).toBe(false);
});

test("leadingZeroBits counts bits across bytes", () => {
  expect(leadingZeroBits(new Uint8Array([0x00, 0x0f]))).toBe(12);
  expect(leadingZeroBits(new Uint8Array([0x80]))).toBe(0);
  expect(leadingZeroBits(new Uint8Array([0x00, 0x00]))).toBe(16);
});
