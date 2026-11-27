import type { ReactNode } from 'react'

import { CarouselControls, type RowLabels } from './CarouselControls'

type CardRowProps = {
  id: string
  labelledBy: string
  labels: RowLabels
  children: ReactNode
}

/** A row of cards that scrolls sideways, with its dots and arrows. */
export function CardRow({ id, labelledBy, labels, children }: CardRowProps): React.ReactElement {
  return (
    <>
      <ul
        id={id}
        className="carousel__track"
        // A scroll container needs focus so keyboard users can reach the later cards.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-labelledby={labelledBy}
      >
        {children}
      </ul>
      <CarouselControls trackId={id} labels={labels} />
    </>
  )
}
