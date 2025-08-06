import js from '@eslint/js';

export default [
  {
    ignores: ['dist/', 'node_modules/', '*.js', '!eslint.config.js']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        performance: 'readonly',
        window: 'readonly',
        document: 'readonly',
        p5: 'readonly'
      }
    },
    rules: {
      // 程式碼品質規則
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      
      // 程式碼風格
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      // 函數規則
      'max-len': ['warn', { code: 120, ignoreComments: true }],
      'max-params': ['warn', 5],
      'complexity': ['warn', 15],

      // 允許 console（遊戲除錯需要）
      'no-console': 'off'
    }
  }
];