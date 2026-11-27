import type { ReactNode } from 'react'

export interface RowLabels {
  previous: string
  next: string
  goTo: string
}

interface CardRowProps {
  id: string
  labelledBy: string
  labels: RowLabels
  cards: ReadonlyArray<{ key: string; content: ReactNode }>
}

/**
 * A row of cards that scrolls sideways. The browser draws its dots and arrows from carousel.css,
 * which names them with the `data-` labels here. Browsers that cannot yet do that show the row alone.
 */
export function CardRow({ id, labelledBy, labels, cards }: CardRowProps): React.ReactElement {
  return (
    <div className="carousel">
      <ul
        id={id}
        className="carousel__track"
        // A scroll container needs focus so keyboard users can reach the later cards.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-labelledby={labelledBy}
        data-previous={labels.previous}
        data-next={labels.next}
      >
        {cards.map((card, index) => (
          <li key={card.key} className="carousel__card" data-dot={`${labels.goTo} ${index + 1}`}>
            {card.content}
          </li>
        ))}
      </ul>
    </div>
  )
}
