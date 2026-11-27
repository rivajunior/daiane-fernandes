# Deploying to Cloudflare Workers

The site is a React Router app on Cloudflare Workers with static assets. The home page, `sitemap.xml` and `robots.txt` are prerendered at build time; the Worker only redirects to HTTPS and adds security headers.

## One-time setup

1. Create a Cloudflare account and run `vp exec wrangler login`.
2. Edit the `vars` in `wrangler.jsonc` with real values: `SITE_URL` (final `https://` address, no trailing slash), `WHATSAPP_NUMBER` (digits, country code included), `CRN` (required) and `CF_WEB_ANALYTICS_TOKEN` (optional, see [Analytics](#analytics)). These values are baked into the prerendered HTML at build time, so redeploy after changing them.

## Deploy

```bash
vp install
vp run test
vp run deploy   # build + generate CSP/_headers + wrangler deploy
```

`vp run build` writes `build/client/_headers` with a CSP that allow-lists the hashes of the inline hydration scripts and, only when `CF_WEB_ANALYTICS_TOKEN` is set, the Cloudflare Web Analytics hosts.

## Analytics

1. In the Cloudflare dashboard, open Web Analytics, choose "Add a site" and enter the site's hostname (today `daianefernandes.ntr.br`).
2. Open "Manage site" and copy only the `token` value from the JS snippet. The page adds the script itself, so don't paste the snippet anywhere.
3. Put the value in `CF_WEB_ANALYTICS_TOKEN` in `wrangler.jsonc` and redeploy. The token is public: it appears in the page HTML.

The hostname must match the one visitors use, so update it in the dashboard when the custom domain goes live. If the domain is proxied through Cloudflare, keep automatic setup off so the script is not added twice.

## Custom domain (.br)

Register the domain at registro.br, add it to Cloudflare, then in the dashboard open Workers & Pages > the worker > Settings > Domains & Routes and add the domain. TLS is automatic. Update `SITE_URL` and redeploy.

## Other hosts

The build output in `build/client` is static; another host needs to serve it and set the headers in `build/client/_headers`.

## Leftover secret

Earlier versions signed a proof-of-work with a `POW_SECRET` secret. If the deployed Worker still has it, remove it with `vp exec wrangler secret delete POW_SECRET`.
