module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint'
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js'
  ],
  rules: {
    // TypeScript 規則
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',

    // 程式碼品質規則
    'no-console': 'off', // 允許 console.log（遊戲除錯需要）
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    
    // 命名規則
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']
      },
      {
        selector: 'class',
        format: ['PascalCase']
      },
      {
        selector: 'method',
        format: ['camelCase']
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE']
      }
    ],

    // 程式碼風格
    'indent': 'off',
    '@typescript-eslint/indent': ['error', 2],
    'quotes': 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // 函數規則
    'max-len': ['warn', { code: 120, ignoreComments: true }],
    'max-params': ['warn', 5],
    'complexity': ['warn', 10],

    // p5.js 和遊戲開發特殊規則
    '@typescript-eslint/no-unsafe-member-access': 'off', // p5.js 的動態屬性
    '@typescript-eslint/no-unsafe-call': 'off', // p5.js 的動態方法調用
    '@typescript-eslint/no-unsafe-assignment': 'off', // p5.js 的動態賦值
    '@typescript-eslint/restrict-template-expressions': 'off', // 模板字串靈活性
    '@typescript-eslint/no-floating-promises': 'off', // 遊戲循環中的異步操作

    // 效能相關規則
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-includes': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn'
  },
  overrides: [
    // 測試檔案的特殊規則
    {
      files: ['**/*.test.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-len': 'off'
      }
    },
    // 型別定義檔案的特殊規則
    {
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  settings: {
    // 如果需要的話，可以添加特定的設定
  }
};