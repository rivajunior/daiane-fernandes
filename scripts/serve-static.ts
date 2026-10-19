// Serves build/client with on-the-fly brotli and the generated _headers, approximating the
// Cloudflare edge so Lighthouse CI measures what visitors get. Not used in production.
import { readFileSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { brotliCompressSync, constants } from "node:zlib";

const root = join(process.cwd(), "build/client");
const port = Number(process.env.PORT ?? 4173);

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};
const compressible = new Set([".html", ".js", ".css", ".txt", ".xml"]);

function parseHeaders(path: string): Record<string, string> {
  const rules = new Map<string, Record<string, string>>();
  let current = "";
  for (const line of readFileSync(join(root, "_headers"), "utf8").split("\n")) {
    if (line.startsWith("/")) {
      current = line.trim();
      rules.set(current, {});
    } else if (line.trim() && current) {
      const [name, ...value] = line.trim().split(": ");
      rules.get(current)![name] = value.join(": ");
    }
  }
  const matched: Record<string, string> = { ...rules.get("/*") };
  for (const [pattern, headers] of rules) {
    if (pattern !== "/*" && path.startsWith(pattern.replace("*", "")))
      Object.assign(matched, headers);
  }
  return matched;
}

const cache = new Map<string, Buffer>();

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let file = normalize(join(root, url.pathname));
  if (!file.startsWith(root)) return void response.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return void response.writeHead(404).end("Not found");

  const extension = extname(file);
  let body: Buffer = readFileSync(file);
  const headers: Record<string, string> = {
    "content-type": types[extension] ?? "application/octet-stream",
    ...parseHeaders(url.pathname),
  };
  if (compressible.has(extension) && String(request.headers["accept-encoding"]).includes("br")) {
    body =
      cache.get(file) ??
      brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } });
    cache.set(file, body);
    headers["content-encoding"] = "br";
    headers.vary = "Accept-Encoding";
  }
  response.writeHead(200, headers).end(body);
}).listen(port, () => console.log(`Serving build/client on http://localhost:${port}`));
