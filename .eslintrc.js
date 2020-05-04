module.exports = {
  globals: {
    __PATH_PREFIX__: true,
  },
  /*
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  */
  extends: [
    'react-app',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    'simple-import-sort/sort': 'error',
  },
  plugins: ['simple-import-sort'],
  settings: {
    react: {
      version: 'detect',
    },
  },
}
