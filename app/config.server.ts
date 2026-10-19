export type SiteConfig = {
  siteUrl: string
  whatsappNumber: string
  contactEmail: string
  powSecret: string
  gaMeasurementId?: string
  crn?: string
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

export type PublicConfig = Pick<
  SiteConfig,
  'siteUrl' | 'whatsappNumber' | 'gaMeasurementId' | 'crn' | 'indexable'
>

export function getPublicConfig(env: Env): PublicConfig {
  const whatsappNumber = required(env, 'WHATSAPP_NUMBER')
  if (!/^\d{10,15}$/u.test(whatsappNumber)) {
    throw new Error('WHATSAPP_NUMBER must contain only digits (10-15), country code included')
  }

  return {
    siteUrl: required(env, 'SITE_URL').replace(/\/+$/u, ''),
    whatsappNumber,
    gaMeasurementId: optional(env, 'GA_MEASUREMENT_ID'),
    crn: optional(env, 'CRN'),
    indexable: env.ALLOW_INDEXING?.trim() === 'true',
  }
}

export function getConfig(env: Env): SiteConfig {
  return {
    ...getPublicConfig(env),
    contactEmail: required(env, 'CONTACT_EMAIL'),
    powSecret: required(env, 'POW_SECRET'),
  }
}
