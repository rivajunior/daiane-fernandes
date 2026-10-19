import { content } from "~/content/site";

import { Logo } from "./Logo";

type FooterProps = {
  crn?: string;
};

export function Footer({ crn }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo />
        <div id="contato" className="footer__contact" />
        <p className="footer__legal">
          © {year} {content.name} · {content.role}
          {crn ? ` · ${crn}` : ""}
        </p>
      </div>
    </footer>
  );
}
