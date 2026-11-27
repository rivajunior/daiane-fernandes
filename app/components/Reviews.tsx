import { content } from '~/content/site'

import { CardRow } from './CardRow'

const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z'

function Stars(): React.ReactElement {
  return (
    <svg className="review__icons" viewBox="0 0 120 24" aria-hidden="true" focusable="false">
      {[0, 24, 48, 72, 96].map((x) => (
        <path key={x} transform={`translate(${x} 0)`} d={STAR} />
      ))}
    </svg>
  )
}

/** What patients wrote about the consultation, as a row that scrolls sideways. */
export function Reviews(): React.ReactElement {
  const { reviews } = content
  return (
    <section className="band band--mist" id="avaliacoes" aria-labelledby="reviews-title">
      <div className="container">
        <p className="eyebrow">{reviews.eyebrow}</p>
        <h2 id="reviews-title">{reviews.title}</h2>
        <p className="lead">{reviews.lead}</p>
        <CardRow id="reviews-row" labelledBy="reviews-title" labels={reviews.controls}>
          {reviews.items.map((review) => (
            <li key={review.name} className="carousel__card">
              <figure className="review">
                <p className="review__stars">
                  <Stars />
                  <span className="visually-hidden">{reviews.starsLabel}</span>
                </p>
                <blockquote>
                  <p>{review.quote}</p>
                </blockquote>
                <figcaption>
                  <strong>{review.name}</strong>
                  <time dateTime={review.isoDate}>{review.date}</time>
                </figcaption>
              </figure>
            </li>
          ))}
        </CardRow>
        <p className="row-note">{reviews.note}</p>
      </div>
    </section>
  )
}
