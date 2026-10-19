import { expect, test } from "vite-plus/test";

import { buildJsonLd, buildMeta, buildRobots, buildSitemap } from "./seo";

test("buildJsonLd describes a nutritionist in Fortaleza serving all of Brazil without street or email", () => {
  const jsonLd = buildJsonLd({ siteUrl: "https://example.com.br" }) as Record<string, any>;

  expect(jsonLd["@type"]).toBe("Nutritionist");
  expect(jsonLd.name).toBe("Daiane Fernandes");
  expect(jsonLd.url).toBe("https://example.com.br");
  expect(jsonLd.areaServed).toBe("BR");
  expect(jsonLd.address).toEqual({
    "@type": "PostalAddress",
    addressLocality: "Fortaleza",
    addressRegion: "CE",
    addressCountry: "BR",
  });
  expect(JSON.stringify(jsonLd)).not.toMatch(/streetAddress|email|telephone|identifier/);

  const withCrn = buildJsonLd({ siteUrl: "https://example.com.br", crn: "CRN-6 12345" }) as Record<
    string,
    any
  >;
  expect(withCrn.identifier).toBe("CRN-6 12345");
});

test("buildMeta sets title, description, canonical and Open Graph for pt-BR", () => {
  const meta = buildMeta("https://example.com.br", true);
  const find = (key: string, value: string) =>
    meta.find(
      (entry) => (entry as unknown as Record<string, string>)[key] === value,
    ) as unknown as Record<string, string>;

  expect(meta).toContainEqual({ title: "Daiane Fernandes | Nutricionista Comportamental online" });
  expect(find("name", "description").content).toContain("100% online");
  expect(find("tagName", "link")).toMatchObject({
    rel: "canonical",
    href: "https://example.com.br",
  });
  expect(find("property", "og:locale").content).toBe("pt_BR");
  expect(find("property", "og:url").content).toBe("https://example.com.br");
  expect(find("property", "og:image").content).toBe("https://example.com.br/images/og-image.jpg");
  expect(find("name", "twitter:card").content).toBe("summary_large_image");
});

test("pages are hidden from search engines unless indexing is explicitly allowed", () => {
  const hidden = buildMeta("https://example.com.br", false);
  const visible = buildMeta("https://example.com.br", true);

  expect(hidden).toContainEqual({ name: "robots", content: "noindex, nofollow" });
  expect(visible.some((entry) => (entry as { name?: string }).name === "robots")).toBe(false);
  expect(buildRobots("https://example.com.br", false)).toBe("User-agent: *\nDisallow: /\n");
});

test("sitemap lists the home page and robots allows everything pointing at the sitemap", () => {
  expect(buildSitemap("https://example.com.br")).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com.br</loc></url>\n</urlset>\n',
  );
  expect(buildRobots("https://example.com.br", true)).toBe(
    "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://example.com.br/sitemap.xml\n",
  );
});
