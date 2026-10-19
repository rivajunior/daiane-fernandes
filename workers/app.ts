import { createRequestHandler } from "react-router";

import { buildSecurityHeaders, withSecurityHeaders } from "../app/headers";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const dynamicHeaders = buildSecurityHeaders({ scriptHashes: [], gaEnabled: false });

export default {
  async fetch(request) {
    return withSecurityHeaders(await requestHandler(request), dynamicHeaders);
  },
} satisfies ExportedHandler<Env>;
