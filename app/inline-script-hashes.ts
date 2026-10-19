import { createHash } from "node:crypto";

export function extractInlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const [, attributes, body] = match;
    if (/\ssrc=/.test(attributes) || /type="application\/ld\+json"/.test(attributes)) continue;
    hashes.push(`sha256-${createHash("sha256").update(body).digest("base64")}`);
  }
  return hashes;
}

export function extractInlineStyleHashes(html: string): string[] {
  return Array.from(
    html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),
    ([, body]) => `sha256-${createHash("sha256").update(body).digest("base64")}`,
  );
}
