export async function hashAttempt(salt: string, nonce: number): Promise<Uint8Array> {
  const data = new TextEncoder().encode(`${salt}${nonce}`)
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data))
}

export function leadingZeroBits(hash: Uint8Array): number {
  let bits = 0
  for (const byte of hash) {
    if (byte === 0) {
      bits += 8
      continue
    }
    return bits + Math.clz32(byte) - 24
  }
  return bits
}

export async function findNonce(
  salt: string,
  difficulty: number,
  shouldStop: () => boolean = () => false,
): Promise<number> {
  for (let nonce = 0; ; nonce += 1) {
    if (shouldStop()) {
      return -1
    }
    // Each attempt depends on the previous one failing, so the search is inherently sequential.
    // oxlint-disable-next-line no-await-in-loop
    if (leadingZeroBits(await hashAttempt(salt, nonce)) >= difficulty) {
      return nonce
    }
  }
}
