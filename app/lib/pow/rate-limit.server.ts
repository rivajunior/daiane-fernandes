export type RateLimitBinding = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>
}

export function isRateLimitBinding(value: unknown): value is RateLimitBinding {
  return (
    typeof value === 'object' &&
    value !== null &&
    'limit' in value &&
    typeof value.limit === 'function'
  )
}

export function createRateLimiter(
  binding?: RateLimitBinding,
): (request: Request) => Promise<boolean> {
  return async (request: Request): Promise<boolean> => {
    if (!binding) {
      return false
    }
    const key = request.headers.get('cf-connecting-ip') ?? 'unknown'
    const { success } = await binding.limit({ key })
    return !success
  }
}
