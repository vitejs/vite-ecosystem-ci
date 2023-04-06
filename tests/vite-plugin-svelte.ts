import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'fix/hmr-test-flake-vite4.3',
		overrides: {
			svelte: 'latest',
		},
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: ['lint', 'test'],
	})
}
