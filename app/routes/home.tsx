import { HomePage } from '~/components/HomePage'
import { content } from '~/content/site'
import { readWebAnalyticsToken } from '~/lib/env.server'
import { buildJsonLd, buildMeta } from '~/lib/seo'
import { buildWhatsappUrl } from '~/lib/whatsapp'

import type { Route } from './+types/home'

interface HomeLoaderData {
  whatsappUrl: string
  webAnalyticsToken: string
  year: number
  jsonLd: object
}

export function loader(): HomeLoaderData {
  return {
    whatsappUrl: buildWhatsappUrl(content.whatsappNumber, content.whatsappMessage),
    webAnalyticsToken: readWebAnalyticsToken(),
    year: new Date().getFullYear(),
    jsonLd: buildJsonLd(),
  }
}

export function meta(): ReturnType<typeof buildMeta> {
  return buildMeta()
}

export default function Home({ loaderData }: Route.ComponentProps): React.ReactElement {
  return <HomePage {...loaderData} />
}
