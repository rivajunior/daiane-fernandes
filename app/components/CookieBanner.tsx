import { useEffect, useState, useSyncExternalStore } from 'react'

import { content } from '~/content/site'
import { loadAnalytics } from '~/lib/analytics'
import { type ConsentState, readConsent, writeConsent } from '~/lib/consent'
import { subscribeNever } from '~/lib/external-store'

export const OPEN_COOKIE_PREFERENCES_EVENT = 'open-cookie-preferences'

type CookieBannerProps = {
  measurementId?: string
}

export function CookieBanner({ measurementId }: CookieBannerProps): React.ReactElement | null {
  // The server (and the first client render) cannot read localStorage, so nothing is shown yet.
  const stored = useSyncExternalStore(
    subscribeNever,
    () => readConsent(),
    () => 'unknown' as const,
  )
  // The choice made during this visit; also covers blocked storage.
  const [choice, setChoice] = useState<ConsentState>(null)
  const [reopened, setReopened] = useState(false)
  const { cookies } = content

  const consent = choice ?? stored
  const hasMeasurement = measurementId !== undefined && measurementId !== ''

  useEffect(() => {
    if (hasMeasurement && consent === 'granted') {
      loadAnalytics(measurementId)
    }
  }, [hasMeasurement, measurementId, consent])

  useEffect(() => {
    const open = () => {
      setReopened(true)
    }
    globalThis.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open)
    return () => {
      globalThis.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open)
    }
  }, [])

  if (!hasMeasurement || !(reopened || consent === null)) {
    return null
  }

  function decide(state: 'granted' | 'denied') {
    writeConsent(state)
    setChoice(state)
    setReopened(false)
  }

  return (
    <section className="cookie-banner" aria-label={cookies.label}>
      <p>{cookies.text}</p>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="button"
          onClick={() => {
            decide('granted')
          }}
        >
          {cookies.accept}
        </button>
        <button
          type="button"
          className="button button--outline"
          onClick={() => {
            decide('denied')
          }}
        >
          {cookies.decline}
        </button>
      </div>
    </section>
  )
}
