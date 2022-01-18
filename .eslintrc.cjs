// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
	root: true,
	extends: ['eslint:recommended', 'plugin:node/recommended'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2021
	},
	rules: {
		eqeqeq: ['warn', 'always', { null: 'never' }],
		'no-debugger': ['error'],
		'no-empty': ['warn', { allowEmptyCatch: true }],
		'no-process-exit': 'off',
		'no-useless-escape': 'off',
		'prefer-const': [
			'warn',
			{
				destructuring: 'all'
			}
		]
	}
})
