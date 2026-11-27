import { content } from '~/content/site'

import { Leaves } from './art/Leaves'
import { PlateArt } from './art/PlateArt'
import { type PlantStage, StepPlant } from './art/StepPlant'
import { WhatsappButton } from './WhatsappButton'

const HERO_WIDTHS = [400, 640, 880, 1200]
const HERO_SIZES = '(min-width: 48rem) 440px, 80vw'

function heroSrcSet(ext: 'avif' | 'webp' | 'jpg') {
  return HERO_WIDTHS.map((w) => `/images/daiane-hero-${w}.${ext} ${w}w`).join(', ')
}

export function Hero(): React.ReactElement {
  const { hero, about } = content
  return (
    <section className="hero has-leaves" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title">{hero.title}</h1>
          <p className="lead">{hero.subtitle}</p>
          <WhatsappButton section="hero">{hero.cta}</WhatsappButton>
        </div>
        <div className="hero__stage">
          <Leaves scene="hero" />
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
      </div>
    </section>
  )
}

export function About(): React.ReactElement {
  const { about } = content
  return (
    <section className="band band--mist has-leaves" aria-labelledby="about-title">
      <Leaves scene="about" />
      <div className="container about">
        <h2 id="about-title">{about.title}</h2>
        <ul className="about__tags">
          {about.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <p className="about__line">{about.line}</p>
        <WhatsappButton section="about">{about.cta}</WhatsappButton>
      </div>
    </section>
  )
}

type Question = (typeof content.approach.items)[number]

// Sharing a `name` keeps one answer open at a time without any script.
function Questions({ items }: { items: readonly Question[] }): React.ReactElement {
  return (
    <ul className="plate__questions">
      {items.map((item) => (
        <li key={item.label}>
          <details name="approach">
            <summary>{item.label}</summary>
            <p>{item.text}</p>
          </details>
        </li>
      ))}
    </ul>
  )
}

export function Approach(): React.ReactElement {
  const { approach } = content
  return (
    <section className="band band--green" aria-labelledby="approach-title">
      <div className="container">
        <h2 id="approach-title">{approach.title}</h2>
        <p className="lead">{approach.line}</p>
        <div className="plate">
          <Questions items={approach.items.slice(0, 2)} />
          <div className="plate__art">
            <PlateArt />
          </div>
          <Questions items={approach.items.slice(2)} />
        </div>
      </div>
    </section>
  )
}

// One plant per consultation step, in order.
const PLANT_STAGES: readonly PlantStage[] = [1, 2, 3]

export function HowItWorks(): React.ReactElement {
  const { howItWorks } = content
  return (
    <section className="section" aria-labelledby="how-title">
      <div className="container">
        <h2 id="how-title">{howItWorks.title}</h2>
        <p className="lead">{howItWorks.text}</p>
        <ol className="steps">
          {howItWorks.steps.map((step, index) => {
            const [name, tagline] = step.title.split(' – ')
            return (
              <li key={step.title}>
                <div className="step__plant">
                  <StepPlant stage={PLANT_STAGES[index]!} />
                </div>
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
          <p>{payments.booking}</p>
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

export function Faq(): React.ReactElement {
  const { faq } = content
  return (
    <section className="section section--tight" aria-labelledby="faq-title">
      <div className="container split">
        <h2 id="faq-title" className="split__title">
          {faq.question}
        </h2>
        <div className="faq__answer">
          {faq.answer.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
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
