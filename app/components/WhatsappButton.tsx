import { createContext, use, type ReactNode } from 'react'

import { trackEvent } from '~/lib/analytics'

export const WhatsappUrlContext = createContext('')

type WhatsappButtonProps = {
  section: string
  children: ReactNode
}

export function WhatsappButton({ section, children }: WhatsappButtonProps): React.ReactElement {
  const href = use(WhatsappUrlContext)

  return (
    <a
      className="button"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-section={section}
      onClick={() => {
        trackEvent('whatsapp_click', { section })
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.200Zm4.500-6.100c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100-1.500-.7-2.400-1.300-3.400-2.900-.3-.4.300-.4.800-1.300.1-.200 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.100-.7.300-.8.800-1 1.700-.7 2.700.3 1 1.200 2.400 2.700 3.800 2.400 2.100 4 2.500 5 2.300.6-.1 1.800-.8 2-1.500.3-.7.300-1.300.2-1.400-.1-.2-.3-.2-.5-.3Z"
        />
      </svg>
      <span>{children}</span>
    </a>
  )
}
