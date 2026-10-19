export type RateLimitBinding = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

export function createRateLimiter(binding?: RateLimitBinding) {
  return async (request: Request): Promise<boolean> => {
    if (!binding) return false;
    const key = request.headers.get("cf-connecting-ip") ?? "unknown";
    const { success } = await binding.limit({ key });
    return !success;
  };
}
