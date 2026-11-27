import playwright from 'eslint-plugin-playwright'
import type { UserConfig } from 'vite-plus'

type LintConfig = NonNullable<UserConfig['lint']>

// Warnings are banned: every rule is either an error or off.
type Rules = Record<string, 'error' | 'off' | ['error', ...unknown[]]>

const rules: Rules = {
  'vite-plus/prefer-vite-plus-imports': 'error',

  curly: ['error', 'all'],
  'import/no-unassigned-import': 'off',
  'import/no-named-as-default-member': 'off',

  'object-shorthand': ['error', 'always', { avoidQuotes: true, ignoreConstructors: false }],
  'no-else-return': ['error', { allowElseIf: false }],
  'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
  'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
  'no-restricted-exports': ['error', { restrictDefaultExports: { direct: true } }],
  'unicorn/prefer-global-this': 'error',

  'typescript/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
  ],
  'typescript/consistent-type-exports': 'error',
  'typescript/method-signature-style': 'error',
  'typescript/no-import-type-side-effects': 'error',

  // Hand-picked rules (whole-category `style`/`restriction` enable was tried and
  // rejected: it turns on rules that ban core language
  // features this codebase relies on — `oxc/no-async-await`, `oxc/no-optional-chaining` —
  // and mutually contradictory ones — `import/no-named-export` vs `import/prefer-default-export`.
  // This list keeps only the genuinely valuable, non-conflicting ones.
  'typescript/no-explicit-any': 'error',
  'typescript/no-non-null-assertion': 'off',
  'typescript/no-dynamic-delete': 'error',
  'typescript/no-empty-object-type': 'error',
  'typescript/no-invalid-void-type': 'error',
  'typescript/no-namespace': 'error',
  'typescript/no-restricted-types': 'error',
  'typescript/non-nullable-type-assertion-style': 'error',
  'typescript/prefer-literal-enum-member': 'error',
  'typescript/promise-function-async': 'error',
  'typescript/use-unknown-in-catch-callback-variable': 'error',
  'typescript/explicit-function-return-type': 'off',
  'typescript/explicit-module-boundary-types': 'error',
  'typescript/explicit-member-accessibility': 'error',
  'typescript/no-require-imports': 'error',
  'typescript/no-var-requires': 'error',
  'typescript/consistent-type-definitions': ['error', 'interface'],

  'unicorn/prefer-node-protocol': 'error',
  'unicorn/prefer-module': 'error',
  'unicorn/prefer-number-properties': 'error',
  'unicorn/prefer-modern-math-apis': 'error',
  'unicorn/no-process-exit': 'error',
  'unicorn/no-abusive-eslint-disable': 'error',
  'unicorn/no-anonymous-default-export': 'error',
  'unicorn/no-length-as-slice-end': 'error',
  'unicorn/no-magic-array-flat-depth': 'error',
  'unicorn/no-document-cookie': 'error',

  'import/no-cycle': 'error',
  'import/no-dynamic-require': 'error',
  'import/no-amd': 'error',
  'import/no-commonjs': 'error',
  'import/no-webpack-loader-syntax': 'error',

  'no-var': 'error',
  'no-implicit-globals': 'error',
  'no-param-reassign': 'error',
  'no-alert': 'error',
  'no-sequences': 'error',
  'no-empty': 'error',
  'no-empty-function': 'error',
  'logical-assignment-operators': 'error',
  complexity: 'error',
  'max-params': ['error', { max: 4 }],

  'oxc/bad-bitwise-operator': 'error',
  'oxc/no-const-enum': 'error',
  'oxc/no-barrel-file': 'error',

  // Type-aware rules (require `options.typeAware`, see below)
  'typescript/no-unnecessary-condition': 'error',
  'typescript/prefer-optional-chain': 'error',
  'typescript/prefer-readonly': 'error',
  'typescript/prefer-string-starts-ends-with': 'error',

  // React / a11y / tests / promises. Plugin defaults stay on; only the noisy ones are switched off.
  // The automatic JSX runtime makes `React` in scope unnecessary.
  'react/react-in-jsx-scope': 'off',

  // Picked from the `restriction` category (the whole category is too noisy).
  'no-console': 'error',
  'no-plusplus': 'error',

  'typescript/prefer-readonly-parameter-types': 'off',
  'require-await': 'off',
}

// The plugin's recommended rules, with its warnings raised to errors.
const playwrightRules: Rules = Object.fromEntries(
  Object.entries(playwright.configs['flat/recommended'].rules ?? {}).map(([name, level]) => [
    name,
    level === 'off' ? 'off' : 'error',
  ]),
)

export const lintConfig: LintConfig = {
  env: {
    builtin: true,
  },
  ignorePatterns: ['build', '.react-router', '.wrangler', '.claude'],
  plugins: [
    'typescript',
    'unicorn',
    'oxc',
    'import',
    'react',
    'react-perf',
    'jsx-a11y',
    'vitest',
    'promise',
  ],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'error',
    pedantic: 'error',
  },
  jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
  rules,
  overrides: [
    {
      // Frameworks and tools load these files through their default export.
      files: [
        '*.config.ts',
        'app/root.tsx',
        'app/routes.ts',
        'app/routes/*.{ts,tsx}',
        'workers/app.ts',
      ],
      rules: { 'no-restricted-exports': 'off' },
      env: {
        worker: true,
        browser: true,
      },
    },
    {
      // Tests build fixtures and stubs where narrowing assertions and sequential awaits are fine.
      files: ['**/*.test.{ts,tsx}', 'e2e/**', '**/*.spec.{ts,tsx}'],
      rules: {
        'typescript/no-unsafe-type-assertion': 'off',
        'no-await-in-loop': 'off',
        // Async stubs satisfy Promise-returning signatures without awaiting anything.
        'typescript/require-await': 'off',
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['e2e/**'],
      jsPlugins: ['eslint-plugin-playwright'],
      rules: {
        ...playwrightRules,
        // Helpers that assert on a test's behalf.
        'playwright/expect-expect': ['error', { assertFunctionNames: ['expectBelowHeader'] }],
      },
    },
    {
      // Build scripts run one image/file at a time, log to the console and exit with a status code.
      files: ['scripts/**'],
      rules: {
        'no-await-in-loop': 'off',
        'unicorn/no-process-exit': 'off',
        'no-console': 'off',
      },
    },
  ],
  options: { typeAware: true, typeCheck: true },
}
