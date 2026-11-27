/** The leaf from the logo monogram, with its base at 0,0. It fills the box `-20 -26 24 28`. */
export const LEAF_PATH = 'M0 0C-14-2-18-14-16-24-4-22 3-13 0 0z'

interface LeafShapeProps {
  x: number
  y: number
  turn?: number
  scale?: number
}

/** A leaf inside a larger drawing. The placement lives on the wrapper so CSS can animate the path. */
export function LeafShape({ x, y, turn = 0, scale = 1 }: LeafShapeProps): React.ReactElement {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
      <path className="art__leaf" d={LEAF_PATH} />
    </g>
  )
}
