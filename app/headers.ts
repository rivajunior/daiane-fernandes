type HeaderOptions = {
  scriptHashes: string[];
  styleHashes: string[];
  gaEnabled: boolean;
  indexable?: boolean;
};

const GA_SCRIPT = "https://www.googletagmanager.com";
const GA_CONNECT = [
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
];
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const LONG_CACHE = "public, max-age=31536000";

export function buildSecurityHeaders({
  scriptHashes,
  styleHashes,
  gaEnabled,
  indexable = false,
}: HeaderOptions): Record<string, string> {
  const scriptSources = [
    "'self'",
    ...scriptHashes.map((hash) => `'${hash}'`),
    ...(gaEnabled ? [GA_SCRIPT] : []),
  ];
  const connectSources = ["'self'", ...(gaEnabled ? GA_CONNECT : [])];
  const imageSources = [
    "'self'",
    "data:",
    ...(gaEnabled ? ["https://*.google-analytics.com", "https://*.googletagmanager.com"] : []),
  ];

  const policy = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src 'self' ${styleHashes.map((hash) => `'${hash}'`).join(" ")}`.trim(),
    `img-src ${imageSources.join(" ")}`,
    "font-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  return {
    "Content-Security-Policy": policy,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    ...(indexable ? {} : { "X-Robots-Tag": "noindex, nofollow" }),
  };
}

export function buildHeadersFile(options: HeaderOptions): string {
  const rule = (path: string, headers: Record<string, string>) =>
    `${path}\n${Object.entries(headers)
      .map(([name, value]) => `  ${name}: ${value}`)
      .join("\n")}\n`;

  return [
    rule("/*", buildSecurityHeaders(options)),
    rule("/fonts/*", { "Cache-Control": IMMUTABLE_CACHE }),
    rule("/assets/*", { "Cache-Control": IMMUTABLE_CACHE }),
    rule("/images/*", { "Cache-Control": LONG_CACHE }),
    rule("/favicon.svg", { "Cache-Control": LONG_CACHE }),
    rule("/logo.svg", { "Cache-Control": LONG_CACHE }),
    rule("/logo-light.svg", { "Cache-Control": LONG_CACHE }),
    rule("/apple-touch-icon.png", { "Cache-Control": LONG_CACHE }),
    rule("/api/*", { "Cache-Control": "no-store" }),
  ].join("\n");
}

export function withSecurityHeaders(response: Response, headers: Record<string, string>): Response {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) {
    result.headers.set(name, value);
  }
  return result;
}
