declare global {
  // `var` is the only way to type a property of `globalThis`.
  // oxlint-disable-next-line no-var
  var dataLayer: unknown[] | undefined
  // oxlint-disable-next-line no-var
  var gtag: ((...args: unknown[]) => void) | undefined
}

let loaded = false

function gtag(): void {
  // gtag.js expects the raw `arguments` object in the data layer.
  // eslint-disable-next-line prefer-rest-params
  globalThis.dataLayer?.push(arguments)
}

export function loadAnalytics(measurementId: string): void {
  if (loaded) {
    return
  }
  loaded = true

  globalThis.dataLayer ??= []
  globalThis.gtag = gtag
  globalThis.gtag('js', new Date())
  globalThis.gtag('config', measurementId, { anonymize_ip: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}

export function trackEvent(name: string, params?: Record<string, string>): void {
  if (!loaded) {
    return
  }
  globalThis.gtag?.('event', name, params)
}
