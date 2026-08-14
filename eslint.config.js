import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginSvelte.configs['flat/recommended'],
  // TypeScript inside .svelte files (type annotations, generics).
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  // {@html} is the app's injection point for engine-generated sheet markup —
  // ALL user-supplied text (titles, manual prompts, answers) is escaped at
  // render time (src/render/html.ts, covered by tests/unit/manual.test.ts).
  {
    files: ['**/*.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.svelte'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },
  // Determinism contract for the engine: no wall-clock, no non-seeded randomness.
  // All randomness must come from the frozen RNG in src/engine/rng.ts.
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'Date',
          message: 'Date is banned in the engine — determinism requires no wall-clock access.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Use the frozen RNG from src/engine/rng.ts — determinism requires a seeded source.',
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
