module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: ['./node_modules/eslint-prettier-config-airbnb-ts'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'off',
    'no-empty-function': 'off',
    'no-useless-constructor': 'off',
    'max-classes-per-file': 'off',
  },
}
