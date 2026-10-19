import { CookieBanner } from "./CookieBanner";
import { Footer } from "./Footer";
import { Logo } from "./Logo";
import { About, Approach, ClosingCta, ForYou, Hero, HowItWorks, Payments } from "./sections";
import { WhatsappUrlContext } from "./WhatsappButton";
import "~/styles/sections.css";

type HomePageProps = {
  whatsappUrl: string;
  gaMeasurementId?: string;
  crn?: string;
  jsonLd?: object;
};

export function HomePage({ whatsappUrl, gaMeasurementId, crn, jsonLd }: HomePageProps) {
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
        <ClosingCta />
      </main>
      <Footer crn={crn} showCookiePreferences={Boolean(gaMeasurementId)} />
      <CookieBanner measurementId={gaMeasurementId} />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
    </WhatsappUrlContext>
  );
}

