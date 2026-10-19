// For `useSyncExternalStore` reads of values that never notify (e.g. localStorage, hydration).
export function subscribeNever(): () => void {
  return () => undefined
}
