# Deploying to Cloudflare Workers

The site is a React Router app on Cloudflare Workers with static assets. The home page, `sitemap.xml` and `robots.txt` are prerendered at build time; only `/api/pow/*` runs on the Worker.

## One-time setup

1. Create a Cloudflare account and run `npx wrangler login`.
2. Edit the `vars` in `wrangler.jsonc` with real values: `SITE_URL` (final `https://` address, no trailing slash), `WHATSAPP_NUMBER` (digits, country code included), `CONTACT_EMAIL`, `GA_MEASUREMENT_ID` (optional) and `CRN` (optional). These values are baked into the prerendered HTML at build time, so redeploy after changing them.
3. Set the signing secret: `openssl rand -hex 32 | npx wrangler secret put POW_SECRET`.
4. The `RATE_LIMITER` binding (10 verifications per minute per IP) is declared in `wrangler.jsonc`; no extra setup.

## Deploy

```bash
npm ci
npm test
npm run deploy   # build + generate CSP/_headers + wrangler deploy
```

`npm run build` writes `build/client/_headers` with a CSP that allow-lists the hashes of the inline hydration scripts and, only when `GA_MEASUREMENT_ID` is set, the Google Analytics hosts.

## Custom domain (.com.br)

Register the domain at registro.br, add it to Cloudflare, then in the dashboard open Workers & Pages > the worker > Settings > Domains & Routes and add the domain. TLS is automatic. Update `SITE_URL` and redeploy.

## Other hosts

The two API endpoints live in `app/lib/pow/handlers.server.ts` and only need an `Env`-like object plus a rate limiter function, so another runtime needs a new thin adapter and a way to set the headers in `build/client/_headers`.
