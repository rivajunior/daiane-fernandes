import { content } from "~/content/site";

import { Monogram } from "./Logo";
import { WhatsappButton } from "./WhatsappButton";

export function Hero() {
  const { hero } = content;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Monogram className="watermark" />
      <div className="container hero__inner">
        <h1 id="hero-title">{hero.title}</h1>
        <p className="lead">{hero.subtitle}</p>
        <WhatsappButton section="hero">{hero.cta}</WhatsappButton>
      </div>
    </section>
  );
}

export function About() {
  const { about } = content;
  return (
    <section className="section" aria-labelledby="about-title">
      <div className="container about">
        <picture>
          <source
            type="image/avif"
            srcSet="/images/daiane-360.avif 360w, /images/daiane-720.avif 720w"
            sizes="(min-width: 48rem) 360px, 90vw"
          />
          <source
            type="image/webp"
            srcSet="/images/daiane-360.webp 360w, /images/daiane-720.webp 720w"
            sizes="(min-width: 48rem) 360px, 90vw"
          />
          <img
            className="about__photo"
            src="/images/daiane-360.jpg"
            srcSet="/images/daiane-360.jpg 360w, /images/daiane-720.jpg 720w"
            sizes="(min-width: 48rem) 360px, 90vw"
            width="360"
            height="362"
            fetchPriority="high"
            decoding="async"
            alt={about.photoAlt}
          />
        </picture>
        <div className="about__text">
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 id="about-title" className="visually-hidden">
            {about.title}
          </h2>
          <p>{about.text}</p>
          <WhatsappButton section="about">{about.cta}</WhatsappButton>
        </div>
      </div>
    </section>
  );
}

export function ForYou() {
  const { forYou } = content;
  return (
    <section className="section" aria-labelledby="for-you-title">
      <div className="container">
        <p className="eyebrow">{forYou.eyebrow}</p>
        <h2 id="for-you-title">{forYou.title}</h2>
        <ul className="cards">
          {forYou.cards.map((card) => (
            <li key={card.title} className="card">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Approach() {
  const { approach } = content;
  return (
    <section className="section" aria-labelledby="approach-title">
      <div className="container">
        <p className="eyebrow">{approach.eyebrow}</p>
        <h2 id="approach-title">{approach.title}</h2>
        <p className="lead">{approach.text}</p>
        <div className="panel">
          <h3>{approach.panelTitle}</h3>
          <ul>
            {approach.items.map((item) => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { howItWorks } = content;
  return (
    <section className="section" aria-labelledby="how-title">
      <div className="container">
        <p className="eyebrow">{howItWorks.eyebrow}</p>
        <h2 id="how-title">{howItWorks.title}</h2>
        <p className="lead">{howItWorks.text}</p>
        <ol className="steps">
          {howItWorks.steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <WhatsappButton section="how-it-works">{howItWorks.cta}</WhatsappButton>
      </div>
    </section>
  );
}

export function Payments() {
  const { payments } = content;
  return (
    <section className="section" aria-labelledby="payments-title">
      <div className="container">
        <p className="eyebrow">{payments.eyebrow}</p>
        <h2 id="payments-title">{payments.title}</h2>
        <p className="lead">{payments.text}</p>
        <ul className="methods">
          {payments.methods.map((method) => (
            <li key={method}>{method}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ClosingCta() {
  const { closing } = content;
  return (
    <section className="section closing" aria-labelledby="closing-title">
      <div className="container">
        <p className="eyebrow">{closing.eyebrow}</p>
        <h2 id="closing-title">{closing.title}</h2>
        <p className="lead">{closing.text}</p>
        <WhatsappButton section="closing">{closing.cta}</WhatsappButton>
      </div>
    </section>
  );
}
