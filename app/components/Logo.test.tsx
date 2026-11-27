// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { Logo } from './Logo'
import { SkipLink } from './SkipLink'

test('Logo is an image named after Daiane and her role, built from separately movable parts', () => {
  render(<Logo />)

  const logo = screen.getByRole('img', { name: 'Daiane Fernandes, Nutricionista' })
  expect(Array.from(logo.querySelectorAll('use'), (part) => part.getAttribute('href'))).toEqual([
    '/logo-parts-v2.svg#monogram',
    '/logo-parts-v2.svg#daiane',
    '/logo-parts-v2.svg#fernandes',
    '/logo-parts-v2.svg#subtitle',
  ])
})

test('Logo light variant uses the cream artwork for dark backgrounds', () => {
  render(<Logo variant="light" />)

  expect(screen.getByRole('img')).toHaveAttribute('src', '/logo-light-v2.svg')
})

test('SkipLink targets the main content landmark', () => {
  render(<SkipLink />)

  expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute(
    'href',
    '#conteudo',
  )
})
