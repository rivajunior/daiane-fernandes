import { useEffect, useState } from "react";

import { content } from "~/content/site";
import { loadAnalytics } from "~/lib/analytics";
import { readConsent, writeConsent } from "~/lib/consent";

export const OPEN_COOKIE_PREFERENCES_EVENT = "open-cookie-preferences";

type CookieBannerProps = {
  measurementId?: string;
};

export function CookieBanner({ measurementId }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);
  const { cookies } = content;

  useEffect(() => {
    if (!measurementId) return;

    const consent = readConsent();
    if (consent === "granted") loadAnalytics(measurementId);
    if (consent === null) setVisible(true);

    const open = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
  }, [measurementId]);

  if (!measurementId || !visible) return null;

  function accept() {
    writeConsent("granted");
    loadAnalytics(measurementId as string);
    setVisible(false);
  }

  function decline() {
    writeConsent("denied");
    setVisible(false);
  }

  return (
    <section className="cookie-banner" role="region" aria-label={cookies.label}>
      <p>{cookies.text}</p>
      <div className="cookie-banner__actions">
        <button type="button" className="button" onClick={accept}>
          {cookies.accept}
        </button>
        <button type="button" className="button button--outline" onClick={decline}>
          {cookies.decline}
        </button>
      </div>
    </section>
  );
}
