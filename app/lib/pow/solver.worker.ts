import { findNonce } from './shared'

type SolveRequest = { salt: string; difficulty: number }

async function respond({ salt, difficulty }: SolveRequest): Promise<void> {
  const nonce = await findNonce(salt, difficulty)
  // Worker scope: `postMessage` has no `targetOrigin`; do not add one.
  // oxlint-disable-next-line unicorn/require-post-message-target-origin
  globalThis.postMessage({ nonce })
}

globalThis.addEventListener('message', (event: MessageEvent<SolveRequest>) => {
  void respond(event.data)
})
