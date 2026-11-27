import { LeafShape } from './Leaf'

/** Two stems that grow towards each other and meet. */
export function StemsArt(): React.ReactElement {
  return (
    <svg className="art stems" viewBox="80 55 120 90" aria-hidden="true" focusable="false">
      <path className="art__stem" pathLength="1" d="M96 140c0-28 44-22 44-46" />
      <path className="art__stem" pathLength="1" d="M184 140c0-28-44-22-44-46" />
      <LeafShape x={140} y={94} turn={-40} scale={1.1} />
      <LeafShape x={140} y={94} turn={45} scale={1.1} />
      <LeafShape x={108} y={121} turn={-55} scale={0.8} />
      <LeafShape x={172} y={121} turn={55} scale={0.8} />
    </svg>
  )
}
