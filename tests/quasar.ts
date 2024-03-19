import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

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
