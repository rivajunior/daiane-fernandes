import { content } from '~/content/site'

import { Logo } from './Logo'
import { WhatsappButton } from './WhatsappButton'

export function Header(): React.ReactElement {
  const { header } = content
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav className="site-nav" aria-label={header.menuLabel}>
          <ul>
            {header.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <WhatsappButton section="header" className="button header-cta">
          {header.cta}
        </WhatsappButton>
      </div>
    </header>
  )
}

/** The booking button that stays at the bottom of narrow screens. */
export function MobileCta(): React.ReactElement {
  const { cta } = content.header
  return (
    <aside className="mobile-bar" aria-label={cta}>
      <WhatsappButton section="mobile-bar" className="button mobile-cta">
        {cta}
      </WhatsappButton>
    </aside>
  )
}
