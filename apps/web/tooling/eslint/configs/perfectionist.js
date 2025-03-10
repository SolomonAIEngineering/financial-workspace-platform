import { defineConfig } from '../utils.js';
import perfectionist from 'eslint-plugin-perfectionist';

export default defineConfig(perfectionist.configs['recommended-natural'], {
  rules: {
    '@typescript-eslint/adjacent-overload-signatures': 'off',
    'perfectionist/sort-array-includes': [
      'off',
      {
        groupKind: 'literals-first',
        type: 'natural',
      },
    ],
    'perfectionist/sort-classes': [
      'off',
      {
        groups: [
          'index-signature',
          'static-property',
          'private-property',
          'protected-property',
          'property',
          'constructor',
          'static-method',
          'private-method',
          'protected-method',
          'method',
          ['get-method', 'set-method'],
          'static-block',
          'unknown',
        ],
        type: 'natural',
      },
    ],
    'perfectionist/sort-decorators': [
      'off',
      {
        type: 'natural',
      },
    ],
    'perfectionist/sort-enums': [
      'off',
      {
        sortByValue: true,
        type: 'natural',
      },
    ],
    'perfectionist/sort-exports': [
      'off',
      {
        groupKind: 'types-first',
        type: 'natural',
      },
    ],
    'perfectionist/sort-heritage-clauses': [
      'off',
      {
        type: 'natural',
      },
    ],
    'perfectionist/sort-imports': [
      // 'off',
      'off',
      {
        customGroups: {
          type: {
            next: '^next$',
            react: '^react$',
          },
          value: {
            next: ['^next$'],
            react: ['^react$', '^react-.*$'],
          },
        },
        groups: [
          'react',
          ['type', 'internal-type'],
          'next',
          ['builtin', 'external'],
          'internal',
          ['parent-type', 'sibling-type', 'index-type'],
          ['parent', 'sibling', 'index'],
          'side-effect',
          'style',
          'object',
          'unknown',
        ],
        internalPattern: ['^@/.*'],
        type: 'natural',
      },
    ],
    'perfectionist/sort-interfaces': [
      'off',
      {
        customGroups: {
          key: ['^key$', '^keys$'],
          id: ['^id$', '^_id$'],
        },
        groupKind: 'required-first',
        groups: [
          'key',
          'id',
          'unknown',
          // 'multiline',
          'method',
        ],

        type: 'natural',
      },
    ],
    // breaking: ordering matters
    'perfectionist/sort-intersection-types': 'off',
    'perfectionist/sort-jsx-props': [
      'off',
      {
        customGroups: {
          key: ['^key$', '^keys$'],
          id: ['^id$', '^name$', '^testId$', '^data-testid$'],
          accessibility: [
            '^title$',
            '^alt$',
            '^placeholder$',
            '^label$',
            '^description$',
            '^fallback$',
          ],
          callback: ['^on[A-Z]', '^handle[A-Z]'],
          className: ['^className$', '^class$', '^style$'],
          control: ['^asChild$', '^as$'],
          data: ['^data-*', '^aria-*'],
          ref: ['^ref$', '^innerRef$'],
          state: [
            '^value$',
            '^checked$',
            '^selected$',
            '^open$',
            '^defaultValue$',
            '^defaultChecked$',
            '^defaultOpen$',
            '^disabled$',
            '^required$',
            '^readOnly$',
            '^loading$',
          ],
          variant: ['^variant$', '^size$', '^orientation$', '^color$'],
        },
        groups: [
          'id',
          'key',
          'ref',
          'control',
          'variant',
          'className',
          'state',
          'callback',
          'accessibility',
          'data',
          'unknown',
          'shorthand',
        ],
        type: 'natural',
      },
    ],
    'perfectionist/sort-modules': [
      'off',
      {
        groups: [
          'declare-enum',
          'export-enum',
          'enum',
          ['declare-interface', 'declare-type'],
          ['export-interface', 'export-type'],
          ['interface', 'type'],
          'declare-class',
          'class',
          'export-class',

          // 'declare-function',
          // 'export-function',
          // 'function',

          // 'unknown',
        ],
        type: 'natural',
      },
    ],
    'perfectionist/sort-named-exports': [
      'off',
      {
        groupKind: 'types-first',
        type: 'natural',
      },
    ],
    'perfectionist/sort-named-imports': [
      'off',
      {
        groupKind: 'types-first',
        type: 'natural',
      },
    ],
    'perfectionist/sort-object-types': [
      'off',
      {
        customGroups: {
          key: ['^key$', '^keys$'],
          id: ['^id$', '^_id$'],
          callback: ['^on[A-Z]', '^handle[A-Z]'],
        },
        groupKind: 'required-first',
        groups: [
          'key',
          'id',
          'unknown',
          // 'multiline',
          'method',
          'callback',
        ],
        newlinesBetween: 'never',
        type: 'natural',
      },
    ],
    'perfectionist/sort-objects': [
      'off',
      {
        customGroups: {
          key: ['^key$', '^keys$'],
          id: ['^id$', '^_id$'],
          callback: ['^on[A-Z]', '^handle[A-Z]'],
        },
        groups: [
          'key',
          'id',
          'unknown',
          // 'multiline',
          'method',
          'callback',
        ],
        // newlinesBetween: 'never',
        type: 'natural',
      },
    ],
    'perfectionist/sort-sets': [
      'off',
      {
        type: 'natural',
      },
    ],
    'perfectionist/sort-switch-case': [
      'off',
      {
        type: 'natural',
      },
    ],
    'perfectionist/sort-union-types': [
      'off',
      {
        groups: [
          'conditional',
          'function',
          'import',
          ['intersection', 'union'],
          'named',
          'operator',
          'object',
          'keyword',
          'literal',
          'tuple',
          'nullish',
          'unknown',
        ],
        type: 'natural',
      },
    ],
    'perfectionist/sort-variable-declarations': [
      'off',
      {
        type: 'natural',
      },
    ],
    'react/jsx-sort-props': 'off',
    'sort-imports': 'off',

    'sort-keys': 'off',
  },
  settings: {
    perfectionist: {
      ignoreCase: false,
    },
  },
});
