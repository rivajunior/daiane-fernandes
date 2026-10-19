import type { Challenge } from "./pow.server";

export type WorkerLike = {
  onmessage: ((event: { data: { nonce: number } }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  terminated?: boolean;
  postMessage(message: { salt: string; difficulty: number }): void;
  terminate(): void;
};

function createSolverWorker(): WorkerLike {
  return new Worker(new URL("./solver.worker.ts", import.meta.url), {
    type: "module",
  }) as unknown as WorkerLike;
}

export function solveChallenge(
  challenge: Challenge,
  signal?: AbortSignal,
  createWorker: () => WorkerLike = createSolverWorker,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = createWorker();

    const onAbort = () => {
      worker.terminate();
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal?.aborted) return onAbort();
    signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event) => {
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      resolve(event.data.nonce);
    };
    worker.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      reject(new Error("Falha ao resolver a verificação"));
    };
    worker.postMessage({ salt: challenge.salt, difficulty: challenge.difficulty });
  });
}
