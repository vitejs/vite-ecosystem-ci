import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		beforeTest: 'pnpm playwright install chromium',
		test: ['check:lint', 'check:types', 'test'],
		overrides: {
			'@sveltejs/load-config': true,
			'svelte-check': true,
			'@sveltejs/kit': true,
		},
	})
}
