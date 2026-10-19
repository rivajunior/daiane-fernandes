import { useEffect, useRef, useState } from "react";

import { content } from "~/content/site";
import { trackEvent } from "~/lib/analytics";
import type { Challenge } from "~/lib/pow/pow.server";
import { solveChallenge } from "~/lib/pow/solve.client";

type EmailRevealProps = {
  whatsappFallbackHref: string;
};

// React does not render <noscript> children on the server, so the fallback is injected as raw HTML.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type State =
  | { status: "idle" }
  | { status: "solving" }
  | { status: "revealed"; email: string }
  | { status: "error" };

export function EmailReveal({ whatsappFallbackHref }: EmailRevealProps) {
  const [state, setState] = useState<State>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const { footer } = content;

  useEffect(() => {
    if (state.status === "revealed") linkRef.current?.focus();
  }, [state.status]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function reveal() {
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: "solving" });

    try {
      const challengeResponse = await fetch("/api/pow/challenge", { signal: controller.signal });
      const challenge = (await challengeResponse.json()) as Challenge;
      const nonce = await solveChallenge(challenge, controller.signal);
      const verifyResponse = await fetch("/api/pow/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...challenge, nonce }),
        signal: controller.signal,
      });
      if (!verifyResponse.ok) throw new Error("verification failed");

      const { email } = (await verifyResponse.json()) as { email: string };
      setState({ status: "revealed", email });
      trackEvent("email_reveal");
    } catch {
      if (controller.signal.aborted) {
        setState({ status: "idle" });
        return;
      }
      setState({ status: "error" });
    }
  }

  function cancel() {
    controllerRef.current?.abort();
  }

  return (
    <div className="email-reveal">
      {state.status === "revealed" ? (
        <a ref={linkRef} href={`mailto:${state.email}`}>
          {state.email}
        </a>
      ) : null}
      {state.status === "idle" || state.status === "error" ? (
        <button type="button" className="button button--outline" onClick={reveal}>
          {state.status === "error" ? footer.emailRetry : footer.emailLabel}
        </button>
      ) : null}
      {state.status === "solving" ? (
        <button type="button" className="button button--outline" onClick={cancel}>
          {footer.emailCancel}
        </button>
      ) : null}
      <p role="status">
        {state.status === "solving" ? footer.emailVerifying : null}
        {state.status === "error" ? footer.emailError : null}
      </p>
      {state.status === "error" ? (
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
  );
}
