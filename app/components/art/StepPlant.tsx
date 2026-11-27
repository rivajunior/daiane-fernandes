import { LeafShape } from './Leaf'

export type PlantStage = 1 | 2 | 3

// The same plant a little further along: a taller stem and one more leaf each time.
const STAGES = {
  1: {
    stem: 'M40 98c0-10-3-16 0-24',
    leaves: [{ x: 40, y: 74, turn: 45, scale: 1.1 }],
  },
  2: {
    stem: 'M40 98c3-18-5-30 0-48',
    leaves: [
      { x: 40, y: 70, turn: -30, scale: 1.15 },
      { x: 40, y: 50, turn: 45, scale: 1.15 },
    ],
  },
  3: {
    stem: 'M40 98c-4-28 6-50 0-76',
    leaves: [
      { x: 40, y: 72, turn: -35, scale: 1.3 },
      { x: 41, y: 48, turn: 75, scale: 1.25 },
      { x: 40, y: 22, turn: 45, scale: 0.7 },
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
