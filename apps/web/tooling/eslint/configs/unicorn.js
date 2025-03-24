import { defineConfig } from '../utils.js';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default defineConfig(eslintPluginUnicorn.configs['flat/recommended'], {
  rules: {
    'unicorn/consistent-destructuring': 'off',
    'unicorn/consistent-function-scoping': [
      'error',
      {
        checkArrowFunctions: false,
      },
    ],

    'unicorn/prefer-switch': 'off',
    'unicorn/no-document-cookie': 'off',
    'unicorn/empty-brace-spaces': 'off',
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-await-expression-member': 'off',
    // TypeScript doesn't like the for-of loop this rule fixes to
    'unicorn/no-for-loop': 'off',
    'unicorn/no-negated-condition': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-useless-spread': 'off',
    'unicorn/prefer-dom-node-append': 'off',
    'unicorn/prefer-export-from': 'off',
    'unicorn/prefer-global-this': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-query-selector': 'off',
    // Spread syntax causes non-deterministic type errors
    'unicorn/prefer-spread': 'off',
    'unicorn/prefer-ternary': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/catch-error-name': 'off',
    'unicorn/switch-case-braces': 'off',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-includes': 'off',
    'unicorn/no-zero-fractions': 'off',
    'unicorn/new-for-builtins': 'off',
    'unicorn/prefer-at': 'off',
    'unicorn/prefer-string-replace-all': 'off',
    'unicorn/prefer-optional-catch-binding': 'off',
    'unicorn/prefer-at': 'off',
    'unicorn/prefer-math-min-max': 'off',
    'unicorn/prefer-string-slice': 'off',
    'unicorn/prefer-array-flat': 'off',
    'unicorn/no-object-as-default-parameter': 'off',
    'unicorn/no-lonely-if': 'off',
    'unicorn/no-array-reduce-type-parameter': 'off',
    'unicorn/explicit-length-check': 'off',
    'prefer-const': 'off',
    'unicorn/prefer-code-point': 'off',
  },
});
