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

let dynamicHeaders: Promise<Record<string, string>> | undefined;

function getDynamicHeaders(indexable: boolean) {
  dynamicHeaders ??= styleHash().then((hash) =>
    buildSecurityHeaders({ scriptHashes: [], styleHashes: [hash], gaEnabled: false, indexable }),
  );
  return dynamicHeaders;
}

export default {
  async fetch(request, env) {
    const indexable =
      (env as unknown as Record<string, string | undefined>).ALLOW_INDEXING === "true";
    return withSecurityHeaders(await requestHandler(request), await getDynamicHeaders(indexable));
  },
} satisfies ExportedHandler<Env>;
