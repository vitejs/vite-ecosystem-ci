import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'quasarframework/quasar',
		branch: 'dev',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		build: 'vite-ecosystem-ci:build',
		test: 'vite-ecosystem-ci:test',
	})
}
