import { Footer } from './Footer'
import { Header, MobileCta } from './Header'
import { HelpAreas } from './HelpAreas'
import { Reviews } from './Reviews'
import { About, Approach, ClosingCta, Faq, Hero, HowItWorks, Online } from './sections'
import { WhatsappUrlContext } from './WhatsappButton'

interface HomePageProps {
  whatsappUrl: string
  webAnalyticsToken?: string
  year: number
  crn: string
  jsonLd?: object
}

export function HomePage({
  whatsappUrl,
  webAnalyticsToken,
  year,
  crn,
  jsonLd,
}: HomePageProps): React.ReactElement {
  return (
    <WhatsappUrlContext value={whatsappUrl}>
      <Header />
      <main id="conteudo">
        <Hero />
        <About />
        <HelpAreas />
        <Approach />
        <HowItWorks />
        <Online />
        <Reviews />
        <Faq />
        <ClosingCta />
      </main>
      <Footer year={year} crn={crn} />
      <MobileCta />
      {/* Cloudflare Web Analytics. It stores nothing in the browser, so no consent banner. */}
      {webAnalyticsToken !== undefined && webAnalyticsToken !== '' ? (
        <script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: webAnalyticsToken })}
        />
      ) : null}
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll('<', '\\u003c') }}
        />
      ) : null}
    </WhatsappUrlContext>
  )
}
