export type SiteConfig = {
  siteUrl: string
  whatsappNumber: string
  webAnalyticsToken?: string
  crn: string
  indexable: boolean
}

// The settings the site reads. Naming them lets the Worker's typed `env` be passed in as it is.
export type SiteVars = {
  SITE_URL?: string
  WHATSAPP_NUMBER?: string
  CF_WEB_ANALYTICS_TOKEN?: string
  CRN?: string
  ALLOW_INDEXING?: string
}

function required(env: SiteVars, name: keyof SiteVars): string {
  const value = env[name]?.trim()
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable ${name}`)
  }
  return value
}

function optional(env: SiteVars, name: keyof SiteVars): string | undefined {
  const value = env[name]?.trim()
  return value === '' ? undefined : value
}

export function getConfig(env: SiteVars): SiteConfig {
  const whatsappNumber = required(env, 'WHATSAPP_NUMBER')
  if (!/^\d{10,15}$/u.test(whatsappNumber)) {
    throw new Error('WHATSAPP_NUMBER must contain only digits (10-15), country code included')
  }

  return {
    siteUrl: required(env, 'SITE_URL').replace(/\/+$/u, ''),
    whatsappNumber,
    webAnalyticsToken: optional(env, 'CF_WEB_ANALYTICS_TOKEN'),
    // The ethics code requires nutritionists to show their registration number.
    crn: required(env, 'CRN'),
    indexable: env.ALLOW_INDEXING?.trim() === 'true',
  }
}
