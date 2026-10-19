import { createRequestHandler } from "react-router";

import { buildSecurityHeaders, withSecurityHeaders } from "../app/headers";
import styles from "../app/styles/main.css?inline";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

async function styleHash(): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(styles));
  return `sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}`;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

let dynamicHeaders: Promise<Record<string, string>> | undefined;

function getDynamicHeaders(indexable: boolean, gaEnabled: boolean) {
  dynamicHeaders ??= styleHash().then((hash) =>
    buildSecurityHeaders({ scriptHashes: [], styleHashes: [hash], gaEnabled, indexable }),
  );
  return dynamicHeaders;
}

export default {
  async fetch(request, env) {
    const vars = env as unknown as Record<string, string | undefined>;

    const url = new URL(request.url);
    if (url.protocol === "http:" && !LOCAL_HOSTS.has(url.hostname)) {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    return withSecurityHeaders(
      await requestHandler(request),
      await getDynamicHeaders(
        vars.ALLOW_INDEXING === "true",
        Boolean(vars.GA_MEASUREMENT_ID?.trim()),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
