import { expect, test } from 'vite-plus/test'

import { readConsent, writeConsent } from './consent'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    clear: () => {
      data.clear()
    },
    key: () => null,
    length: 0,
  }
}

const throwingStorage = {
  getItem() {
    throw new Error('blocked')
  },
  setItem() {
    throw new Error('blocked')
  },
} as unknown as Storage

test('consent round-trips and ignores unknown stored values', () => {
  const storage = memoryStorage()
  expect(readConsent(storage)).toBeNull()

  writeConsent('granted', storage)
  expect(readConsent(storage)).toBe('granted')

  writeConsent('denied', storage)
  expect(readConsent(storage)).toBe('denied')

  storage.setItem('cookie-consent', 'maybe')
  expect(readConsent(storage)).toBeNull()
})

test('blocked storage never throws and reads as no decision', () => {
  expect(readConsent(throwingStorage)).toBeNull()
  expect(() => {
    writeConsent('granted', throwingStorage)
  }).not.toThrow()
})
