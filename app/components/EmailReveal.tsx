import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { content } from '~/content/site'
import { trackEvent } from '~/lib/analytics'
import { subscribeNever } from '~/lib/external-store'
import type { Challenge } from '~/lib/pow/pow.server'
import { solveChallenge } from '~/lib/pow/solve.client'

function isChallenge(value: unknown): value is Challenge {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const field = (key: string): unknown => Reflect.get(value, key)
  return (
    typeof field('salt') === 'string' &&
    typeof field('signature') === 'string' &&
    typeof field('difficulty') === 'number' &&
    typeof field('expiresAt') === 'number'
  )
}

function readEmail(value: unknown): string {
  const email: unknown =
    typeof value === 'object' && value !== null ? Reflect.get(value, 'email') : undefined
  if (typeof email !== 'string') {
    throw new TypeError('invalid verification response')
  }
  return email
}

type EmailRevealProps = {
  whatsappFallbackHref: string
}

// React does not render <noscript> children on the server, so the fallback is injected as raw HTML.
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

type State =
  | { status: 'idle' }
  | { status: 'solving' }
  | { status: 'revealed'; email: string }
  | { status: 'error' }

export function EmailReveal({ whatsappFallbackHref }: EmailRevealProps): React.ReactElement {
  const [state, setState] = useState<State>({ status: 'idle' })
  const controllerRef = useRef<AbortController | null>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const { footer } = content

  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )

  useEffect(() => {
    if (state.status === 'revealed') {
      linkRef.current?.focus()
    }
  }, [state.status])

  useEffect(() => () => controllerRef.current?.abort(), [])

  async function reveal() {
    const controller = new AbortController()
    controllerRef.current = controller
    setState({ status: 'solving' })

    try {
      const challengeResponse = await fetch('/api/pow/challenge', { signal: controller.signal })
      const challenge: unknown = await challengeResponse.json()
      if (!isChallenge(challenge)) {
        throw new TypeError('invalid challenge response')
      }
      const nonce = await solveChallenge(challenge, controller.signal)
      const verifyResponse = await fetch('/api/pow/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...challenge, nonce }),
        signal: controller.signal,
      })
      if (!verifyResponse.ok) {
        throw new Error('verification failed')
      }

      const email = readEmail(await verifyResponse.json())
      setState({ status: 'revealed', email })
      trackEvent('email_reveal')
    } catch {
      if (controller.signal.aborted) {
        setState({ status: 'idle' })
        return
      }
      setState({ status: 'error' })
    }
  }

  function cancel() {
    controllerRef.current?.abort()
  }

  return (
    <div className="email-reveal">
      {state.status === 'revealed' ? (
        <a ref={linkRef} href={`mailto:${state.email}`}>
          {state.email}
        </a>
      ) : null}
      {state.status === 'revealed' ? null : (
        <button
          type="button"
          className="button button--outline"
          disabled={!hydrated}
          onClick={state.status === 'solving' ? cancel : reveal}
        >
          {state.status === 'solving'
            ? footer.emailCancel
            : state.status === 'error'
              ? footer.emailRetry
              : footer.emailLabel}
        </button>
      )}
      <output>
        {state.status === 'solving' ? footer.emailVerifying : null}
        {state.status === 'error' ? footer.emailError : null}
      </output>
      {state.status === 'error' ? (
        <a href={whatsappFallbackHref} target="_blank" rel="noopener noreferrer">
          {footer.emailWhatsapp}
        </a>
      ) : null}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<p>${escapeHtml(footer.emailNoScript)}</p><a href="${escapeHtml(whatsappFallbackHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(footer.emailWhatsapp)}</a>`,
        }}
      />
    </div>
  )
}
