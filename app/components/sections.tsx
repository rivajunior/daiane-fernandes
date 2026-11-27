import { Fragment } from 'react'

import { content } from '~/content/site'

import { Leaves } from './art/Leaves'
import { OnlineCallArt } from './art/OnlineCallArt'
import { PlateArt } from './art/PlateArt'
import { StemsArt } from './art/StemsArt'
import { type PlantStage, StepPlant } from './art/StepPlant'
import { WhatsappButton } from './WhatsappButton'

type Photo = {
  basename: string
  widths: readonly number[]
  sizes: string
}

const HERO_PHOTO: Photo = {
  basename: 'daiane-hero',
  widths: [400, 640, 880, 1200],
  sizes: '(min-width: 48rem) 440px, 80vw',
}

const ABOUT_PHOTO: Photo = {
  basename: 'daiane-about',
  widths: [400, 640],
  sizes: '(min-width: 48rem) 400px, 90vw',
}

function srcSet({ basename, widths }: Photo, ext: 'avif' | 'webp' | 'jpg') {
  return widths.map((w) => `/images/${basename}-${w}.${ext} ${w}w`).join(', ')
}

function Sources({ photo }: { photo: Photo }): React.ReactElement {
  return (
    <>
      <source type="image/avif" srcSet={srcSet(photo, 'avif')} sizes={photo.sizes} />
      <source type="image/webp" srcSet={srcSet(photo, 'webp')} sizes={photo.sizes} />
    </>
  )
}

export function Hero(): React.ReactElement {
  const { hero } = content
  return (
    <section className="hero has-leaves" id="inicio" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title">{hero.title}</h1>
          <p className="lead">{hero.subtitle}</p>
          <a className="button" href="#contato">
            {hero.cta}
          </a>
          <p className="hero__note">{hero.note}</p>
        </div>
        <div className="hero__stage">
          <Leaves scene="hero" />
          <div className="hero__figure">
            <picture>
              <Sources photo={HERO_PHOTO} />
              <img
                className="hero__photo"
                src="/images/daiane-hero-880.jpg"
                srcSet={srcSet(HERO_PHOTO, 'jpg')}
                sizes={HERO_PHOTO.sizes}
                width="880"
                height="1100"
                fetchPriority="high"
                decoding="async"
                alt={hero.photoAlt}
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
    <section className="band band--mist has-leaves" id="sobre" aria-labelledby="about-title">
      <Leaves scene="about" />
      <div className="container about">
        <figure className="about__photo">
          <picture>
            <Sources photo={ABOUT_PHOTO} />
            <img
              src="/images/daiane-about-640.jpg"
              srcSet={srcSet(ABOUT_PHOTO, 'jpg')}
              sizes={ABOUT_PHOTO.sizes}
              width="640"
              height="700"
              loading="lazy"
              decoding="async"
              alt={about.photoAlt}
            />
          </picture>
          <figcaption>
            {about.caption.map((word, index) => (
              <Fragment key={word}>
                {index === 0 ? null : <span aria-hidden="true">•</span>}
                {word}
              </Fragment>
            ))}
          </figcaption>
        </figure>
        <div className="about__copy">
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 id="about-title">{about.title}</h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <a className="button" href="#processo">
            {about.cta}
          </a>
        </div>
      </div>
    </section>
  )
}

type Value = (typeof content.approach.items)[number]

// Sharing a `name` keeps one answer open at a time without any script.
function Values({ items }: { items: readonly Value[] }): React.ReactElement {
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
        <p className="eyebrow">{approach.eyebrow}</p>
        <h2 id="approach-title">{approach.title}</h2>
        <div className="plate">
          <Values items={approach.items.slice(0, 2)} />
          <div className="plate__art">
            <PlateArt />
          </div>
          <Values items={approach.items.slice(2)} />
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
    <section className="section" id="processo" aria-labelledby="how-title">
      <div className="container">
        <p className="eyebrow">{howItWorks.eyebrow}</p>
        <h2 id="how-title">{howItWorks.title}</h2>
        <p className="lead">{howItWorks.lead}</p>
        <ol className="steps">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title}>
              <div className="step__plant">
                <StepPlant stage={PLANT_STAGES[index]!} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <WhatsappButton section="how-it-works">{howItWorks.cta}</WhatsappButton>
      </div>
    </section>
  )
}

export function Online(): React.ReactElement {
  const { online } = content
  return (
    <section className="section section--tight" aria-labelledby="online-title">
      <div className="container online">
        <div className="online__copy">
          <p className="eyebrow">{online.eyebrow}</p>
          <h2 id="online-title">{online.title}</h2>
          {online.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <WhatsappButton section="online">{online.cta}</WhatsappButton>
        </div>
        {/* The only place that knows what illustrates this section. */}
        <div className="online__art">
          <OnlineCallArt />
        </div>
      </div>
    </section>
  )
}

export function Faq(): React.ReactElement {
  const { faq } = content
  return (
    <section className="section has-leaves" id="duvidas" aria-labelledby="faq-title">
      <Leaves scene="faq" />
      <div className="container faq">
        <p className="eyebrow">{faq.eyebrow}</p>
        <h2 id="faq-title">{faq.title}</h2>
        <div className="faq__list">
          {faq.items.map((item) => (
            <details key={item.question} name="faq">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ClosingCta(): React.ReactElement {
  const { closing } = content
  return (
    <section className="band band--mist closing" id="contato" aria-labelledby="closing-title">
      <div className="container">
        <p className="eyebrow">{closing.eyebrow}</p>
        <h2 id="closing-title">{closing.title}</h2>
        <p className="lead">{closing.lead}</p>
        <div className="closing__art">
          <StemsArt />
        </div>
        <WhatsappButton section="closing">{closing.cta}</WhatsappButton>
        <p className="closing__line">{closing.line}</p>
      </div>
    </section>
  )
}
