import { content } from '~/content/site'

import { AreaArt } from './art/AreaArt'
import { CardRow } from './CardRow'

/** The ways Daiane can help, as an illustrated row that scrolls sideways. */
export function HelpAreas(): React.ReactElement {
  const { help } = content
  return (
    <section className="section" id="atendimento" aria-labelledby="help-title">
      <div className="container">
        <p className="eyebrow">{help.eyebrow}</p>
        <h2 id="help-title">{help.title}</h2>
        <p className="lead">{help.lead}</p>
        <CardRow id="help-row" labelledBy="help-title" labels={help.controls}>
          {help.cards.map((card) => (
            <li key={card.title} className="carousel__card">
              <div className="carousel__art">
                <AreaArt name={card.art} />
              </div>
              <p className="card__label">{card.label}</p>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </li>
          ))}
        </CardRow>
        <p className="row-note">{help.note}</p>
      </div>
    </section>
  )
}
