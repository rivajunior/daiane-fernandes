export type ConsentState = "granted" | "denied" | null;

const STORAGE_KEY = "cookie-consent";

function defaultStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readConsent(storage: Storage | undefined = defaultStorage()): ConsentState {
  try {
    const value = storage?.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(
  state: "granted" | "denied",
  storage: Storage | undefined = defaultStorage(),
): void {
  try {
    storage?.setItem(STORAGE_KEY, state);
  } catch {
    // Storage can be blocked (private mode); the choice then lasts for this visit only.
  }
}
