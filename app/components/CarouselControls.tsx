import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { nearestPoint, snapPoints } from '~/lib/carousel'

// Anything that means the visitor is moving the row themselves.
const TAKEOVER_EVENTS = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const

function measurePoints(track: HTMLElement): number[] {
  const offsets = Array.from(track.children, (card) =>
    card instanceof HTMLElement ? card.offsetLeft : 0,
  )
  const first = offsets[0] ?? 0
  return snapPoints(
    offsets.map((offset) => offset - first),
    track.scrollWidth - track.clientWidth,
  )
}

function Chevron({ d }: { d: string }): React.ReactElement {
  return (
    <svg
      className="art"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}

export interface RowLabels {
  previous: string
  next: string
  goTo: string
  of: string
}

function findTrack(trackId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#${trackId}`)
}

/** Reports the row's positions, and which one it is at, until the returned cleanup runs. */
function watchTrack(
  track: HTMLElement,
  targetRef: RefObject<number | null>,
  onMeasure: (points: number[]) => void,
  onMove: (current: number) => void,
): () => void {
  let measured: number[] = []

  const follow = () => {
    const target = targetRef.current
    if (target !== null && Math.abs(track.scrollLeft - target) > 2) {
      return
    }
    targetRef.current = null
    onMove(nearestPoint(measured, track.scrollLeft))
  }
  const release = () => {
    targetRef.current = null
  }
  const measure = () => {
    measured = measurePoints(track)
    release()
    onMeasure(measured)
    onMove(nearestPoint(measured, track.scrollLeft))
  }

  measure()
  globalThis.addEventListener('resize', measure)
  track.addEventListener('scroll', follow, { passive: true })
  for (const name of TAKEOVER_EVENTS) {
    track.addEventListener(name, release, { passive: true })
  }
  return () => {
    globalThis.removeEventListener('resize', measure)
    track.removeEventListener('scroll', follow)
    for (const name of TAKEOVER_EVENTS) {
      track.removeEventListener(name, release)
    }
  }
}

function useCarousel(trackId: string) {
  const [points, setPoints] = useState<number[]>([])
  const [current, setCurrent] = useState(0)
  // Where a click is scrolling to. Positions passed on the way there are ignored.
  const targetRef = useRef<number | null>(null)

  useEffect(() => {
    const track = findTrack(trackId)
    return track === null ? undefined : watchTrack(track, targetRef, setPoints, setCurrent)
  }, [trackId])

  const goTo = useCallback(
    (index: number) => {
      const track = findTrack(trackId)
      const left = points[index]
      if (track === null || left === undefined) {
        return
      }
      setCurrent(index)
      targetRef.current = Math.abs(track.scrollLeft - left) > 2 ? left : null
      const still = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
      track.scrollTo({ left, behavior: still ? 'instant' : 'smooth' })
    },
    [trackId, points],
  )

  return { points, current, goTo }
}

/** A click handler that selects one position of the row. */
function useSelect(onSelect: (index: number) => void, index: number) {
  return useCallback(() => {
    onSelect(index)
  }, [onSelect, index])
}

interface ArrowProps {
  trackId: string
  label: string
  d: string
  atEnd: boolean
  target: number
  onSelect: (index: number) => void
}

function Arrow({ trackId, label, d, atEnd, target, onSelect }: ArrowProps): React.ReactElement {
  const select = useSelect(onSelect, target)
  return (
    // `aria-disabled`, not `disabled`: a keyboard user keeps focus at either end.
    <button
      type="button"
      className="carousel__arrow"
      aria-label={label}
      aria-controls={trackId}
      aria-disabled={atEnd}
      onClick={select}
    >
      <Chevron d={d} />
    </button>
  )
}

interface DotProps {
  trackId: string
  label: string
  index: number
  isCurrent: boolean
  onSelect: (index: number) => void
}

function Dot({ trackId, label, index, isCurrent, onSelect }: DotProps): React.ReactElement {
  const select = useSelect(onSelect, index)
  return (
    <button
      type="button"
      className="carousel__dot"
      aria-label={label}
      aria-controls={trackId}
      aria-current={isCurrent ? 'true' : undefined}
      onClick={select}
    />
  )
}

interface DotsProps {
  trackId: string
  labels: RowLabels
  points: number[]
  current: number
  onSelect: (index: number) => void
}

function Dots({ trackId, labels, points, current, onSelect }: DotsProps): React.ReactElement {
  return (
    <div className="carousel__dots">
      {points.map((point, index) => (
        <Dot
          key={point}
          trackId={trackId}
          label={`${labels.goTo} ${index + 1} ${labels.of} ${points.length}`}
          index={index}
          isCurrent={index === current}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

/**
 * Position dots and previous/next arrows for a row that already scrolls on its own. They need to
 * measure the row, so they appear only once the page has hydrated, inside space reserved for them.
 */
export function CarouselControls({
  trackId,
  labels,
}: {
  trackId: string
  labels: RowLabels
}): React.ReactElement {
  const { points, current, goTo } = useCarousel(trackId)

  return (
    <div className="carousel__controls">
      {points.length > 1 ? (
        <>
          <Arrow
            trackId={trackId}
            label={labels.previous}
            d="M15 5l-7 7 7 7"
            atEnd={current === 0}
            target={current - 1}
            onSelect={goTo}
          />
          <Dots
            trackId={trackId}
            labels={labels}
            points={points}
            current={current}
            onSelect={goTo}
          />
          <Arrow
            trackId={trackId}
            label={labels.next}
            d="M9 5l7 7-7 7"
            atEnd={current === points.length - 1}
            target={current + 1}
            onSelect={goTo}
          />
        </>
      ) : null}
    </div>
  )
}
