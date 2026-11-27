import { CookieBanner } from './CookieBanner'
import { Footer } from './Footer'
import { ForYou } from './ForYou'
import { Logo } from './Logo'
import { About, Approach, ClosingCta, Faq, Hero, HowItWorks, Payments } from './sections'
import { WhatsappUrlContext } from './WhatsappButton'

type HomePageProps = {
  whatsappUrl: string
  gaMeasurementId?: string
  year: number
  crn?: string
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
      <header className="site-header">
        <div className="container">
          <Logo />
        </div>
      </header>
      <main id="conteudo">
        <Hero />
        <About />
        <ForYou />
        <Approach />
        <HowItWorks />
        <Payments />
        <Faq />
        <ClosingCta />
      </main>
      <Footer year={year} crn={crn} showCookiePreferences={Boolean(gaMeasurementId)} />
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
