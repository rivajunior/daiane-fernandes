import { LeafShape } from './Leaf'

/** A plate seen from above, with a line reaching towards each of the four questions around it. */
export function PlateArt(): React.ReactElement {
  return (
    <svg className="art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="36" />
      <circle cx="60" cy="60" r="24" />
      <path d="M34 34L16 20M86 34l18-14M34 86l-18 14M86 86l18 14" />
      <LeafShape x={70} y={76} turn={-5} scale={1.3} />
    </svg>
  )
}
