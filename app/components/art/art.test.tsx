// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'

import { Leaves } from './Leaves'

test.each([
  ['hero', 4],
  ['about', 2],
  ['faq', 2],
] as const)('%s leaves are decorative and styled without inline styles', (scene, count) => {
  const { container } = render(<Leaves scene={scene} />)

  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  expect(container.querySelectorAll('.leaves__leaf')).toHaveLength(count)
  expect(container.querySelectorAll('[style], text')).toHaveLength(0)
  expect(container.querySelectorAll('svg')).toHaveLength(count)
  for (const svg of container.querySelectorAll('svg')) {
    expect(svg).toHaveAttribute('focusable', 'false')
  }
})
