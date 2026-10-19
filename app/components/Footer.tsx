import { use } from "react";

import { content } from "~/content/site";

import { EmailReveal } from "./EmailReveal";
import { Logo } from "./Logo";
import { WhatsappUrlContext } from "./WhatsappButton";

type FooterProps = {
  crn?: string;
};

export function Footer({ crn }: FooterProps) {
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
      </div>
    </footer>
  );
}
