import { useEffect, useRef, useState } from 'react'

import { content } from '~/content/site'
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

/**
 * Position dots and previous/next arrows for a row that already scrolls on its own. They need to
 * measure the row, so they appear only once the page has hydrated, inside space reserved for them.
 */
export function CarouselControls({ trackId }: { trackId: string }): React.ReactElement {
  const [points, setPoints] = useState<number[]>([])
  const [current, setCurrent] = useState(0)
  // Where a click is scrolling to. Positions passed on the way there are ignored.
  const targetRef = useRef<number | null>(null)
  const { controls } = content.forYou

  useEffect(() => {
    const track = document.getElementById(trackId)
    if (track === null) {
      return undefined
    }
    let measured: number[] = []

    const follow = () => {
      const target = targetRef.current
      if (target !== null && Math.abs(track.scrollLeft - target) > 2) {
        return
      }
      targetRef.current = null
      setCurrent(nearestPoint(measured, track.scrollLeft))
    }
    const release = () => {
      targetRef.current = null
    }
    const measure = () => {
      measured = measurePoints(track)
      release()
      setPoints(measured)
      setCurrent(nearestPoint(measured, track.scrollLeft))
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
  }, [trackId])

  function goTo(index: number) {
    const track = document.getElementById(trackId)
    const left = points[index]
    if (track === null || left === undefined) {
      return
    }
    setCurrent(index)
    targetRef.current = Math.abs(track.scrollLeft - left) > 2 ? left : null
    const still = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left, behavior: still ? 'instant' : 'smooth' })
  }

  return (
    <div className="carousel__controls">
      {points.length > 1 ? (
        <>
          {/* `aria-disabled`, not `disabled`: a keyboard user keeps focus at either end. */}
          <button
            type="button"
            className="carousel__arrow"
            aria-label={controls.previous}
            aria-controls={trackId}
            aria-disabled={current === 0}
            onClick={() => {
              goTo(current - 1)
            }}
          >
            <Chevron d="M15 5l-7 7 7 7" />
          </button>
          <div className="carousel__dots">
            {points.map((point, index) => (
              <button
                key={point}
                type="button"
                className="carousel__dot"
                aria-label={`${controls.goTo} ${index + 1} ${controls.of} ${points.length}`}
                aria-controls={trackId}
                aria-current={index === current ? 'true' : undefined}
                onClick={() => {
                  goTo(index)
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="carousel__arrow"
            aria-label={controls.next}
            aria-controls={trackId}
            aria-disabled={current === points.length - 1}
            onClick={() => {
              goTo(current + 1)
            }}
          >
            <Chevron d="M9 5l7 7-7 7" />
          </button>
        </>
      ) : null}
    </div>
  )
}
