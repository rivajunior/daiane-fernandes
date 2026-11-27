// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { content } from '~/content/site'

import { HelpAreas } from './HelpAreas'

test('all six areas are in the markup with their own drawing, label, title and text', () => {
  const { container } = render(<HelpAreas />)
  const cards = container.querySelectorAll<HTMLElement>('.carousel__card')

  expect(content.help.cards.map((card) => [card.label, card.title])).toEqual([
    ['01 / HÁBITOS', 'Alimentação saudável'],
    ['02 / OBJETIVOS', 'Emagrecimento e composição corporal'],
    ['03 / BEM-ESTAR', 'Saúde e qualidade de vida'],
    ['04 / ROTINA', 'Organização alimentar'],
    ['05 / FLEXIBILIDADE', 'Menos regras, mais equilíbrio'],
    ['06 / CONHECIMENTO', 'Educação alimentar'],
  ])
  expect(new Set(content.help.cards.map((card) => card.art)).size).toBe(6)
  expect(cards).toHaveLength(6)
  for (const [index, card] of content.help.cards.entries()) {
    expect(cards[index]).toHaveTextContent(card.label)
    expect(cards[index]).toHaveTextContent(card.title)
    expect(cards[index]).toHaveTextContent(card.text)
    expect(cards[index]!.querySelector('svg.art')).toHaveAttribute('aria-hidden', 'true')
    expect(cards[index]!.querySelector('svg.art')!.childElementCount).toBeGreaterThan(0)
  }
  expect(container.querySelectorAll('[style], svg text')).toHaveLength(0)
  expect(screen.getByRole('list', { name: 'Como posso ajudar você?' })).toHaveAttribute(
    'tabindex',
    '0',
  )
  expect(screen.getByText(content.help.note)).toBeInTheDocument()
  // The stylesheet names the browser's own dots and arrows from these.
  const row = screen.getByRole('list', { name: 'Como posso ajudar você?' })
  expect(row).toHaveAttribute('data-previous', 'Área anterior')
  expect(row).toHaveAttribute('data-next', 'Próxima área')
  expect(Array.from(cards, (card) => card.dataset.dot)).toEqual(
    [1, 2, 3, 4, 5, 6].map((position) => `Áreas: ir para a posição ${position}`),
  )
})
