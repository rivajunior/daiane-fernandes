export type SiteConfig = {
  siteUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  powSecret: string;
  gaMeasurementId?: string;
  crn?: string;
};

type Env = Record<string, string | undefined>;

function required(env: Env, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function optional(env: Env, name: string): string | undefined {
  return env[name]?.trim() || undefined;
}

export function getConfig(env: Env): SiteConfig {
  const whatsappNumber = required(env, "WHATSAPP_NUMBER");
  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    throw new Error("WHATSAPP_NUMBER must contain only digits (10-15), country code included");
  }

  return {
    siteUrl: required(env, "SITE_URL").replace(/\/+$/, ""),
    whatsappNumber,
    contactEmail: required(env, "CONTACT_EMAIL"),
    powSecret: required(env, "POW_SECRET"),
    gaMeasurementId: optional(env, "GA_MEASUREMENT_ID"),
    crn: optional(env, "CRN"),
  };
}
