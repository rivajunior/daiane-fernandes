import { env } from "cloudflare:workers";

import {
  getConfig,
  getPublicConfig,
  type PublicConfig,
  type SiteConfig,
} from "~/config.server";

const rawEnv = env as unknown as Record<string, string | undefined>;

export function readConfig(): SiteConfig {
  return getConfig(rawEnv);
}

export function readPublicConfig(): PublicConfig {
  return getPublicConfig(rawEnv);
}
