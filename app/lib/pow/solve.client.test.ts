import { expect, test } from "vitest";

import { solveChallenge, type WorkerLike } from "./solve.client";
import { findNonce, hashAttempt, leadingZeroBits } from "./shared";
import { createChallenge } from "./pow.server";

function inProcessWorker(): WorkerLike {
  const worker: WorkerLike = {
    onmessage: null,
    onerror: null,
    terminated: false,
    postMessage(message) {
      void findNonce(message.salt, message.difficulty, () => worker.terminated === true).then(
        (nonce) => {
          if (!worker.terminated) worker.onmessage?.({ data: { nonce } });
        },
      );
    },
    terminate() {
      worker.terminated = true;
    },
  };
  return worker;
}

test("solveChallenge returns a nonce that satisfies the difficulty", async () => {
  const challenge = await createChallenge("secret", 0, 10);

  const nonce = await solveChallenge(challenge, undefined, inProcessWorker);

  expect(leadingZeroBits(await hashAttempt(challenge.salt, nonce))).toBeGreaterThanOrEqual(10);
});

test("solveChallenge rejects with AbortError and terminates the worker on abort", async () => {
  const challenge = await createChallenge("secret", 0, 30);
  const worker = inProcessWorker();
  const controller = new AbortController();

  const pending = solveChallenge(challenge, controller.signal, () => worker);
  controller.abort();

  await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  expect(worker.terminated).toBe(true);
});
