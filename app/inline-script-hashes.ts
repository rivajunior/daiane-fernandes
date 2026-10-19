import { createHash } from 'node:crypto'

function sha256(text: string): string {
  return `sha256-${createHash('sha256').update(text).digest('base64')}`
}

export function extractInlineScriptHashes(html: string): string[] {
  const hashes: string[] = []
  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gu)) {
    const [, attributes = '', body = ''] = match
    if (/\ssrc=/u.test(attributes) || attributes.includes('type="application/ld+json"')) {
      continue
    }
    hashes.push(sha256(body))
  }
  return hashes
}

export function extractInlineStyleHashes(html: string): string[] {
  return Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gu), ([, body = '']) =>
    sha256(body),
  )
}
