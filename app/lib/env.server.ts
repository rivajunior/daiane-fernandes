import { env } from "cloudflare:workers";

import { getConfig, type SiteConfig } from "~/config.server";

export function readConfig(): SiteConfig {
  return getConfig(env as unknown as Record<string, string | undefined>);
}
