import { CookieBanner } from './CookieBanner'
import { Footer } from './Footer'
import { Header, MobileCta } from './Header'
import { HelpAreas } from './HelpAreas'
import { Reviews } from './Reviews'
import { About, Approach, ClosingCta, Faq, Hero, HowItWorks, Online } from './sections'
import { WhatsappUrlContext } from './WhatsappButton'

type HomePageProps = {
  whatsappUrl: string
  gaMeasurementId?: string
  year: number
  crn: string
  jsonLd?: object
}

export function HomePage({
  whatsappUrl,
  gaMeasurementId,
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
      <Footer year={year} crn={crn} showCookiePreferences={Boolean(gaMeasurementId)} />
      <MobileCta />
      <CookieBanner measurementId={gaMeasurementId} />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll('<', '\\u003c') }}
        />
      ) : null}
    </WhatsappUrlContext>
  )
}
