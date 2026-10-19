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
  'no-shadow': 'error',
  'no-restricted-exports': ['error', { restrictDefaultExports: { direct: true } }],
  'unicorn/prefer-global-this': 'error',

  'typescript/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
  ],
  'typescript/consistent-type-exports': 'error',
  'typescript/method-signature-style': 'error',
  'typescript/no-unnecessary-type-conversion': 'error',
  'typescript/no-import-type-side-effects': 'error',

  // Hand-picked strict/pedantic rules (whole-category `pedantic`/`style`/`restriction`
  // enable was tried and rejected: it turns on rules that ban core language
  // features this codebase relies on — `oxc/no-async-await`, `oxc/no-optional-chaining` —
  // and mutually contradictory ones — `import/no-named-export` vs `import/prefer-default-export`.
  // This list keeps only the genuinely valuable, non-conflicting ones.
  'typescript/no-explicit-any': 'error',
  'typescript/no-non-null-assertion': 'off',
  'typescript/no-non-null-asserted-nullish-coalescing': 'error',
  'typescript/no-dynamic-delete': 'error',
  'typescript/no-empty-object-type': 'error',
  'typescript/no-invalid-void-type': 'error',
  'typescript/no-namespace': 'error',
  'typescript/no-restricted-types': 'error',
  'typescript/non-nullable-type-assertion-style': 'error',
  'typescript/prefer-literal-enum-member': 'error',
  'typescript/prefer-promise-reject-errors': 'error',
  'typescript/promise-function-async': 'error',
  'typescript/use-unknown-in-catch-callback-variable': 'error',
  'typescript/explicit-function-return-type': 'off',
  'typescript/explicit-module-boundary-types': 'error',
  'typescript/explicit-member-accessibility': 'error',
  'typescript/no-require-imports': 'error',
  'typescript/no-var-requires': 'error',

  'unicorn/prefer-node-protocol': 'error',
  'unicorn/prefer-module': 'error',
  'unicorn/prefer-number-properties': 'error',
  'unicorn/prefer-modern-math-apis': 'error',
  'unicorn/no-process-exit': 'error',
  'unicorn/no-abusive-eslint-disable': 'error',
  'unicorn/no-anonymous-default-export': 'error',
  'unicorn/no-useless-error-capture-stack-trace': 'error',
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
  'no-await-in-loop': 'error',
  'no-promise-executor-return': 'error',
  'no-sequences': 'error',
  'no-empty': 'error',
  'no-empty-function': 'error',
  'require-unicode-regexp': 'error',
  'logical-assignment-operators': 'error',
  complexity: 'error',
  'max-params': ['error', { max: 4 }],

  'oxc/bad-bitwise-operator': 'error',
  'oxc/no-const-enum': 'error',

  // Type-aware rules (require `options.typeAware`, see below)
  'typescript/await-thenable': 'error',
  'typescript/no-array-delete': 'error',
  'typescript/no-base-to-string': 'error',
  'typescript/no-duplicate-type-constituents': 'error',
  'typescript/no-floating-promises': 'error',
  'typescript/no-for-in-array': 'error',
  'typescript/no-implied-eval': 'error',
  'typescript/no-misused-promises': 'error',
  'typescript/no-mixed-enums': 'error',
  'typescript/no-redundant-type-constituents': 'error',
  'typescript/no-unnecessary-type-assertion': 'error',
  'typescript/no-unsafe-argument': 'error',
  'typescript/no-unsafe-assignment': 'error',
  'typescript/no-unsafe-call': 'error',
  'typescript/no-unsafe-enum-comparison': 'error',
  'typescript/no-unsafe-member-access': 'error',
  'typescript/no-unsafe-return': 'error',
  'typescript/require-await': 'error',
  'typescript/restrict-template-expressions': 'error',
  'typescript/switch-exhaustiveness-check': 'error',
  'typescript/unbound-method': 'error',
  'typescript/no-unnecessary-condition': 'error',
  'typescript/prefer-includes': 'error',
  'typescript/prefer-nullish-coalescing': 'error',
  'typescript/prefer-optional-chain': 'error',
  'typescript/prefer-readonly': 'error',
  'typescript/prefer-string-starts-ends-with': 'error',
  'typescript/strict-boolean-expressions': 'error',

  // React / a11y / tests / promises. Plugin defaults stay on; only the noisy ones are switched off.
  // The automatic JSX runtime makes `React` in scope unnecessary.
  'react/react-in-jsx-scope': 'off',

  // Picked from the `pedantic` / `restriction` categories (whole categories are too noisy).
  'typescript/no-confusing-void-expression': 'error',
  'unicorn/prefer-string-replace-all': 'error',
  'unicorn/prefer-code-point': 'error',
  'unicorn/no-useless-promise-resolve-reject': 'error',
  'no-negated-condition': 'error',
  'unicorn/no-negated-condition': 'error',
  'no-console': 'error',
  'no-plusplus': 'error',
}

export const lintConfig: LintConfig = {
  env: {
    builtin: true,
  },
  ignorePatterns: ['build', '.react-router', '.wrangler'],
  plugins: ['typescript', 'unicorn', 'oxc', 'import', 'react', 'jsx-a11y', 'vitest', 'promise'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'error',
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
      files: ['**/*.test.{ts,tsx}', 'e2e/**'],
      rules: {
        'typescript/no-unsafe-type-assertion': 'off',
        'no-await-in-loop': 'off',
        // Async stubs satisfy Promise-returning signatures without awaiting anything.
        'typescript/require-await': 'off',
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
