// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { content } from '~/content/site'

import { About, Approach } from './sections'
import { WhatsappUrlContext } from './WhatsappButton'

// A link only has the link role with an address, which the page provides through context.
function renderSection(section: React.ReactElement) {
  return render(
    <WhatsappUrlContext value="https://wa.me/5585900000000">{section}</WhatsappUrlContext>,
  )
}

test('about shows a visible heading, three credential tags and one line', () => {
  renderSection(<About />)

  expect(screen.getByRole('heading', { level: 2, name: 'Sobre Daiane' })).not.toHaveClass(
    'visually-hidden',
  )
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    'Bacharel em Nutrição',
    'Formação em Nutrição Comportamental',
    'Extensionista no CETRATA-ATA',
  ])
  expect(
    screen.getByText(
      'Cuidado de pacientes com transtornos alimentares, com acolhimento e ciência.',
    ),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Marcar uma conversa' })).toBeInTheDocument()
  expect(content.about).not.toHaveProperty('text')
})

test('approach offers four questions that share one open state', () => {
  const { container } = renderSection(<Approach />)
  const questions = container.querySelectorAll('details[name="approach"]')

  expect(content.approach.items.map((item) => item.label)).toEqual([
    'Por que você come',
    'Como você come',
    'O que você sente',
    'O que influencia',
  ])
  expect(questions).toHaveLength(4)
  for (const [index, item] of content.approach.items.entries()) {
    expect(questions[index]!.querySelector('summary')).toHaveTextContent(item.label)
    expect(questions[index]).toHaveTextContent(item.text)
  }
  expect(screen.getByText('Não olhamos apenas para o que você come.')).toBeInTheDocument()
  expect(screen.queryByText('O que investigamos juntos')).not.toBeInTheDocument()
})
