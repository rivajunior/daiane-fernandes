import { LEAF_PATH } from './Leaf'

type Depth = 'near' | 'mid' | 'far'

// One entry per leaf; art.css places each by scene and position in the list.
const SCENES = {
  hero: ['near', 'mid', 'far', 'far'],
  about: ['mid', 'far'],
  faq: ['near', 'far'],
} as const satisfies Record<string, readonly Depth[]>

export type LeafScene = keyof typeof SCENES

/** Loose decorative leaves around a section. */
export function Leaves({ scene }: { scene: LeafScene }): React.ReactElement {
  return (
    <div className={`leaves leaves--${scene}`} aria-hidden="true">
      {SCENES[scene].map((depth, index) => {
        const name = `leaves__leaf leaves__leaf--${index + 1} leaves__leaf--${depth}`
        return (
          <span key={name} className={name}>
            <svg viewBox="-20 -26 24 28" focusable="false">
              <path className="art__leaf" d={LEAF_PATH} />
            </svg>
          </span>
        )
      })}
    </div>
  )
}
