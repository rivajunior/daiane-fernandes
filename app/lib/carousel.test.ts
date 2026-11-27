import { expect, test } from 'vite-plus/test'

import { nearestPoint, snapPoints } from './carousel'

test('positions that cannot be reached collapse into the last one', () => {
  expect(snapPoints([0, 100, 200, 300, 400], 220)).toEqual([0, 100, 200, 220])
  expect(snapPoints([0, 100], 0)).toEqual([0])
})

test('the nearest position wins', () => {
  expect(nearestPoint([0, 100, 200], 149)).toBe(1)
  expect(nearestPoint([0, 100, 200], 151)).toBe(2)
  expect(nearestPoint([], 40)).toBe(0)
})
