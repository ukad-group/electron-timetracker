module.exports = {
  extends: [
    'plugin:prettier/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  rules: {
    "prettier/prettier": ["error"]
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  parser: "@babel/eslint-parser",
}