import { LeafShape } from './Leaf'

export type PlantStage = 1 | 2 | 3

// The same plant a little further along: a taller stem and one more leaf each time.
const STAGES = {
  1: {
    stem: 'M40 96c0-10-3-16 0-24',
    leaves: [{ x: 40, y: 72, turn: 40, scale: 0.8 }],
  },
  2: {
    stem: 'M40 96c3-18-5-30 0-48',
    leaves: [
      { x: 40, y: 68, turn: -40, scale: 0.85 },
      { x: 40, y: 48, turn: 40, scale: 0.9 },
    ],
  },
  3: {
    stem: 'M40 96c-4-28 6-50 0-76',
    leaves: [
      { x: 40, y: 70, turn: -45, scale: 1 },
      { x: 40, y: 46, turn: 70, scale: 1 },
      { x: 40, y: 20, turn: 20, scale: 0.8 },
    ],
  },
} as const

export function StepPlant({ stage }: { stage: PlantStage }): React.ReactElement {
  const { stem, leaves } = STAGES[stage]
  return (
    <svg className="art step-plant" viewBox="0 0 80 100" aria-hidden="true" focusable="false">
      <path className="art__stem" pathLength="1" d={stem} />
      {leaves.map((leaf) => (
        <LeafShape key={leaf.y} {...leaf} />
      ))}
    </svg>
  )
}
