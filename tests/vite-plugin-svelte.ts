import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
		overrides: {
			svelte: 'latest',
		},
		beforeTest: 'pnpm playwright install chromium',
		test: ['check:lint', 'check:types', 'test'],
	})
}
