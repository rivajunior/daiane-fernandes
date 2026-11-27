// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { content } from '~/content/site'

import { About, Approach, ClosingCta, Faq, Hero, HowItWorks, Online } from './sections'
import { WhatsappUrlContext } from './WhatsappButton'

// A link only has the link role with an address, which the page provides through context.
function renderSection(section: React.ReactElement) {
  return render(
    <WhatsappUrlContext value="https://wa.me/5585900000000">{section}</WhatsappUrlContext>,
  )
}

test('hero button scrolls to the closing section', () => {
  renderSection(<Hero />)

  expect(screen.getByRole('link', { name: 'Quero cuidar da minha alimentação' })).toHaveAttribute(
    'href',
    '#contato',
  )
  expect(screen.getByText('Nutrição online • cuidado individualizado')).toBeInTheDocument()
  expect(
    screen.getByText('Orientações que respeitam sua rotina e suas escolhas.'),
  ).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Daiane Fernandes, nutricionista' })).toBeInTheDocument()
})

test('about shows her new photo with a caption, three paragraphs and a link to the process', () => {
  const { container } = renderSection(<About />)
  const photo = screen.getByRole('img', {
    name: 'Daiane Fernandes sorrindo, sentada em um ambiente claro e acolhedor',
  })

  expect(photo).toHaveAttribute('loading', 'lazy')
  expect(photo).toHaveAttribute('width', '640')
  expect(photo).toHaveAttribute('height', '700')
  expect(container.querySelector('figcaption')).toHaveTextContent('Ciência•Escuta•Equilíbrio')
  expect(container.querySelectorAll('.about__copy p:not(.eyebrow)')).toHaveLength(3)
  for (const paragraph of content.about.paragraphs) {
    expect(screen.getByText(paragraph)).toBeInTheDocument()
  }
  expect(screen.getByRole('link', { name: 'Conheça meu acompanhamento' })).toHaveAttribute(
    'href',
    '#processo',
  )
})

test('approach offers her four values, one open at a time', () => {
  const { container } = renderSection(<Approach />)
  const values = container.querySelectorAll('details[name="approach"]')

  expect(content.approach.items.map((item) => item.label)).toEqual([
    'Individualidade',
    'Ciência',
    'Flexibilidade',
    'Autonomia',
  ])
  expect(values).toHaveLength(4)
  for (const [index, item] of content.approach.items.entries()) {
    expect(values[index]!.querySelector('summary')).toHaveTextContent(item.label)
    expect(values[index]).toHaveTextContent(item.text)
  }
})

test('each step keeps its text and shows a plant with one more leaf', () => {
  const { container } = renderSection(<HowItWorks />)
  const steps = container.querySelectorAll('.steps li')

  expect(Array.from(steps, (step) => step.querySelector('h3')?.textContent)).toEqual([
    'Primeira consulta',
    'Planejamento alimentar',
    'Acompanhamento',
  ])
  expect(Array.from(steps, (step) => step.querySelectorAll('.art__leaf').length)).toEqual([1, 2, 3])
  for (const [index, step] of content.howItWorks.steps.entries()) {
    expect(steps[index]).toHaveTextContent(step.text)
  }
  expect(container.querySelectorAll('.art__stem[pathLength="1"]')).toHaveLength(3)
  expect(screen.getByRole('link', { name: 'Agendar primeira consulta' })).toBeInTheDocument()
  expect(container.querySelectorAll('[style], svg text')).toHaveLength(0)
})

test('online care is illustrated by a decorative video call with a growing plant', () => {
  const { container } = renderSection(<Online />)
  const art = container.querySelector('.online__art svg.online-call')!

  expect(art).toHaveAttribute('aria-hidden', 'true')
  expect(art).toHaveAttribute('viewBox', '0 0 220 138')
  expect(art.querySelectorAll('.art__stem[pathLength="1"]')).toHaveLength(3)
  expect(art.querySelectorAll('.art__leaf')).toHaveLength(4)
  for (const paragraph of content.online.paragraphs) {
    expect(screen.getByText(paragraph)).toBeInTheDocument()
  }
  expect(screen.getByRole('link', { name: 'Saiba como agendar' })).toHaveAttribute(
    'data-section',
    'online',
  )
  expect(container.querySelectorAll('[style], svg text, img')).toHaveLength(0)
})

test('the five questions start closed and keep their answers in the page', () => {
  const { container } = renderSection(<Faq />)
  const questions = container.querySelectorAll<HTMLDetailsElement>('details[name="faq"]')

  expect(content.faq.items.map((item) => item.question)).toEqual([
    'Você passa dieta?',
    'Preciso querer emagrecer para consultar?',
    'Vou precisar deixar de comer o que gosto?',
    'Como funcionam os retornos?',
    'Como funciona o pagamento?',
  ])
  expect(questions).toHaveLength(5)
  for (const [index, item] of content.faq.items.entries()) {
    expect(questions[index]!.open).toBe(false)
    expect(questions[index]!.querySelector('summary')).toHaveTextContent(item.question)
    expect(questions[index]).toHaveTextContent(item.answer)
  }
  expect(content.faq.items[4].answer).toContain('antecipar 50% do valor da consulta')
})

test('closing shows two stems, the booking button and the line under it', () => {
  const { container } = renderSection(<ClosingCta />)

  expect(container.querySelector('section')).toHaveAttribute('id', 'contato')
  expect(container.querySelectorAll('.stems .art__stem[pathLength="1"]')).toHaveLength(2)
  expect(screen.getByRole('link', { name: 'Agendar pelo WhatsApp' })).toHaveAttribute(
    'data-section',
    'closing',
  )
  expect(screen.getByText('Atendimento online • Agendamento pelo WhatsApp')).toBeInTheDocument()
  expect(container.querySelectorAll('[style], svg text')).toHaveLength(0)
})
