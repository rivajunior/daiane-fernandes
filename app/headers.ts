type HeaderOptions = {
  scriptHashes: string[]
  styleHashes: string[]
  analyticsEnabled: boolean
  indexable?: boolean
}

// Cloudflare Web Analytics: where its script comes from and where it reports to.
const BEACON_SCRIPT = 'https://static.cloudflareinsights.com/beacon.min.js'
const BEACON_CONNECT = 'https://cloudflareinsights.com'
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'
const LONG_CACHE = 'public, max-age=31536000'

export function buildSecurityHeaders({
  scriptHashes,
  styleHashes,
  analyticsEnabled,
  indexable = false,
}: HeaderOptions): Record<string, string> {
  const scriptSources = [
    "'self'",
    ...scriptHashes.map((hash) => `'${hash}'`),
    ...(analyticsEnabled ? [BEACON_SCRIPT] : []),
  ]
  const connectSources = ["'self'", ...(analyticsEnabled ? [BEACON_CONNECT] : [])]

  const policy = [
    "default-src 'self'",
    `script-src ${scriptSources.join(' ')}`,
    `style-src 'self' ${styleHashes.map((hash) => `'${hash}'`).join(' ')}`.trim(),
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connectSources.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')

  return {
    'Content-Security-Policy': policy,
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...(indexable ? {} : { 'X-Robots-Tag': 'noindex, nofollow' }),
  }
}

function rule(path: string, headers: Record<string, string>): string {
  return `${path}\n${Object.entries(headers)
    .map(([name, value]) => `  ${name}: ${value}`)
    .join('\n')}\n`
}

export function buildHeadersFile(options: HeaderOptions): string {
  return [
    rule('/*', buildSecurityHeaders(options)),
    rule('/fonts/*', { 'Cache-Control': IMMUTABLE_CACHE }),
    rule('/assets/*', { 'Cache-Control': IMMUTABLE_CACHE }),
    rule('/images/*', { 'Cache-Control': LONG_CACHE }),
    rule('/favicon.svg', { 'Cache-Control': LONG_CACHE }),
    rule('/logo-v2.svg', { 'Cache-Control': LONG_CACHE }),
    rule('/logo-parts-v2.svg', { 'Cache-Control': LONG_CACHE }),
    rule('/logo-light-v2.svg', { 'Cache-Control': LONG_CACHE }),
    rule('/apple-touch-icon.png', { 'Cache-Control': LONG_CACHE }),
  ].join('\n')
}

export function withSecurityHeaders(
  response: Readonly<Response>,
  headers: Record<string, string>,
): Response {
  const result = new Response(response.body, response)
  for (const [name, value] of Object.entries(headers)) {
    result.headers.set(name, value)
  }
  return result
}
