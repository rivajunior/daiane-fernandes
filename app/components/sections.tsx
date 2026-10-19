import { content } from '~/content/site'

import { WhatsappButton } from './WhatsappButton'

const HERO_WIDTHS = [400, 640, 880, 1200]
const HERO_SIZES = '(min-width: 48rem) 440px, 80vw'

function heroSrcSet(ext: 'avif' | 'webp' | 'jpg') {
  return HERO_WIDTHS.map((w) => `/images/daiane-hero-${w}.${ext} ${w}w`).join(', ')
}

export function Hero(): React.ReactElement {
  const { hero, about } = content
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title">{hero.title}</h1>
          <p className="lead">{hero.subtitle}</p>
          <WhatsappButton section="hero">{hero.cta}</WhatsappButton>
        </div>
        <div className="hero__figure">
          <picture>
            <source type="image/avif" srcSet={heroSrcSet('avif')} sizes={HERO_SIZES} />
            <source type="image/webp" srcSet={heroSrcSet('webp')} sizes={HERO_SIZES} />
            <img
              className="hero__photo"
              src="/images/daiane-hero-880.jpg"
              srcSet={heroSrcSet('jpg')}
              sizes={HERO_SIZES}
              width="880"
              height="1100"
              fetchPriority="high"
              decoding="async"
              alt={about.photoAlt}
            />
          </picture>
        </div>
      </div>
    </section>
  )
}

export function About(): React.ReactElement {
  const { about } = content
  return (
    <section className="band band--mist" aria-labelledby="about-title">
      <div className="container about">
        <h2 id="about-title" className="visually-hidden">
          {about.title}
        </h2>
        <p className="about__text">{about.text}</p>
        <WhatsappButton section="about">{about.cta}</WhatsappButton>
      </div>
    </section>
  )
}

export function ForYou(): React.ReactElement {
  const { forYou } = content
  return (
    <section className="section" aria-labelledby="for-you-title">
      <div className="container split">
        <h2 id="for-you-title" className="split__title">
          {forYou.title}
        </h2>
        <ul className="statements">
          {forYou.cards.map((card) => (
            <li key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Approach(): React.ReactElement {
  const { approach } = content
  return (
    <section className="band band--green" aria-labelledby="approach-title">
      <div className="container split">
        <div className="split__title">
          <h2 id="approach-title">{approach.title}</h2>
          <p className="lead">{approach.text}</p>
        </div>
        <div>
          <h3 className="investigate__title">{approach.panelTitle}</h3>
          <ul className="investigate">
            {approach.items.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function HowItWorks(): React.ReactElement {
  const { howItWorks } = content
  return (
    <section className="section" aria-labelledby="how-title">
      <div className="container">
        <h2 id="how-title">{howItWorks.title}</h2>
        <p className="lead">{howItWorks.text}</p>
        <ol className="steps">
          {howItWorks.steps.map((step) => {
            const [name, tagline] = step.title.split(' – ')
            return (
              <li key={step.title}>
                <h3>
                  {name}
                  {tagline === undefined ? null : <span>{tagline}</span>}
                </h3>
                <p>{step.text}</p>
              </li>
            )
          })}
        </ol>
        <WhatsappButton section="how-it-works">{howItWorks.cta}</WhatsappButton>
      </div>
    </section>
  )
}

export function Payments(): React.ReactElement {
  const { payments } = content
  return (
    <section className="section section--tight" aria-labelledby="payments-title">
      <div className="container split">
        <div className="split__title">
          <h2 id="payments-title">{payments.title}</h2>
          <p className="lead">{payments.text}</p>
        </div>
        <ul className="methods">
          {payments.methods.map((method) => (
            <li key={method}>{method}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ClosingCta(): React.ReactElement {
  const { closing } = content
  return (
    <section className="band band--mist closing" aria-labelledby="closing-title">
      <div className="container">
        <h2 id="closing-title">{closing.title}</h2>
        <p className="lead">{closing.text}</p>
        <WhatsappButton section="closing">{closing.cta}</WhatsappButton>
      </div>
    </section>
  )
}
