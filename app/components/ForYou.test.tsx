// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { content } from '~/content/site'

import { ForYou } from './ForYou'

test('all five situations are in the markup with art, short title and full text', () => {
  const { container } = render(<ForYou />)
  const cards = container.querySelectorAll('.carousel__card')

  expect(content.forYou.cards.map((card) => card.title)).toEqual([
    'Cada refeição é uma batalha',
    'Anos de dietas sem resultado',
    'Culpa na hora de comer',
    'Hábitos que não se mantêm',
    'Um sofrimento que se acumula',
  ])
  expect(cards).toHaveLength(5)
  for (const [index, card] of content.forYou.cards.entries()) {
    expect(cards[index]).toHaveTextContent(card.title)
    expect(cards[index]).toHaveTextContent(card.text)
    expect(cards[index]!.querySelector('svg.art')).toHaveAttribute('aria-hidden', 'true')
  }
  expect(container.querySelectorAll('[style], svg text')).toHaveLength(0)
  expect(screen.getByRole('list', { name: 'Quero ajudar você que vive' })).toHaveAttribute(
    'tabindex',
    '0',
  )
  expect(screen.getByText(content.forYou.note)).toBeInTheDocument()
})
