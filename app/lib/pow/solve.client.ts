import type { Challenge } from './pow.server'

export type WorkerLike = {
  onmessage: ((event: { data: { nonce: number } }) => void) | null
  onerror: ((event: unknown) => void) | null
  terminated?: boolean
  postMessage: (message: { salt: string; difficulty: number }) => void
  terminate: () => void
}

function createSolverWorker(): WorkerLike {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return new Worker(new URL('./solver.worker.ts', import.meta.url), {
    type: 'module',
  }) as unknown as WorkerLike
}

export async function solveChallenge(
  challenge: Challenge,
  signal?: AbortSignal,
  createWorker: () => WorkerLike = createSolverWorker,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = createWorker()

    const onAbort = () => {
      worker.terminate()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal?.aborted === true) {
      onAbort()
      return
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    // `WorkerLike` is a minimal seam so tests can inject an in-process worker.
    // oxlint-disable-next-line unicorn/prefer-add-event-listener
    worker.onmessage = (event) => {
      signal?.removeEventListener('abort', onAbort)
      worker.terminate()
      resolve(event.data.nonce)
    }
    // oxlint-disable-next-line unicorn/prefer-add-event-listener
    worker.onerror = () => {
      signal?.removeEventListener('abort', onAbort)
      worker.terminate()
      reject(new Error('Falha ao resolver a verificação'))
    }
    // oxlint-disable-next-line unicorn/require-post-message-target-origin
    worker.postMessage({ salt: challenge.salt, difficulty: challenge.difficulty })
  })
}
