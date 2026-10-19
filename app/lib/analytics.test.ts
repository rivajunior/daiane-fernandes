// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  document.head.innerHTML = "";
  delete (window as any).dataLayer;
  delete (window as any).gtag;
});

test("trackEvent does nothing until analytics is loaded", async () => {
  const { trackEvent } = await import("./analytics");

  expect(() => trackEvent("whatsapp_click", { section: "hero" })).not.toThrow();
  expect((window as any).dataLayer).toBeUndefined();
});

test("loadAnalytics injects the gtag script once and then events are forwarded", async () => {
  const { loadAnalytics, trackEvent } = await import("./analytics");

  loadAnalytics("G-TEST123");
  loadAnalytics("G-TEST123");

  const scripts = document.head.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
  expect(scripts).toHaveLength(1);
  expect(scripts[0]).toHaveAttribute("src", "https://www.googletagmanager.com/gtag/js?id=G-TEST123");

  trackEvent("whatsapp_click", { section: "hero" });
  const entries = (window as any).dataLayer.map((entry: IArguments) => Array.from(entry));
  expect(entries).toContainEqual(["config", "G-TEST123", { anonymize_ip: true }]);
  expect(entries).toContainEqual(["event", "whatsapp_click", { section: "hero" }]);
});
