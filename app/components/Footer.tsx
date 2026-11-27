import { content } from '~/content/site'

import { Logo } from './Logo'
import { WhatsappButton } from './WhatsappButton'

type FooterProps = {
  year: number
  crn: string
}

function InstagramIcon(): React.ReactElement {
  return (
    <svg
      className="art"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  )
}

export function Footer({ year, crn }: FooterProps): React.ReactElement {
  const { name, role, instagram, footer } = content
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <Logo variant="light" />
          <p className="footer__role">
            {role} • {crn}
          </p>
        </div>
        <ul className="footer__links">
          <li>
            <WhatsappButton section="footer" className="footer__link">
              {footer.whatsapp}
            </WhatsappButton>
          </li>
          <li>
            <a
              className="footer__link"
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={instagram.label}
            >
              <InstagramIcon />
              <span>{instagram.handle}</span>
            </a>
          </li>
        </ul>
        <p>{footer.service}</p>
        <p className="footer__legal">
          © {year} {name} • {role} {crn}. {footer.rights}
        </p>
        <p className="footer__legal">{footer.aiNotice}</p>
      </div>
    </footer>
  )
}
