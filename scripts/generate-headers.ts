import { readFileSync, writeFileSync } from "node:fs";

import { deferHydration } from "../app/defer-hydration.ts";
import { buildHeadersFile } from "../app/headers.ts";
import {
  extractInlineScriptHashes,
  extractInlineStyleHashes,
} from "../app/inline-script-hashes.ts";

const deferred = deferHydration(readFileSync("build/client/index.html", "utf8"));
const html = deferred.html;
writeFileSync("build/client/index.html", html);
const serverConfig = JSON.parse(readFileSync("build/server/wrangler.json", "utf8"));
const gaEnabled = Boolean(serverConfig.vars?.GA_MEASUREMENT_ID);

const scriptHashes = [
  ...new Set([...extractInlineScriptHashes(html), ...deferred.extraScriptHashes]),
];
const styleHashes = [...new Set(extractInlineStyleHashes(html))];
writeFileSync(
  "build/client/_headers",
  buildHeadersFile({
    scriptHashes,
    styleHashes,
    gaEnabled,
    indexable: serverConfig.vars?.ALLOW_INDEXING === "true",
  }),
);
console.log(
  `Wrote build/client/_headers (${scriptHashes.length} script and ${styleHashes.length} style hashes, ga=${gaEnabled})`,
);
