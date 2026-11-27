# Deploying to Cloudflare Workers

The site is a React Router app on Cloudflare Workers with static assets. The home page, `sitemap.xml` and `robots.txt` are prerendered at build time; the Worker only redirects to HTTPS and adds security headers.

## One-time setup

1. Create a Cloudflare account and run `vp exec wrangler login`.
2. Edit the `vars` in `wrangler.jsonc` with real values: `SITE_URL` (final `https://` address, no trailing slash), `WHATSAPP_NUMBER` (digits, country code included), `CRN` (required) and `GA_MEASUREMENT_ID` (optional). These values are baked into the prerendered HTML at build time, so redeploy after changing them.

## Deploy

```bash
vp install
vp run test
vp run deploy   # build + generate CSP/_headers + wrangler deploy
```

`vp run build` writes `build/client/_headers` with a CSP that allow-lists the hashes of the inline hydration scripts and, only when `GA_MEASUREMENT_ID` is set, the Google Analytics hosts.

## Custom domain (.com.br)

Register the domain at registro.br, add it to Cloudflare, then in the dashboard open Workers & Pages > the worker > Settings > Domains & Routes and add the domain. TLS is automatic. Update `SITE_URL` and redeploy.

## Other hosts

The build output in `build/client` is static; another host needs to serve it and set the headers in `build/client/_headers`.

## Leftover secret

Earlier versions signed a proof-of-work with a `POW_SECRET` secret. If the deployed Worker still has it, remove it with `vp exec wrangler secret delete POW_SECRET`.
