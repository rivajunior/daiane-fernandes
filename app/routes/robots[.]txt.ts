import { readPublicConfig } from "~/lib/env.server";
import { buildRobots } from "~/lib/seo";

export function loader() {
  return new Response(buildRobots(readPublicConfig().siteUrl), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
