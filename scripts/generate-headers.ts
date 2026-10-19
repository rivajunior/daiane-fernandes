import { readFileSync, writeFileSync } from "node:fs";

import { buildHeadersFile } from "../app/headers.ts";
import { extractInlineScriptHashes } from "../app/inline-script-hashes.ts";

const html = readFileSync("build/client/index.html", "utf8");
const serverConfig = JSON.parse(readFileSync("build/server/wrangler.json", "utf8"));
const gaEnabled = Boolean(serverConfig.vars?.GA_MEASUREMENT_ID);

const scriptHashes = [...new Set(extractInlineScriptHashes(html))];
writeFileSync("build/client/_headers", buildHeadersFile({ scriptHashes, gaEnabled }));
console.log(`Wrote build/client/_headers (${scriptHashes.length} inline script hashes, ga=${gaEnabled})`);
