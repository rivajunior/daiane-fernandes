import { hashAttempt, leadingZeroBits } from './shared'

export { leadingZeroBits }

export type Challenge = {
  salt: string
  difficulty: number
  expiresAt: number
  signature: string
}

export type Solution = Challenge & { nonce: number }

const DEFAULT_DIFFICULTY = 16
const CHALLENGE_TTL_MS = 60 * 1000

const encoder = new TextEncoder()

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function sign(
  secret: string,
  salt: string,
  difficulty: number,
  expiresAt: number,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const payload = encoder.encode(`${salt}|${difficulty}|${expiresAt}`)
  return toHex(new Uint8Array(await crypto.subtle.sign('HMAC', key, payload)))
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false
  }
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left.codePointAt(index) ?? 0) ^ (right.codePointAt(index) ?? 0)
  }
  return difference === 0
}

export async function createChallenge(
  secret: string,
  now: number,
  difficulty: number = DEFAULT_DIFFICULTY,
): Promise<Challenge> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const expiresAt = now + CHALLENGE_TTL_MS
  return {
    salt,
    difficulty,
    expiresAt,
    signature: await sign(secret, salt, difficulty, expiresAt),
  }
}

export async function verifySolution(
  secret: string,
  solution: Solution,
  now: number,
): Promise<boolean> {
  const { salt, difficulty, expiresAt, signature, nonce } = solution
  if (now > expiresAt) {
    return false
  }

  const expected = await sign(secret, salt, difficulty, expiresAt)
  if (!safeEqual(expected, signature)) {
    return false
  }

  return leadingZeroBits(await hashAttempt(salt, nonce)) >= difficulty
}
