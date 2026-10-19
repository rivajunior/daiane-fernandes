import process from 'node:process'

import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'node_modules/.cache/playwright/results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173' },
  projects: [{ name: 'chromium', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npx vite preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !isCI,
  },
})
