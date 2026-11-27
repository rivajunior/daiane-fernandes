// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { HomePage } from './HomePage'

const whatsappUrl = 'https://wa.me/5585900000000?text=Ol%C3%A1'
const props = { whatsappUrl, year: 2026, crn: 'CRN-11 20771' }

test('home page has one h1 and the sections in her order', () => {
  const { container } = render(<HomePage {...props} />)

  expect(container.querySelectorAll('h1')).toHaveLength(1)
  expect(container.querySelector('h1')).toHaveTextContent(
    'Comer bem pode ser mais simples do que parece.',
  )
  expect(Array.from(container.querySelectorAll('h2'), (heading) => heading.textContent)).toEqual([
    'Sou Daiane Fernandes, nutricionista.',
    'Como posso ajudar você?',
    'Uma nutrição que se adapta à sua vida.',
    'Como funciona o acompanhamento?',
    'Cuide da sua alimentação de onde estiver.',
    'O que dizem as pessoas atendidas.',
    'Talvez você queira saber…',
    'Vamos encontrar um jeito de comer melhor que faça sentido para você?',
  ])
  expect(container.querySelector('main#conteudo')).not.toBeNull()
})

test('every WhatsApp link says where on the page it is', () => {
  const { container } = render(<HomePage {...props} />)
  const links = container.querySelectorAll<HTMLElement>('a[href^="https://wa.me/"]')

  expect(Array.from(links, (link) => link.dataset.section)).toEqual([
    'header',
    'how-it-works',
    'online',
    'closing',
    'footer',
    'mobile-bar',
  ])
})

test('the menu and in-page links all lead to a section', () => {
  const { container } = render(<HomePage {...props} />)
  const menu = screen.getByRole('navigation', { name: 'Menu principal' })

  expect(
    within(menu)
      .getAllByRole('link')
      .map((link) => [link.textContent, link.getAttribute('href')]),
  ).toEqual([
    ['Sobre mim', '#sobre'],
    ['Como posso ajudar', '#atendimento'],
    ['Acompanhamento', '#processo'],
    ['Avaliações', '#avaliacoes'],
    ['Dúvidas', '#duvidas'],
  ])
  for (const link of container.querySelectorAll('a[href^="#"]')) {
    expect(container.querySelector(link.getAttribute('href')!)).not.toBeNull()
  }
})

test('the only contact text is the Instagram handle, and the old title is gone', () => {
  const { container } = render(<HomePage {...props} />)
  const text = container.textContent

  expect(text).not.toContain('5585900000000')
  expect(text.match(/@/gu)).toHaveLength(1)
  expect(text).toContain('@daianefernandes.nutri')
  expect(text).not.toMatch(/Comportamental/iu)
})

test('footer shows her registration, services, AI notice and the year from the loader', () => {
  render(<HomePage {...props} year={2031} />)
  const footer = within(screen.getByRole('contentinfo'))

  expect(footer.getByText('Nutricionista • CRN-11 20771')).toBeInTheDocument()
  expect(footer.getByText('Atendimento nutricional online')).toBeInTheDocument()
  expect(
    footer.getByText(
      '© 2031 Daiane Fernandes • Nutricionista CRN-11 20771. Todos os direitos reservados.',
    ),
  ).toBeInTheDocument()
  expect(
    footer.getByText('Site produzido com apoio de inteligência artificial.'),
  ).toBeInTheDocument()
  expect(footer.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', whatsappUrl)
  const instagram = footer.getByRole('link', {
    name: 'Instagram @daianefernandes.nutri (abre em nova aba)',
  })
  expect(instagram).toHaveAttribute('href', 'https://instagram.com/daianefernandes.nutri')
  expect(instagram).toHaveAttribute('target', '_blank')
  expect(instagram).toHaveAttribute('rel', 'noopener noreferrer')
})

test('the Cloudflare Web Analytics script is added only when there is a token', () => {
  const selector = 'script[src="https://static.cloudflareinsights.com/beacon.min.js"]'
  const without = render(<HomePage {...props} />)
  expect(without.container.querySelector(selector)).toBeNull()
  without.unmount()

  const { container } = render(<HomePage {...props} webAnalyticsToken="abc123" />)
  const beacon = container.querySelector(selector)
  expect(beacon).toHaveAttribute('type', 'module')
  expect(beacon).toHaveAttribute('data-cf-beacon', '{"token":"abc123"}')
  expect(screen.queryByRole('button', { name: /cookies/iu })).toBeNull()
})
