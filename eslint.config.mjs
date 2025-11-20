// @ts-no-check
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import unusedImports from 'eslint-plugin-unused-imports'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  plugins: {
    'unused-imports': unusedImports,
    'better-tailwindcss': eslintPluginBetterTailwindcss,
  },
  settings: {},
  rules: {
    ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
    'better-tailwindcss/no-unregistered-classes': 'off',
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    'unused-imports/no-unused-imports': 'error',
    '@stylistic/object-property-newline': 'error',
    '@stylistic/object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          minProperties: 1,
          consistent: true,
        },
        ObjectPattern: {
          multiline: true,
          minProperties: 1,
          consistent: true,
        },
        ImportDeclaration: {
          multiline: true,
          consistent: true,
        },
      },
    ],
    '@stylistic/template-curly-spacing': 'error',
    '@stylistic/brace-style': [
      'error',
      '1tbs',
      {
        allowSingleLine: true,
      },
    ],
    '@stylistic/max-len': [
      'error',
      {
        code: 120,
        ignoreTrailingComments: true,
        ignoreRegExpLiterals: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignorePattern: '^\\s*(<[a-zA-Z]+\\s|d="[^"]*"|[a-zA-Z-]+="[^"]*")',
      },
    ],
    'vue/max-len': [
      'error',
      {
        code: 120,
        ignoreTrailingComments: true,
        ignoreRegExpLiterals: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignorePattern: '^\\s*(<[a-zA-Z]+\\s|d="[^"]*"|[a-zA-Z-]+="[^"]*")',
      },
    ],
    'vue/multiline-html-element-content-newline': [
      'error',
      {
        ignoreWhenEmpty: true,
        allowEmptyLines: false,
      },
    ],
    '@stylistic/indent': ['error', 2],
    '@stylistic/indent-binary-ops': ['error', 2],
    '@stylistic/array-element-newline': ['error', 'consistent'],
    'vue/array-element-newline': ['error', 'consistent'],
    '@stylistic/multiline-ternary': ['error', 'always-multiline'],
    'vue/multiline-ternary': ['error', 'always-multiline'],
    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/func-call-spacing': 'off',
    '@stylistic/no-multi-spaces': 'error',
    '@stylistic/operator-linebreak': 'error',
    '@stylistic/nonblock-statement-body-position': 'error',
    '@stylistic/padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: ['block-like', 'multiline-expression', 'multiline-const', 'multiline-let'],
        next: '*',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['block-like', 'export', 'break'],
      },
      {
        blankLine: 'always',
        prev: ['const', 'let'],
        next: 'expression',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      },
    ],
    'tailwindcss/no-custom-classname': 'off',
    '@typescript-eslint/unified-signatures': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-require-imports': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    'func-style': 'error',
    'prefer-arrow-callback': 'error',
    'no-param-reassign': 'error',
    'dot-notation': 'error',
    'no-else-return': 'error',
    'no-multi-assign': 'error',
    'radix': 'error',
    'no-new-wrappers': 'error',
    'no-case-declarations': 'error',
    'no-unneeded-ternary': 'error',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/newline-after-import': 'error',
    'import/no-named-as-default-member': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off',
    'prefer-regex-literals': 'off',
    'require-await': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'any',
        math: 'any',
      },
    ],
    'vue/eqeqeq': 'error',
    'vue/html-closing-bracket-newline': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-reserved-props': [
      'error',
      {
        vueVersion: 3,
      },
    ],
    'vue/no-v-for-template-key': 'off',
    'vue/no-v-html': 'off',
    'vue/no-v-model-argument': 'off',
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/block-lang': [
      'error',
      {
        script: {
          lang: ['ts', 'tsx'],
        },
      },
    ],
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/require-default-prop': 'off',
    'vue/no-ref-object-reactivity-loss': 'error',
    'vue/v-on-event-hyphenation': 'off',
    'vue/object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          minProperties: 3,
          consistent: true,
        },
      },
    ],
    'vue/object-property-newline': [
      'error',
      {
        allowAllPropertiesOnSameLine: false,
      },
    ],
    'vue/define-macros-order': [
      'error',
      {
        order: ['defineEmits', 'defineProps', 'defineOptions', 'defineSlots', 'defineExpose'],
        defineExposeLast: false,
      },
    ],
  },
})
