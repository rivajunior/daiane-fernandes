import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig, lazyPlugins } from 'vite-plus'

import { lintConfig } from './lint.config.ts'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    ignorePatterns: ['build'],
    semi: false,
    singleQuote: true,
    sortImports: true,
  },
  lint: lintConfig,
  // The Cloudflare and React Router plugins are for dev/build only; they break the test runner.
  plugins: lazyPlugins(() =>
    process.env.VITEST === undefined
      ? [cloudflare({ viteEnvironment: { name: 'ssr' } }), reactRouter()]
      : [],
  ),
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['app/**/*.test.{ts,tsx}'],
    setupFiles: ['./app/vitest.setup.ts'],
  },
})
