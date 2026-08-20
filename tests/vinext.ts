import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'cloudflare/vinext',
		branch: 'main',
		beforeInstall: 'vite-ecosystem-ci:before-install',
		build: 'vite-ecosystem-ci:build',
		test: 'vite-ecosystem-ci:test',
		overrides: {
			'@vitejs/plugin-rsc': true,
		},
	})
}
