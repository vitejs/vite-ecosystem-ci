// @ts-check
import eslint from '@eslint/js'
import pluginN from 'eslint-plugin-n'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: ['workspace/**'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		name: 'main',
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2022,
				project: true,
			},
		},
		plugins: {
			n: pluginN,
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
					destructuring: 'all',
				},
			],
			'n/no-missing-import': 'off', // doesn't like ts imports
			'n/no-process-exit': 'off',
			'@typescript-eslint/no-explicit-any': 'off', // we use any in some places
		},
	},
)
