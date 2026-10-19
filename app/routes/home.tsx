import { HomePage } from "~/components/HomePage";
import { content } from "~/content/site";
import { readPublicConfig } from "~/lib/env.server";
import { buildJsonLd, buildMeta } from "~/lib/seo";
import { buildWhatsappUrl } from "~/lib/whatsapp";

import type { Route } from "./+types/home";

export function loader() {
  const config = readPublicConfig();
  return {
    whatsappUrl: buildWhatsappUrl(config.whatsappNumber, content.whatsappMessage),
    siteUrl: config.siteUrl,
    gaMeasurementId: config.gaMeasurementId,
    year: new Date().getFullYear(),
    crn: config.crn,
    jsonLd: buildJsonLd(config),
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return buildMeta(loaderData.siteUrl);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomePage {...loaderData} />;
}
