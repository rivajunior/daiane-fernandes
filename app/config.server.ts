export type SiteConfig = {
  siteUrl: string
  whatsappNumber: string
  gaMeasurementId?: string
  crn: string
  indexable: boolean
}

type Env = Record<string, string | undefined>

function required(env: Env, name: string): string {
  const value = env[name]?.trim()
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable ${name}`)
  }
  return value
}

function optional(env: Env, name: string): string | undefined {
  const value = env[name]?.trim()
  return value === '' ? undefined : value
}

export function getConfig(env: Env): SiteConfig {
  const whatsappNumber = required(env, 'WHATSAPP_NUMBER')
  if (!/^\d{10,15}$/u.test(whatsappNumber)) {
    throw new Error('WHATSAPP_NUMBER must contain only digits (10-15), country code included')
  }

  return {
    siteUrl: required(env, 'SITE_URL').replace(/\/+$/u, ''),
    whatsappNumber,
    gaMeasurementId: optional(env, 'GA_MEASUREMENT_ID'),
    // The ethics code requires nutritionists to show their registration number.
    crn: required(env, 'CRN'),
    indexable: env.ALLOW_INDEXING?.trim() === 'true',
  }
}
