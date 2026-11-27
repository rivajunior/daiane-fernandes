import { content } from '~/content/site'

export function buildJsonLd(siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Nutritionist',
    name: content.name,
    description: content.meta.description,
    url: siteUrl,
    image: `${siteUrl}/images/daiane-hero-880.jpg`,
    areaServed: 'BR',
    availableLanguage: 'pt-BR',
    address: {
      '@type': 'PostalAddress',
      addressLocality: content.city,
      addressRegion: content.state,
      addressCountry: 'BR',
    },
    identifier: content.crn,
    sameAs: [content.instagram.url],
  }
}

export function buildMeta(siteUrl: string): Array<Record<string, string>> {
  const image = `${siteUrl}/images/og-image-v3.jpg`
  return [
    { title: content.meta.title },
    { name: 'description', content: content.meta.description },
    { tagName: 'link', rel: 'canonical', href: siteUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'pt_BR' },
    { property: 'og:site_name', content: content.name },
    { property: 'og:title', content: content.meta.title },
    { property: 'og:description', content: content.meta.socialDescription },
    { property: 'og:url', content: siteUrl },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: content.meta.title },
    { name: 'twitter:description', content: content.meta.socialDescription },
    { name: 'twitter:image', content: image },
  ]
}

export function buildSitemap(siteUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}</loc></url>\n</urlset>\n`
}

export function buildRobots(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
}
