import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const browserGlobals = Object.fromEntries([
  'AbortController', 'Blob', 'CustomEvent', 'Event', 'FileReader', 'FormData',
  'HTMLElement', 'Image', 'URL', 'URLSearchParams', 'WebSocket', 'clearInterval',
  'clearTimeout', 'console', 'document', 'fetch', 'localStorage', 'navigator',
  'requestAnimationFrame', 'cancelAnimationFrame', 'setInterval', 'setTimeout', 'window',
].map((name) => [name, 'readonly']));

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['src/**/*.{js,jsx}', 'e2e/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...browserGlobals, process: 'readonly' },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/jsx-key': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'off',
      'react/jsx-no-target-blank': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];