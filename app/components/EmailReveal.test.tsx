// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test'

import { solveChallenge } from '~/lib/pow/solve.client'

import { EmailReveal } from './EmailReveal'

vi.mock('~/lib/pow/solve.client', () => ({ solveChallenge: vi.fn<typeof solveChallenge>() }))

const challenge = { salt: 'aa', difficulty: 1, expiresAt: 1, signature: 'sig' }
const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

test('reveals the email as a focused mailto link after the check passes', async () => {
  const user = userEvent.setup()
  fetchMock
    .mockResolvedValueOnce(jsonResponse(challenge))
    .mockResolvedValueOnce(jsonResponse({ email: 'contato@example.com' }))
  vi.mocked(solveChallenge).mockResolvedValue(42)

  const { container } = render(<EmailReveal whatsappFallbackHref="https://wa.me/1" />)
  expect(container.textContent).not.toContain('@')

  await user.click(screen.getByRole('button', { name: 'Ver e-mail' }))

  const link = await screen.findByRole('link', { name: 'contato@example.com' })
  expect(link).toHaveAttribute('href', 'mailto:contato@example.com')
  expect(link).toHaveFocus()
  expect(fetchMock).toHaveBeenLastCalledWith(
    '/api/pow/verify',
    expect.objectContaining({ method: 'POST', body: JSON.stringify({ ...challenge, nonce: 42 }) }),
  )
})

test('shows progress, can be cancelled, and returns to idle', async () => {
  const user = userEvent.setup()
  fetchMock.mockResolvedValueOnce(jsonResponse(challenge))
  let receivedSignal: AbortSignal | undefined
  vi.mocked(solveChallenge).mockImplementation(
    async (_challenge, signal) =>
      new Promise((_resolve, reject) => {
        receivedSignal = signal
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      }),
  )

  render(<EmailReveal whatsappFallbackHref="https://wa.me/1" />)
  await user.click(screen.getByRole('button', { name: 'Ver e-mail' }))

  expect(await screen.findByRole('status')).toHaveTextContent('Verificando')
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(receivedSignal?.aborted).toBe(true)
  expect(await screen.findByRole('button', { name: 'Ver e-mail' })).toBeInTheDocument()
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
})

test('shows an error with retry and a WhatsApp alternative when verification fails', async () => {
  const user = userEvent.setup()
  fetchMock
    .mockResolvedValueOnce(jsonResponse(challenge))
    .mockResolvedValueOnce(jsonResponse({ error: 'x' }, 400))
    .mockResolvedValueOnce(jsonResponse(challenge))
    .mockResolvedValueOnce(jsonResponse({ email: 'contato@example.com' }))
  vi.mocked(solveChallenge).mockResolvedValue(1)

  render(<EmailReveal whatsappFallbackHref="https://wa.me/1" />)
  await user.click(screen.getByRole('button', { name: 'Ver e-mail' }))

  expect(await screen.findByRole('status')).toHaveTextContent('Não foi possível verificar')
  expect(screen.getByRole('link', { name: /WhatsApp/u })).toHaveAttribute('href', 'https://wa.me/1')

  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await waitFor(() =>
    expect(screen.getByRole('link', { name: 'contato@example.com' })).toBeInTheDocument(),
  )
})

test('the button is disabled in server markup so early clicks are never silently lost', async () => {
  expect(renderToString(<EmailReveal whatsappFallbackHref="https://wa.me/1" />)).toMatch(
    /<button[^>]*disabled=""[^>]*>Ver e-mail<\/button>/u,
  )

  render(<EmailReveal whatsappFallbackHref="https://wa.me/1" />)
  expect(await screen.findByRole('button', { name: 'Ver e-mail' })).toBeEnabled()
})

test('keyboard focus stays on the same button across idle, solving, cancel and error', async () => {
  const user = userEvent.setup()
  fetchMock.mockResolvedValueOnce(jsonResponse(challenge))
  vi.mocked(solveChallenge).mockImplementation(
    async (_challenge, signal) =>
      new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      }),
  )

  render(<EmailReveal whatsappFallbackHref="https://wa.me/1" />)
  const button = await screen.findByRole('button', { name: 'Ver e-mail' })
  button.focus()

  await user.keyboard('{Enter}')
  expect(await screen.findByRole('button', { name: 'Cancelar' })).toBe(button)
  expect(button).toHaveFocus()

  await user.keyboard('{Enter}')
  expect(await screen.findByRole('button', { name: 'Ver e-mail' })).toBe(button)
  expect(button).toHaveFocus()
})
