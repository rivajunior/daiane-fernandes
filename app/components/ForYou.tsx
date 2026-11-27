import { content } from '~/content/site'

import { SituationArt } from './art/SituationArt'
import { CarouselControls } from './CarouselControls'

/** The situations visitors may recognise, as an illustrated row that scrolls sideways. */
export function ForYou(): React.ReactElement {
  const { forYou } = content
  return (
    <section className="section" aria-labelledby="for-you-title">
      <div className="container">
        <h2 id="for-you-title">{forYou.title}</h2>
        <ul
          id="situations"
          className="carousel__track"
          // A scroll container needs focus so keyboard users can reach the later cards.
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          aria-labelledby="for-you-title"
        >
          {forYou.cards.map((card) => (
            <li key={card.title} className="carousel__card">
              <div className="carousel__art">
                <SituationArt name={card.art} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </li>
          ))}
        </ul>
        <CarouselControls trackId="situations" />
        <p className="statements__note">{forYou.note}</p>
      </div>
    </section>
  )
}
