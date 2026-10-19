import { createHash } from "node:crypto";

function sha256(text: string): string {
  return `sha256-${createHash("sha256").update(text).digest("base64")}`;
}

export function extractInlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const [, attributes = "", body = ""] = match;
    if (/\ssrc=/.test(attributes) || /type="application\/ld\+json"/.test(attributes)) continue;
    hashes.push(sha256(body));
  }
  return hashes;
}

export function extractInlineStyleHashes(html: string): string[] {
  return Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g), ([, body = ""]) =>
    sha256(body),
  );
}
