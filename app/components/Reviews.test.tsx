// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { Reviews } from './Reviews'

test('the five reviews are quoted word for word with name, date and rating', () => {
  const { container } = render(<Reviews />)
  const cards = container.querySelectorAll<HTMLElement>('.carousel__card')

  expect(
    Array.from(cards, (card) => [
      card.querySelector('blockquote')?.textContent,
      card.querySelector('strong')?.textContent,
      card.querySelector('time')?.textContent,
    ]),
  ).toEqual([
    ['Muito atenciosa e tem clareza nas falas', 'Renata', '16 de outubro de 2026'],
    ['Uma ótima profissional, atenciosa, delicada. Amei ela', 'Emilly', '31 de agosto de 2026'],
    [
      'Amei a consulta com a Dai. A profissional tem uma excelente escuta ativa e proposição de acompanhamento e estratégia alimentar humanizada. Super recomendo!',
      'Gabriela',
      '12 de agosto de 2026',
    ],
    ['Super atenciosa, tira todas as suas dúvidas eu gostei', 'Claudeni', '18 de julho de 2026'],
    ['Uma excelente profissional', 'Karlla', '3 de julho de 2026'],
  ])
  for (const card of cards) {
    expect(card).toHaveTextContent('Avaliação: 5 de 5 estrelas')
    expect(card.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  }
  expect(screen.getByRole('list', { name: 'O que dizem as pessoas atendidas.' })).toHaveAttribute(
    'tabindex',
    '0',
  )
  const row = screen.getByRole('list', { name: 'O que dizem as pessoas atendidas.' })
  expect(row).toHaveAttribute('data-previous', 'Avaliação anterior')
  expect(row).toHaveAttribute('data-next', 'Próxima avaliação')
  expect(Array.from(cards, (card) => card.dataset.dot)).toEqual(
    [1, 2, 3, 4, 5].map((position) => `Avaliações: ir para a posição ${position}`),
  )
  expect(
    screen.getByText(
      'Cada acompanhamento é individual: a experiência e os resultados podem variar de pessoa para pessoa.',
    ),
  ).toBeInTheDocument()
  expect(container.querySelectorAll('[style], svg text')).toHaveLength(0)
})
