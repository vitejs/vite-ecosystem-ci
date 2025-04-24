import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
		beforeTest: 'pnpm playwright install chromium',
		test: ['check:lint', 'check:types', 'test'],
		overrides: {
			'svelte-check': true,
			'@sveltejs/kit': true,
		},
	})
}
