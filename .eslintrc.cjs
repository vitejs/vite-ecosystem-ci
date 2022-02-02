// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:node/recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',
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
		],
		'node/no-missing-import': 'off', // doesn't like ts imports
		'@typescript-eslint/no-explicit-any': 'off' // we use any in some places
	}
})
