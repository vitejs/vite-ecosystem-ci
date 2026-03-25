// @ts-check
import eslint from '@eslint/js'
import n from 'eslint-plugin-n'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier/flat'

export default tseslint.config([
	{
		name: 'local/ignores',
		ignores: ['workspace/**'],
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	n.configs['flat/recommended-module'],
	prettierConfig,
	{
		name: 'local/rules',
		files: ['**/*.{js,ts}'],
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
			'n/no-process-exit': 'off',
			'@typescript-eslint/no-explicit-any': 'off', // we use any in some places
		},
	},
])
