import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: options.viteMajor === 4 ? 'main' : 'v1',
		overrides: {
			svelte: 'latest',
		},
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: ['lint', 'test'],
	})
}
