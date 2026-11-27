// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { content } from '~/content/site'

import { About, Approach, ClosingCta, Faq, HowItWorks, Payments } from './sections'
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

test('each step keeps its text and shows a plant with one more leaf', () => {
  const { container } = renderSection(<HowItWorks />)
  const steps = container.querySelectorAll('.steps li')

  expect(Array.from(steps, (step) => step.querySelectorAll('.art__leaf').length)).toEqual([1, 2, 3])
  for (const [index, step] of content.howItWorks.steps.entries()) {
    expect(steps[index]).toHaveTextContent(step.text)
  }
  expect(container.querySelectorAll('.art__stem[pathLength="1"]')).toHaveLength(3)
  expect(container.querySelectorAll('[style], svg text')).toHaveLength(0)
})

test('payment shows three methods with icons and the booking rule', () => {
  const { container } = renderSection(<Payments />)
  const methods = container.querySelectorAll('.methods li')

  expect(screen.getByRole('heading', { level: 2, name: 'Formas de pagamento' })).toBeVisible()
  expect(Array.from(methods, (method) => method.textContent)).toEqual([
    'PIX',
    'Cartão de crédito',
    'Transferência bancária',
  ])
  for (const method of methods) {
    expect(method.querySelector('svg.art')).not.toBeNull()
  }
  expect(
    screen.getByText('50% para reservar seu horário, o restante antes da consulta.'),
  ).toBeInTheDocument()
  expect(content.payments).not.toHaveProperty('text')
})

test('the diet question answers in one line and keeps the full text behind a closed disclosure', () => {
  const { container } = renderSection(<Faq />)
  const more = container.querySelector('details')!

  expect(screen.getByText('Sim! E vamos além do plano.')).toBeInTheDocument()
  expect(more.open).toBe(false)
  expect(more.querySelector('summary')).toHaveTextContent('Ler mais')
  for (const paragraph of content.faq.answer) {
    expect(more).toHaveTextContent(paragraph)
  }
})

test('closing shows two stems', () => {
  const { container } = renderSection(<ClosingCta />)

  expect(container.querySelectorAll('.stems .art__stem[pathLength="1"]')).toHaveLength(2)
  expect(container.querySelectorAll('[style], svg text')).toHaveLength(0)
})
