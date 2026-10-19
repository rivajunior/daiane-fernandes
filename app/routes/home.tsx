import { HomePage } from '~/components/HomePage'
import { content } from '~/content/site'
import { readPublicConfig } from '~/lib/env.server'
import { buildJsonLd, buildMeta } from '~/lib/seo'
import { buildWhatsappUrl } from '~/lib/whatsapp'

import type { Route } from './+types/home'

type HomeLoaderData = {
  whatsappUrl: string
  siteUrl: string
  gaMeasurementId: string | undefined
  year: number
  indexable: boolean
  crn: string | undefined
  jsonLd: object
}

export function loader(): HomeLoaderData {
  const config = readPublicConfig()
  return {
    whatsappUrl: buildWhatsappUrl(config.whatsappNumber, content.whatsappMessage),
    siteUrl: config.siteUrl,
    gaMeasurementId: config.gaMeasurementId,
    year: new Date().getFullYear(),
    indexable: config.indexable,
    crn: config.crn,
    jsonLd: buildJsonLd(config),
  }
}

export function meta({ loaderData }: Route.MetaArgs): ReturnType<typeof buildMeta> {
  return buildMeta(loaderData.siteUrl, loaderData.indexable)
}

export default function Home({ loaderData }: Route.ComponentProps): React.ReactElement {
  return <HomePage {...loaderData} />
}
