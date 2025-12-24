// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // 1. Force Signal-based APIs (input, output, viewChild, etc.)
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-signal-model': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      // 2. Dependency Injection: Prefer inject() over constructor
      '@angular-eslint/prefer-inject': 'error',
      // 3. Strict Naming & Structure
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: [],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      // 4. Strict Types & Decorators
      '@typescript-eslint/no-explicit-any': 'error',
      '@angular-eslint/no-attribute-decorator': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',

      // 5. Component Best Practices
      '@angular-eslint/use-component-view-encapsulation': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      // 6. Force modern control flow (@if, @for)
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',

      // 7. Clean Templates
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/conditional-complexity': ['error', { maxComplexity: 3 }],
    },
  },
]);
