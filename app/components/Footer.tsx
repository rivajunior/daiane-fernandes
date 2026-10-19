import { use } from "react";

import { content } from "~/content/site";

import { OPEN_COOKIE_PREFERENCES_EVENT } from "./CookieBanner";
import { EmailReveal } from "./EmailReveal";
import { Logo } from "./Logo";
import { WhatsappUrlContext } from "./WhatsappButton";

type FooterProps = {
  crn?: string;
  showCookiePreferences?: boolean;
};

export function Footer({ crn, showCookiePreferences = false }: FooterProps) {
  const year = new Date().getFullYear();
  const whatsappUrl = use(WhatsappUrlContext);
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo />
        <div id="contato" className="footer__contact">
          <EmailReveal whatsappFallbackHref={whatsappUrl} />
        </div>
        <p className="footer__legal">
          © {year} {content.name} · {content.role}
          {crn ? ` · ${crn}` : ""}
        </p>
        {showCookiePreferences ? (
          <button
            type="button"
            className="link-button"
            onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))}
          >
            {content.footer.cookiePreferences}
          </button>
        ) : null}
      </div>
    </footer>
  );
}
