import type { SiteConfig } from "~/config.server";
import { content } from "~/content/site";

type SeoConfig = Pick<SiteConfig, "siteUrl" | "crn">;

export function buildJsonLd({ siteUrl, crn }: SeoConfig): object {
  return {
    "@context": "https://schema.org",
    "@type": "Nutritionist",
    name: content.name,
    description: content.meta.description,
    url: siteUrl,
    image: `${siteUrl}/images/daiane-720.jpg`,
    areaServed: "BR",
    availableLanguage: "pt-BR",
    address: {
      "@type": "PostalAddress",
      addressLocality: content.city,
      addressRegion: content.state,
      addressCountry: "BR",
    },
    ...(crn ? { identifier: crn } : {}),
  };
}

export function buildMeta(siteUrl: string, indexable: boolean) {
  const image = `${siteUrl}/images/daiane-720.jpg`;
  return [
    { title: content.meta.title },
    ...(indexable ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
    { name: "description", content: content.meta.description },
    { tagName: "link", rel: "canonical", href: siteUrl },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "pt_BR" },
    { property: "og:site_name", content: content.name },
    { property: "og:title", content: content.meta.title },
    { property: "og:description", content: content.meta.description },
    { property: "og:url", content: siteUrl },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: content.meta.title },
    { name: "twitter:description", content: content.meta.description },
    { name: "twitter:image", content: image },
  ];
}

export function buildSitemap(siteUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}</loc></url>\n</urlset>\n`;
}

export function buildRobots(siteUrl: string, indexable: boolean): string {
  if (!indexable) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}
