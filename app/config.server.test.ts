import { expect, test } from "vite-plus/test";

import { getConfig, getPublicConfig } from "./config.server";

const validEnv = {
  SITE_URL: "https://example.com.br/",
  WHATSAPP_NUMBER: "5585900000000",
  CONTACT_EMAIL: "contato@example.com",
  POW_SECRET: "secret",
};

test("getConfig normalizes valid env and leaves optional values undefined", () => {
  const config = getConfig({ ...validEnv, GA_MEASUREMENT_ID: "", CRN: "" });

  expect(config).toEqual({
    siteUrl: "https://example.com.br",
    whatsappNumber: "5585900000000",
    contactEmail: "contato@example.com",
    powSecret: "secret",
    gaMeasurementId: undefined,
    crn: undefined,
    indexable: false,
  });
});

test("getConfig fails fast naming the offending variable", () => {
  for (const badNumber of ["+55 85 9", "abc", ""]) {
    expect(() => getConfig({ ...validEnv, WHATSAPP_NUMBER: badNumber })).toThrow(/WHATSAPP_NUMBER/);
  }
  expect(() => getConfig({ ...validEnv, POW_SECRET: undefined })).toThrow(/POW_SECRET/);
  expect(() => getConfig({ ...validEnv, CONTACT_EMAIL: undefined })).toThrow(/CONTACT_EMAIL/);
  expect(() => getConfig({ ...validEnv, SITE_URL: undefined })).toThrow(/SITE_URL/);
});

test("getPublicConfig needs no secrets and exposes only page-safe values", () => {
  const config = getPublicConfig({
    SITE_URL: "https://example.com.br/",
    WHATSAPP_NUMBER: "5585900000000",
    CRN: "CRN-6 1",
    POW_SECRET: "must-not-leak",
    CONTACT_EMAIL: "must-not-leak@example.com",
  });

  expect(config).toEqual({
    siteUrl: "https://example.com.br",
    whatsappNumber: "5585900000000",
    gaMeasurementId: undefined,
    crn: "CRN-6 1",
    indexable: false,
  });
  expect(
    getPublicConfig({
      SITE_URL: "https://x.com",
      WHATSAPP_NUMBER: "5585900000000",
      ALLOW_INDEXING: "true",
    }).indexable,
  ).toBe(true);
  expect(() => getPublicConfig({ SITE_URL: "https://x.com", WHATSAPP_NUMBER: "abc" })).toThrow(
    /WHATSAPP_NUMBER/,
  );
});
