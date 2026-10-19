import { expect, test } from "vite-plus/test";

import { buildHeadersFile, buildSecurityHeaders, withSecurityHeaders } from "./headers";
import { extractInlineScriptHashes, extractInlineStyleHashes } from "./inline-script-hashes";

test("security headers lock everything to self and allow GA only when enabled", () => {
  const off = buildSecurityHeaders({
    scriptHashes: ["sha256-abc="],
    styleHashes: [],
    gaEnabled: false,
  });
  const on = buildSecurityHeaders({
    scriptHashes: ["sha256-abc="],
    styleHashes: [],
    gaEnabled: true,
  });

  expect(off["Content-Security-Policy"]).toContain("default-src 'self'");
  expect(off["Content-Security-Policy"]).toContain("script-src 'self' 'sha256-abc='");
  expect(off["Content-Security-Policy"]).toContain("worker-src 'self' blob:");
  expect(off["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  expect(off["Content-Security-Policy"]).not.toContain("google");
  expect(on["Content-Security-Policy"]).toContain("https://www.googletagmanager.com");
  expect(on["Content-Security-Policy"]).toContain("https://*.google-analytics.com");
  expect(off["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains; preload");
  expect(off["X-Content-Type-Options"]).toBe("nosniff");
  expect(off["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  expect(off["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
});

test("style hashes are allowed in style-src and image/favicon caching is configured", () => {
  const headers = buildSecurityHeaders({
    scriptHashes: [],
    styleHashes: ["sha256-style="],
    gaEnabled: false,
  });
  const file = buildHeadersFile({ scriptHashes: [], styleHashes: [], gaEnabled: false });

  expect(headers["Content-Security-Policy"]).toContain("style-src 'self' 'sha256-style='");
  expect(file).toContain("/images/*\n  Cache-Control: public, max-age=31536000");
  expect(file).toContain("/favicon.svg\n  Cache-Control: public, max-age=31536000");
});

test("extractInlineStyleHashes hashes every inline style element", () => {
  const hashes = extractInlineStyleHashes(
    '<style>a{color:red}</style><style media="x">b{}</style>',
  );

  expect(hashes).toHaveLength(2);
  expect(hashes.every((hash) => /^sha256-[A-Za-z0-9+/]+=*$/.test(hash))).toBe(true);
});

test("X-Robots-Tag blocks indexing unless indexing is allowed", () => {
  const options = { scriptHashes: [], styleHashes: [], gaEnabled: false };

  expect(buildSecurityHeaders({ ...options, indexable: false })["X-Robots-Tag"]).toBe(
    "noindex, nofollow",
  );
  expect(buildSecurityHeaders({ ...options, indexable: true })["X-Robots-Tag"]).toBeUndefined();
  expect(buildSecurityHeaders(options)["X-Robots-Tag"]).toBe("noindex, nofollow");
});

test("headers file covers all routes, caches fonts and assets, and never caches the api", () => {
  const file = buildHeadersFile({ scriptHashes: [], styleHashes: [], gaEnabled: false });

  expect(file).toMatch(/^\/\*\n {2}Content-Security-Policy: /);
  expect(file).toContain("/fonts/*\n  Cache-Control: public, max-age=31536000, immutable");
  expect(file).toContain("/assets/*\n  Cache-Control: public, max-age=31536000, immutable");
  expect(file).toContain("/api/*\n  Cache-Control: no-store");
});

test("withSecurityHeaders adds headers to a response without dropping existing ones", async () => {
  const response = withSecurityHeaders(
    new Response("{}", { headers: { "cache-control": "no-store" } }),
    buildSecurityHeaders({ scriptHashes: [], styleHashes: [], gaEnabled: false }),
  );

  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(await response.text()).toBe("{}");
});

test("extractInlineScriptHashes hashes executable inline scripts only", () => {
  const html = [
    '<script src="/a.js"></script>',
    '<script type="application/ld+json">{"a":1}</script>',
    "<script>console.log(1)</script>",
    '<script type="module" async="">import("/x.js")</script>',
  ].join("");

  const hashes = extractInlineScriptHashes(html);

  expect(hashes).toHaveLength(2);
  expect(hashes[0]).toBe("sha256-CihokcEcBW4atb/CW/XWsvWwbTjqwQlE9nj9ii5ww5M=");
  expect(hashes.every((hash) => /^sha256-[A-Za-z0-9+/]+=*$/.test(hash))).toBe(true);
});
