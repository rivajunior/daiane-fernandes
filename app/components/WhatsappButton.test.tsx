// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vite-plus/test'

import { WhatsappButton, WhatsappUrlContext } from './WhatsappButton'

vi.mock('~/lib/analytics', () => ({
  trackEvent: vi.fn<(name: string) => void>(),
  loadAnalytics: vi.fn<(measurementId: string) => void>(),
}))

test('WhatsappButton links to the provided url safely and records its section', () => {
  render(
    <WhatsappUrlContext value="https://wa.me/5585900000000?text=Ol%C3%A1">
      <WhatsappButton section="hero">Começar meu acompanhamento</WhatsappButton>
    </WhatsappUrlContext>,
  )

  const link = screen.getByRole('link', { name: /Começar meu acompanhamento/u })
  expect(link).toHaveAttribute('href', 'https://wa.me/5585900000000?text=Ol%C3%A1')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  expect(link).toHaveAttribute('data-section', 'hero')
})

test('clicking WhatsappButton records a whatsapp_click event with its section', async () => {
  const { trackEvent } = await import('~/lib/analytics')
  const user = userEvent.setup()
  render(
    <WhatsappUrlContext value="https://wa.me/5585900000000">
      <WhatsappButton section="closing">Marcar minha consulta</WhatsappButton>
    </WhatsappUrlContext>,
  )

  await user.click(screen.getByRole('link', { name: /Marcar minha consulta/u }))

  expect(trackEvent).toHaveBeenCalledWith('whatsapp_click', { section: 'closing' })
})
