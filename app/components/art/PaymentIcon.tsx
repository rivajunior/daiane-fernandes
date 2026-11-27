export type PaymentIconName = 'pix' | 'card' | 'bank'

// Generic shapes on purpose: no payment brand's logo.
const ICONS: Record<PaymentIconName, React.ReactElement> = {
  pix: <path d="M28 2l22 22-22 22L6 24z" />,
  card: (
    <>
      <rect x="2" y="7" width="52" height="34" rx="5" />
      <path d="M2 18h52M10 31h14" />
    </>
  ),
  bank: <path d="M2 20L28 2l26 18zM8 24v18M28 24v18M48 24v18M2 46h52" />,
}

export function PaymentIcon({ name }: { name: PaymentIconName }): React.ReactElement {
  return (
    <svg className="art" viewBox="0 0 56 48" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  )
}
